import { FaturadoPor, Prisma, StatusContrato, StatusProjecao, TipoDocumento } from "@prisma/client";
import { prisma } from "../../config/prisma-client";
import { EmpresaInput } from "../../dto/EmpresaDto";
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

function calcularMesesEntre(inicio: Date, fim: Date): number {
  const anos = fim.getFullYear() - inicio.getFullYear();
  const meses = fim.getMonth() - inicio.getMonth();
  return anos * 12 + meses;
}

export async function gerarProjecoesParaContrato(contrato: {
  idContrato: number;
  dataInicio: string | Date;
  dataFim: string | Date;
  parcelas: number;
  valorBase: string | number | Decimal;
  porVida: boolean;
  recorrente: boolean;
  vidasAtivas?: number;
}) {
  const {
    idContrato,
    dataInicio,
    dataFim,
    parcelas,
    valorBase,
    porVida,
    recorrente,
    vidasAtivas = 0,
  } = contrato;

  const dataInicial = new Date(dataInicio);
  const dataFinal = new Date(dataFim);
  const valor = typeof valorBase === "string" ? parseFloat(valorBase) : Number(valorBase);

  const projecoes: {
    fkContratoId: number;
    competencia: string;
    valorPrevisto: number;
    status: StatusProjecao;
  }[] = [];

  const mesesParaProjetar = recorrente || porVida
    ? calcularMesesEntre(dataInicial, dataFinal)
    : parcelas;

  for (let i = 0; i < mesesParaProjetar; i++) {
    const data = new Date(dataInicial);
    data.setMonth(data.getMonth() + i);

    const competencia = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`;
    let valorPrevisto = 0;

    // ✅ Apenas POR VIDA (com ou sem recorrente)
    if (porVida) {
      valorPrevisto = valor * vidasAtivas;
    }
    // ✅ Apenas MENSAL
    else if (!recorrente && parcelas > 0) {
      valorPrevisto = parseFloat((valor / parcelas).toFixed(2));
    }
    // ✅ Apenas RECORRENTE
    else if (recorrente && !porVida) {
      valorPrevisto = valor;
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

export async function sincronizarProjecoesParaContrato(contrato: {
  idContrato: number;
  dataInicio: string | Date;
  dataFim: string | Date;
  parcelas: number;
  valorBase: string | number | Decimal;
  porVida: boolean;
  recorrente: boolean;
  vidasAtivas?: number;
}) {
  const {
    idContrato,
    dataInicio,
    dataFim,
    parcelas,
    valorBase,
    porVida,
    recorrente,
    vidasAtivas = 0,
  } = contrato;

  const dataInicial = new Date(dataInicio);
  const dataFinal = new Date(dataFim);
  const valor = typeof valorBase === "string" ? parseFloat(valorBase) : Number(valorBase);

  const meses = recorrente || porVida
    ? calcularMesesEntre(dataInicial, dataFinal)
    : parcelas;

  const novasProjecoes: Record<string, number> = {};

  for (let i = 0; i < meses; i++) {
    const data = new Date(dataInicial);
    data.setMonth(data.getMonth() + i);
    const competencia = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`;

    let valorPrevisto = 0;

    if (!porVida && !recorrente) {
      valorPrevisto = parseFloat((valor / parcelas).toFixed(2));
    }

    if (porVida) {
      valorPrevisto += valor * vidasAtivas;
    }

    if (recorrente && !porVida && parcelas === 0) {
      valorPrevisto = valor;
    }

    if (porVida && parcelas > 0) {
      valorPrevisto += parseFloat((valor / parcelas).toFixed(2));
    }

    novasProjecoes[competencia] = parseFloat(valorPrevisto.toFixed(2));
  }

  const existentes = await prisma.projecao.findMany({
    where: { fkContratoId: idContrato },
  });

  const existentesMap = new Map(existentes.map((p) => [p.competencia, p]));

  for (const [competencia, valorPrevisto] of Object.entries(novasProjecoes)) {
    const projExistente = existentesMap.get(competencia);

    if (projExistente) {
      if (projExistente.status === "PENDENTE") {
        await prisma.projecao.update({
          where: { idProjecao: projExistente.idProjecao },
          data: { valorPrevisto },
        });
      }
      existentesMap.delete(competencia); // Remove da lista para não ser deletado depois
    } else {
      await prisma.projecao.create({
        data: {
          fkContratoId: idContrato,
          competencia,
          valorPrevisto,
          status: "PENDENTE",
        },
      });
    }
  }

  // Exclui competências antigas que não estão mais na projeção nova
  for (const projOutdated of existentesMap.values()) {
    if (projOutdated.status === "PENDENTE") {
      await prisma.projecao.delete({
        where: { idProjecao: projOutdated.idProjecao },
      });
    }
  }
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
              retemIss: unidade.retemIss ?? false,
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
              const parcelas = contrato.recorrente
                ? calcularMesesEntre(new Date(contrato.dataInicio), new Date(contrato.dataFim))
                : contrato.parcelas;

              const contratoCriado = await prisma.contrato.create({
                data: {
                  fkUnidadeId: unidadeCriada.idUnidade,
                  dataInicio: new Date(contrato.dataInicio),
                  dataFim: new Date(contrato.dataFim),
                  parcelas: parcelas,
                  valorBase: contrato.valorBase,
                  porVida: contrato.porVida,
                  recorrente: contrato.recorrente,
                  status: contrato.status as StatusContrato,
                  faturadoPor: contrato.faturadoPor as FaturadoPor,
                  esocial: contrato.esocial ?? false,
                  laudos: contrato.laudos ?? false,
                  observacao: contrato.observacao,
                  diaVencimento: contrato.diaVencimento ?? null
                },
              });

              // 2.3 Gerar projeções apenas para contratos ATIVOS
              if (contrato.status === "ATIVO") {
                await gerarProjecoesParaContrato({
                  idContrato: contratoCriado.idContrato,
                  dataInicio: contratoCriado.dataInicio,
                  dataFim: contratoCriado.dataFim,
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
            retemIss: unidadeFront.retemIss ?? false
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
              const parcelas = contrato.recorrente
                ? calcularMesesEntre(new Date(contrato.dataInicio), new Date(contrato.dataFim))
                : contrato.parcelas;

              await prisma.contrato.update({
                where: { idContrato: contrato.idContrato },
                data: {
                  dataInicio: new Date(contrato.dataInicio),
                  dataFim: new Date(contrato.dataFim),
                  parcelas: parcelas,
                  valorBase: new Decimal(parseDecimal(contrato.valorBase)),
                  porVida: contrato.porVida,
                  recorrente: contrato.recorrente,
                  status: contrato.status as StatusContrato,
                  faturadoPor: contrato.faturadoPor as FaturadoPor,
                  esocial: contrato.esocial ?? false,
                  laudos: contrato.laudos ?? false,
                  observacao: contrato.observacao,
                  diaVencimento: contrato.diaVencimento ?? null,
                },
              });

              // Tratamento das projeções
              if (["CANCELADO", "ENCERRADO"].includes(contrato.status)) {
                await excluirProjecoesFuturas(contrato.idContrato);
              }

              if (contrato.status === "ATIVO") {
                await sincronizarProjecoesParaContrato({
                  idContrato: contrato.idContrato,
                  dataInicio: contrato.dataInicio,
                  dataFim: contrato.dataFim,
                  parcelas: contrato.parcelas,
                  valorBase: new Decimal(parseDecimal(contrato.valorBase)),
                  porVida: contrato.porVida,
                  recorrente: contrato.recorrente,
                  vidasAtivas: contrato.vidasAtivas ?? 0
                });
              }

              contratosMap.delete(contrato.idContrato);
            } else {
              const parcelas = contrato.recorrente
                ? calcularMesesEntre(new Date(contrato.dataInicio), new Date(contrato.dataFim))
                : contrato.parcelas;

              const contratoCriado = await prisma.contrato.create({
                data: {
                  fkUnidadeId: unidadeDB.idUnidade,
                  dataInicio: new Date(contrato.dataInicio),
                  dataFim: new Date(contrato.dataFim),
                  parcelas: parcelas,
                  valorBase: new Decimal(parseDecimal(contrato.valorBase)),
                  porVida: contrato.porVida,
                  recorrente: contrato.recorrente,
                  status: contrato.status as StatusContrato,
                  faturadoPor: contrato.faturadoPor as FaturadoPor,
                  esocial: contrato.esocial ?? false,
                  laudos: contrato.laudos ?? false,
                  observacao: contrato.observacao,
                  diaVencimento: contrato.diaVencimento ?? null
                },
              });

              await gerarProjecoesParaContrato({
                idContrato: contratoCriado.idContrato,
                dataInicio: contratoCriado.dataInicio,
                dataFim: contratoCriado.dataFim,
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
            retemIss: unidade.retemIss ?? false
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
            const parcelas = contrato.recorrente
                ? calcularMesesEntre(new Date(contrato.dataInicio), new Date(contrato.dataFim))
                : contrato.parcelas;

            const contratoCriado = await prisma.contrato.create({
              data: {
                ...contrato,
                parcelas: parcelas,
                valorBase: new Decimal(parseDecimal(contrato.valorBase)),
                fkUnidadeId: novaUnidade.idUnidade,
                dataInicio: new Date(contrato.dataInicio),
                dataFim: new Date(contrato.dataFim),
                status: contrato.status as StatusContrato,
                faturadoPor: contrato.faturadoPor as FaturadoPor,
                esocial: contrato.esocial ?? false,
                laudos: contrato.laudos ?? false,
                observacao: contrato.observacao,
                diaVencimento: contrato.diaVencimento ?? null
              },
            });

            await gerarProjecoesParaContrato({
              idContrato: contratoCriado.idContrato,
              dataInicio: contratoCriado.dataInicio,
              dataFim: contratoCriado.dataFim,
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