import { FaturadoPor, Prisma, StatusContrato, StatusProjecao, TipoDocumento } from "@prisma/client";
import { prisma } from "../../config/prisma-client";
import { ContatoInput, EmpresaInput } from "../../dto/EmpresaDto";
import { registrarEvento } from "../../shared/utils/registrarEvento";
import { Decimal } from "@prisma/client/runtime/library";

export type EmpresaComRelacionamentos = Prisma.empresaGetPayload<{
  include: {
    unidades: {
      include: {
        contatos: true;
        contratos: true;
      };
    };
  };
}>;

function calcularMesesEntre(inicio: Date, fim: Date): number {
  let anos = fim.getFullYear() - inicio.getFullYear();
  let meses = fim.getMonth() - inicio.getMonth();

  let total = anos * 12 + meses;

  // soma +1 se o dia do fim for >= dia do início
  if (fim.getDate() >= inicio.getDate()) {
    total += 1;
  }

  return total;
}

export async function gerarProjecoesParaContrato(
  tx: Prisma.TransactionClient,
  contrato: {
    idContrato: number;
    dataInicio: string | Date;
    dataFim: string | Date;
    parcelas: number;
    valorBase: string | number | Decimal;
    porVida: boolean;
    recorrente: boolean;
    vidas?: number;
  }
) {
  const {
    idContrato,
    dataInicio,
    dataFim,
    parcelas,
    valorBase,
    porVida,
    recorrente,
    vidas = 0,
  } = contrato;

  const dataInicial = new Date(dataInicio);
  const dataFinal = new Date(dataFim);
  const valor = typeof valorBase === "string" ? parseFloat(valorBase) : Number(valorBase);

  const projecoes: {
    fkContratoId: number;
    competencia: string;
    valorPrevisto: number;
    status: StatusProjecao;
    vidas?: number;
  }[] = [];

  const mesesParaProjetar =
    recorrente || porVida ? calcularMesesEntre(dataInicial, dataFinal) : parcelas;

  const ano = dataInicial.getFullYear();
  const mes = dataInicial.getMonth() + 1;
  const data = new Date(ano, mes, 1);

  for (let i = 0; i < mesesParaProjetar; i++) {
    const competencia = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`;

    let valorPrevisto = 0;
    if (!recorrente && !porVida) {
      // MENSAL
      valorPrevisto = parseFloat((valor / parcelas).toFixed(2));
    } else if (recorrente && porVida) {
      // POR VIDA
      valorPrevisto = valor * vidas;
    } else if (recorrente && !porVida) {
      // RECORRENTE FIXO
      valorPrevisto = valor;
    } else {
      throw new Error("Configuração de contrato inválida: verifique flags recorrente/porVida.");
    }

    projecoes.push({
      fkContratoId: idContrato,
      competencia,
      valorPrevisto: parseFloat(valorPrevisto.toFixed(2)),
      vidas,
      status: "PENDENTE",
    });

    data.setMonth(data.getMonth() + 1);
  }

  await tx.projecao.createMany({ data: projecoes });
}

export async function excluirProjecoesFuturas(
  tx: Prisma.TransactionClient,
  fkContratoId: number
) {
  const hoje = new Date();
  const competenciaAtual = `${hoje.getFullYear()}-${String(
    hoje.getMonth() + 1
  ).padStart(2, "0")}`;

  await tx.projecao.deleteMany({
    where: {
      fkContratoId,
      competencia: { gt: competenciaAtual },
    },
  });
}

function parseDecimal(valor: string | number | undefined | null): string {
  if (!valor) return "0";
  if (typeof valor === "number") return valor.toFixed(2);
  return valor.replace(",", ".");
}

export async function sincronizarProjecoesParaContrato(
  tx: Prisma.TransactionClient,
  contrato: {
    idContrato: number;
    dataInicio: string | Date;
    dataFim: string | Date;
    parcelas: number;
    valorBase: string | number | Decimal;
    porVida: boolean;
    recorrente: boolean;
    vidas?: number;
  }
) {
  const {
    idContrato,
    dataInicio,
    dataFim,
    parcelas,
    valorBase,
    porVida,
    recorrente,
    vidas = 0,
  } = contrato;

  const dataInicial = new Date(dataInicio);
  const dataFinal = new Date(dataFim);
  const valor = typeof valorBase === "string" ? parseFloat(valorBase) : Number(valorBase);

  const meses = recorrente || porVida ? calcularMesesEntre(dataInicial, dataFinal) : parcelas;

  const novasProjecoes: Record<string, number> = {};

  const ano = dataInicial.getFullYear();
  const mes = dataInicial.getMonth() + 1;
  const data = new Date(ano, mes, 1);

  for (let i = 0; i < meses; i++) {
    const competencia = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`;

    let valorPrevisto = 0;
    if (!recorrente && !porVida) {
      // MENSAL
      valorPrevisto = parseFloat((valor / parcelas).toFixed(2));
    } else if (recorrente && porVida) {
      // POR VIDA
      valorPrevisto = valor * vidas;
    } else if (recorrente && !porVida) {
      // RECORRENTE FIXO
      valorPrevisto = valor;
    } else {
      throw new Error("Configuração de contrato inválida: verifique flags recorrente/porVida.");
    }

    novasProjecoes[competencia] = parseFloat(valorPrevisto.toFixed(2));

    // 👉 avança um mês no final do loop
    data.setMonth(data.getMonth() + 1);
  }

  const existentes = await tx.projecao.findMany({
    where: { fkContratoId: idContrato },
  });

  const existentesMap = new Map(existentes.map((p) => [p.competencia, p]));

  for (const [competencia, valorPrevisto] of Object.entries(novasProjecoes)) {
    const projExistente = existentesMap.get(competencia);

    if (projExistente) {
      if (projExistente.status === "PENDENTE") {
        await tx.projecao.update({
          where: { idProjecao: projExistente.idProjecao },
          data: { valorPrevisto, vidas },
        });
      }
      existentesMap.delete(competencia);
    } else {
      await tx.projecao.create({
        data: {
          fkContratoId: idContrato,
          competencia,
          valorPrevisto,
          vidas,
          status: "PENDENTE",
        },
      });
    }
  }

  // Exclui competências antigas não mais previstas
  for (const projOutdated of existentesMap.values()) {
    if (projOutdated.status === "PENDENTE") {
      await tx.projecao.delete({
        where: { idProjecao: projOutdated.idProjecao },
      });
    }
  }
}

function gerarChaveContato(c: any) {
  return `${(c.nome || '').trim().toLowerCase()}|${(c.email || '').trim().toLowerCase()}|${(c.telefoneWpp || '').trim()}`;
}

export const buscarEmpresa = {
  async execute(id: number): Promise<EmpresaComRelacionamentos | null> {
    return await prisma.empresa.findUnique({
      where: { idEmpresa: id },
      include: {
        unidades: {
          include: {
            contatos: {
              include: {
                contato: true,
              },
            },
            contratos: true,
          },
        },
      },
    });
  },
};

export const buscarEmpresas = {
  async execute(termo: string): Promise<EmpresaComRelacionamentos[]> {
    return await prisma.empresa.findMany({
      where: {
        nome: { contains: termo },
      },
      include: {
        unidades: {
          include: {
            contatos: {
              include: {
                contato: true,
              },
            },
            contratos: true,
          },
        },
      },
      orderBy: { idEmpresa: "desc" },
    });
  },
};

export const buscarContatos = {
  async execute(idEmpresa: number) {
    const contatos = await prisma.contato.findMany({
      where: {
        unidades: {
          some: {
            unidade: {
              fkEmpresaId: idEmpresa,
            },
          },
        },
      },
      include: {
        unidades: {
          include: {
            unidade: true,
          },
        },
      },
    });

    return contatos;
  },
};

export const listarEmpresas = {
  async execute(): Promise<EmpresaComRelacionamentos[]> {
    return await prisma.empresa.findMany({
      orderBy: { idEmpresa: "desc" },
      include: {
        unidades: {
          include: {
            contatos: {
              include: {
                contato: true,
              },
            },
            contratos: true,
          },
        },
      },
    });
  },
};

export const criarEmpresa = {
  async execute(data: EmpresaInput) {
    const { idUsuario, unidades, ...dadosEmpresa } = data;

    try {
      // 1. Executa transação
      const empresaCriada = await prisma.$transaction(
        async (tx) => {
          const empresa = await tx.empresa.create({
            data: {
              nome: dadosEmpresa.nome,
              ativo: dadosEmpresa.ativo ?? true,
            },
          });

          if (Array.isArray(unidades) && unidades.length > 0) {
            for (const unidade of unidades) {
              const unidadeCriada = await tx.unidade.create({
                data: {
                  nomeFantasia: unidade.nomeFantasia,
                  razaoSocial: unidade.razaoSocial,
                  tipoDocumento: unidade.tipoDocumento as TipoDocumento,
                  documento: unidade.documento,
                  inscricaoEstadual: unidade.inscricaoEstadual,
                  endereco: unidade.endereco,
                  numero: unidade.numero,
                  complemento: unidade.complemento,
                  bairro: unidade.bairro,
                  cidade: unidade.cidade,
                  uf: unidade.uf,
                  cep: unidade.cep,
                  ativo: unidade.ativo ?? true,
                  observacao: unidade.observacao,
                  retemIss: unidade.retemIss ?? false,
                  fkEmpresaId: empresa.idEmpresa,
                },
              });

              // Contatos
              if (Array.isArray(unidade.contatos) && unidade.contatos.length > 0) {
                await tx.contato.createMany({
                  data: unidade.contatos.map((c) => ({
                    nome: c.nome,
                    email: c.email,
                    emailSecundario: c.emailSecundario,
                    telefoneFixo: c.telefoneFixo,
                    telefoneWpp: c.telefoneWpp,
                  })),
                });
              }

              // Contratos
              if (Array.isArray(unidade.contratos) && unidade.contratos.length > 0) {
                await Promise.all(
                  unidade.contratos.map(async (contrato) => {
                    const parcelas = contrato.recorrente
                      ? contrato.dataInicio && contrato.dataFim
                        ? calcularMesesEntre(
                          new Date(contrato.dataInicio),
                          new Date(contrato.dataFim)
                        )
                        : 0
                      : contrato.parcelas ?? 0;

                    const contratoCriado = await tx.contrato.create({
                      data: {
                        fkUnidadeId: unidadeCriada.idUnidade,
                        dataInicio: new Date(contrato.dataInicio),
                        dataFim: new Date(contrato.dataFim),
                        parcelas,
                        valorBase: contrato.valorBase,
                        porVida: contrato.porVida,
                        vidas: contrato.vidas,
                        recorrente: contrato.recorrente,
                        status: contrato.status as StatusContrato,
                        faturadoPor: contrato.faturadoPor as FaturadoPor,
                        esocial: contrato.esocial ?? false,
                        laudos: contrato.laudos ?? false,
                        observacao: contrato.observacao,
                        diaVencimento: contrato.diaVencimento ?? null,
                      },
                    });

                    if (contrato.status === "ATIVO") {
                      await gerarProjecoesParaContrato(tx, {
                        idContrato: contratoCriado.idContrato,
                        dataInicio: contratoCriado.dataInicio,
                        dataFim: contratoCriado.dataFim,
                        parcelas: contratoCriado.parcelas,
                        valorBase: contratoCriado.valorBase.toString(),
                        porVida: contratoCriado.porVida,
                        vidas: contratoCriado.vidas ?? 0,
                        recorrente: contratoCriado.recorrente,
                      });
                    }
                  })
                );
              }
            }
          }

          return empresa;
        },
        { timeout: 20000, maxWait: 20000 }
      );

      // 2. Buscar dados finais FORA da transação
      const empresaFinal = await prisma.empresa.findUnique({
        where: { idEmpresa: empresaCriada.idEmpresa },
        include: {
          unidades: {
            include: {
              contatos: { include: { contato: true } },
              contratos: true,
            },
          },
        },
      });

      // 3. Evento
      await registrarEvento({
        idUsuario,
        tipo: "criar",
        entidade: "empresa",
        entidadeId: empresaFinal?.idEmpresa,
        descricao: `Empresa '${empresaFinal?.nome}' criada com sucesso!`,
        dadosDepois: empresaFinal,
      });

      return empresaFinal;
    } catch (e: any) {
      await registrarEvento({
        idUsuario,
        tipo: "erro",
        entidade: "empresa",
        descricao: `Erro ao criar empresa: ${e.message}`,
      });
      throw new Error("Erro ao criar empresa: " + e.message);
    }
  },
};

export const editarEmpresa = {
  async execute(id: number, data: EmpresaInput) {
    const { idUsuario, unidades, ...dadosEmpresa } = data;

    const empresaAntes = await prisma.empresa.findUnique({
      where: { idEmpresa: id },
      include: {
        unidades: {
          include: { contatos: true, contratos: true },
        },
      },
    });

    try {
      // 1. Executa transação
      await prisma.$transaction(
        async (tx) => {
          // Atualiza empresa
          await tx.empresa.update({
            where: { idEmpresa: id },
            data: {
              nome: dadosEmpresa.nome,
              ativo: dadosEmpresa.ativo ?? true,
            },
          });

          // TODO: aqui mantem a mesma lógica de update/unidade/contato/contrato
          // mas dentro do `tx`, sempre usando `Promise.all` onde possível
        },
        { timeout: 20000, maxWait: 20000 }
      );

      // 2. Busca final fora do tx
      const empresaDepois = await prisma.empresa.findUnique({
        where: { idEmpresa: id },
        include: {
          unidades: {
            include: {
              contatos: { include: { contato: true } },
              contratos: true,
            },
          },
        },
      });

      // 3. Evento
      await registrarEvento({
        idUsuario,
        tipo: "editar",
        entidade: "empresa",
        entidadeId: id,
        descricao: `Empresa '${empresaDepois?.nome}' editada com sucesso!`,
        dadosAntes: empresaAntes,
        dadosDepois: empresaDepois,
      });

      return empresaDepois;
    } catch (e: any) {
      await registrarEvento({
        idUsuario,
        tipo: "erro",
        entidade: "empresa",
        entidadeId: id,
        descricao: `Erro ao editar empresa: ${e.message}`,
      });
      throw new Error("Erro ao editar empresa: " + e.message);
    }
  },
};