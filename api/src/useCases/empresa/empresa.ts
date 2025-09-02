import { FaturadoPor, Prisma, StatusContrato, StatusProjecao, TipoDocumento } from "@prisma/client";
import { prisma } from "../../config/prisma-client";
import { ContratoInput, EmpresaInput } from "../../dto/EmpresaDto";
import { registrarEvento } from "../../shared/utils/registrarEvento";
import { Decimal } from "@prisma/client/runtime/library";

export type EmpresaComRelacionamentos = Prisma.empresaGetPayload<{
  include: {
    unidades: {
      include: {
        contato: true;
        contratos: true;
      };
    };
  };
}>;

export async function gerarProjecoesParaContrato(contrato: {
  idContrato: number;
  dataInicio: string | Date;
  parcelas: number;
  valorBase: string | number | Decimal;
  porVida: boolean;
  recorrente: boolean;
  vidasAtivas?: number; // novo campo só para cálculo
}) {
  const {
    idContrato,
    dataInicio,
    parcelas,
    valorBase,
    porVida,
    recorrente,
    vidasAtivas = 0,
  } = contrato;

  const dataInicial = new Date(dataInicio);
  const valor = typeof valorBase === "string" ? parseFloat(valorBase) : Number(valorBase);

  const projecoes: {
    fkContratoId: number;
    competencia: string;
    valorPrevisto: number;
    status: StatusProjecao;
  }[] = [];

  const hoje = new Date();
  const fimMensal = new Date(dataInicial);
  fimMensal.setMonth(fimMensal.getMonth() + parcelas);

  const mesesParaProjetar = recorrente ? 12 : parcelas;

  for (let i = 0; i < mesesParaProjetar; i++) {
    const data = new Date(dataInicial);
    data.setMonth(data.getMonth() + i);

    // Se contrato é somente mensal (sem porVida ou recorrente)
    const competencia = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`;

    let valorPrevisto = 0;

    // MENSAL
    if (!porVida && !recorrente) {
      valorPrevisto = parseFloat((valor / parcelas).toFixed(2));
    }

    // POR VIDA
    if (porVida) {
      valorPrevisto += valor * vidasAtivas; // valor = valorPorVida
    }

    // RECORRENTE
    if (recorrente && !porVida && parcelas === 0) {
      valorPrevisto = valor;
    }

    // MENSAL + POR VIDA
    if (porVida && parcelas > 0) {
      valorPrevisto += parseFloat((valor / parcelas).toFixed(2));
    }

    projecoes.push({
      fkContratoId: idContrato,
      competencia,
      valorPrevisto: parseFloat(valorPrevisto.toFixed(2)),
      status: "PENDENTE",
    });
  }

  await prisma.projecao.createMany({ data: projecoes });
}

export async function excluirProjecoesFuturas(fkContratoId: number) {
  const hoje = new Date();
  const competenciaAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;

  await prisma.projecao.deleteMany({
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

export const buscarEmpresa = {
  async execute(id: number): Promise<EmpresaComRelacionamentos | null> {
    return await prisma.empresa.findUnique({
      where: { idEmpresa: id },
      include: {
        unidades: {
          include: {
            contato: true,
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
            contato: true,
            contratos: true,
          },
        },
      },
    });
  },
};

export const listarEmpresas = {
  async execute(): Promise<EmpresaComRelacionamentos[]> {
    return await prisma.empresa.findMany({
      orderBy: { nome: "asc" },
      include: {
        unidades: {
          include: {
            contato: true,
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
      // 1. Criar empresa
      const empresaCriada = await prisma.empresa.create({
        data: {
          nome: dadosEmpresa.nome,
          ativo: dadosEmpresa.ativo ?? true,
        },
      });

      // 2. Criar unidades
      if (Array.isArray(unidades) && unidades.length > 0) {
        for (const unidade of unidades) {
          const unidadeCriada = await prisma.unidade.create({
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
              fkEmpresaId: empresaCriada.idEmpresa,
            },
          });

          // 2.1 Contatos
          if (Array.isArray(unidade.contato) && unidade.contato.length > 0) {
            await prisma.contato.createMany({
              data: unidade.contato.map((c) => ({
                ...c,
                fkUnidadeId: unidadeCriada.idUnidade,
              })),
            });
          }

          // 2.2 Contratos
          if (Array.isArray(unidade.contratos) && unidade.contratos.length > 0) {
            for (const contrato of unidade.contratos) {
              const contratoCriado = await prisma.contrato.create({
                data: {
                  fkUnidadeId: unidadeCriada.idUnidade,
                  dataInicio: new Date(contrato.dataInicio),
                  dataFim: new Date(contrato.dataFim),
                  parcelas: contrato.parcelas,
                  valorBase: contrato.valorBase,
                  porVida: contrato.porVida,
                  recorrente: contrato.recorrente,
                  status: contrato.status as StatusContrato,
                  faturadoPor: contrato.faturadoPor as FaturadoPor,
                  observacao: contrato.observacao,
                },
              });

              // 2.3 Gerar projeções apenas para contratos ATIVOS
              if (contrato.status === "ATIVO") {
                await gerarProjecoesParaContrato({
                  idContrato: contratoCriado.idContrato,
                  dataInicio: contratoCriado.dataInicio,
                  parcelas: contratoCriado.parcelas,
                  valorBase: contratoCriado.valorBase.toString(),
                  porVida: contratoCriado.porVida,
                  recorrente: contratoCriado.recorrente,
                  vidasAtivas: contrato.vidasAtivas ?? 0
                });
              }
            }
          }
        }
      }

      // 3. Buscar dados finais com relacionamentos
      const empresaFinal = await prisma.empresa.findUnique({
        where: { idEmpresa: empresaCriada.idEmpresa },
        include: {
          unidades: {
            include: {
              contato: true,
              contratos: true,
            },
          },
        },
      });

      // 4. Registrar evento
      await registrarEvento({
        idUsuario,
        tipo: "criar",
        entidade: "empresa",
        entidadeId: empresaCriada.idEmpresa,
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
          include: {
            contato: true,
            contratos: true,
          },
        },
      },
    });

    try {
      await prisma.empresa.update({
        where: { idEmpresa: id },
        data: {
          nome: dadosEmpresa.nome,
          ativo: dadosEmpresa.ativo ?? true,
        },
      });

      const unidadesExistentes = empresaAntes?.unidades || [];
      const unidadesMap = new Map(unidades?.map(u => [u.documento, u]));

      for (const unidadeDB of unidadesExistentes) {
        const unidadeFront = unidadesMap.get(unidadeDB.documento);

        if (!unidadeFront) {
          await prisma.unidade.delete({ where: { idUnidade: unidadeDB.idUnidade } });
          continue;
        }

        await prisma.unidade.update({
          where: { idUnidade: unidadeDB.idUnidade },
          data: {
            nomeFantasia: unidadeFront.nomeFantasia,
            razaoSocial: unidadeFront.razaoSocial,
            tipoDocumento: unidadeFront.tipoDocumento as TipoDocumento,
            documento: unidadeFront.documento,
            inscricaoEstadual: unidadeFront.inscricaoEstadual,
            endereco: unidadeFront.endereco,
            numero: unidadeFront.numero,
            complemento: unidadeFront.complemento,
            bairro: unidadeFront.bairro,
            cidade: unidadeFront.cidade,
            uf: unidadeFront.uf,
            cep: unidadeFront.cep,
            ativo: unidadeFront.ativo ?? true,
            observacao: unidadeFront.observacao,
          },
        });

        // Contatos
        if (Array.isArray(unidadeFront.contato)) {
          await prisma.contato.deleteMany({ where: { fkUnidadeId: unidadeDB.idUnidade } });

          if (unidadeFront.contato.length > 0) {
            await prisma.contato.createMany({
              data: unidadeFront.contato.map((c) => ({
                ...c,
                fkUnidadeId: unidadeDB.idUnidade,
              })),
            });
          }
        }

        // Contratos
        if (Array.isArray(unidadeFront.contratos)) {
          const contratosDB = await prisma.contrato.findMany({
            where: { fkUnidadeId: unidadeDB.idUnidade },
          });

          const contratosMap = new Map(contratosDB.map(c => [c.idContrato, c]));

          for (const contrato of unidadeFront.contratos) {
            if (contrato.idContrato && contratosMap.has(contrato.idContrato)) {
              await prisma.contrato.update({
                where: { idContrato: contrato.idContrato },
                data: {
                  dataInicio: new Date(contrato.dataInicio),
                  dataFim: new Date(contrato.dataFim),
                  parcelas: contrato.parcelas,
                  valorBase: new Decimal(parseDecimal(contrato.valorBase)),
                  porVida: contrato.porVida,
                  recorrente: contrato.recorrente,
                  status: contrato.status as StatusContrato,
                  faturadoPor: contrato.faturadoPor as FaturadoPor,
                  observacao: contrato.observacao,
                },
              });

              // Tratamento das projeções
              if (["CANCELADO", "ENCERRADO"].includes(contrato.status)) {
                await excluirProjecoesFuturas(contrato.idContrato);
              }

              if (contrato.status === "ATIVO") {
                await gerarProjecoesParaContrato({
                  idContrato: contrato.idContrato,
                  dataInicio: contrato.dataInicio,
                  parcelas: contrato.parcelas,
                  valorBase: new Decimal(parseDecimal(contrato.valorBase)),
                  porVida: contrato.porVida,
                  recorrente: contrato.recorrente,
                  vidasAtivas: contrato.vidasAtivas ?? 0
                });
              }

              contratosMap.delete(contrato.idContrato);
            } else {
              const contratoCriado = await prisma.contrato.create({
                data: {
                  fkUnidadeId: unidadeDB.idUnidade,
                  dataInicio: new Date(contrato.dataInicio),
                  dataFim: new Date(contrato.dataFim),
                  parcelas: contrato.parcelas,
                  valorBase: new Decimal(parseDecimal(contrato.valorBase)),
                  porVida: contrato.porVida,
                  recorrente: contrato.recorrente,
                  status: contrato.status as StatusContrato,
                  faturadoPor: contrato.faturadoPor as FaturadoPor,
                  observacao: contrato.observacao,
                },
              });

              await gerarProjecoesParaContrato({
                idContrato: contratoCriado.idContrato,
                dataInicio: contratoCriado.dataInicio,
                parcelas: contratoCriado.parcelas,
                valorBase: new Decimal(parseDecimal(contrato.valorBase)),
                porVida: contratoCriado.porVida,
                recorrente: contratoCriado.recorrente,
                vidasAtivas: contrato.vidasAtivas ?? 0
              });
            }
          }

          // Remover contratos obsoletos
          for (const contratoObsoleto of contratosMap.values()) {
            await prisma.contrato.delete({ where: { idContrato: contratoObsoleto.idContrato } });
          }
        }

        unidadesMap.delete(unidadeDB.documento);
      }

      // Criar novas unidades
      for (const unidade of unidadesMap.values()) {
        const novaUnidade = await prisma.unidade.create({
          data: {
            fkEmpresaId: id,
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
          },
        });

        if (Array.isArray(unidade.contato) && unidade.contato.length > 0) {
          await prisma.contato.createMany({
            data: unidade.contato.map((c) => ({
              ...c,
              fkUnidadeId: novaUnidade.idUnidade,
            })),
          });
        }

        if (Array.isArray(unidade.contratos) && unidade.contratos.length > 0) {
          for (const contrato of unidade.contratos) {
            const contratoCriado = await prisma.contrato.create({
              data: {
                ...contrato,
                valorBase: new Decimal(parseDecimal(contrato.valorBase)),
                fkUnidadeId: novaUnidade.idUnidade,
                dataInicio: new Date(contrato.dataInicio),
                dataFim: new Date(contrato.dataFim),
                status: contrato.status as StatusContrato,
                faturadoPor: contrato.faturadoPor as FaturadoPor,
              },
            });

            await gerarProjecoesParaContrato({
              idContrato: contratoCriado.idContrato,
              dataInicio: contratoCriado.dataInicio,
              parcelas: contratoCriado.parcelas,
              valorBase: new Decimal(parseDecimal(contrato.valorBase)),
              porVida: contratoCriado.porVida,
              recorrente: contratoCriado.recorrente,
              vidasAtivas: contrato.vidasAtivas ?? 0
            });
          }
        }
      }

      const empresaDepois = await prisma.empresa.findUnique({
        where: { idEmpresa: id },
        include: {
          unidades: {
            include: {
              contato: true,
              contratos: true,
            },
          },
        },
      });

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