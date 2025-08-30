import { FaturadoPor, Prisma, StatusContrato, TipoDocumento } from "@prisma/client";
import { prisma } from "../../config/prisma-client";
import { EmpresaInput } from "../../dto/EmpresaDto";
import { registrarEvento } from "../../shared/utils/registrarEvento";

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

function isObjetoPreenchido(obj: any) {
  return obj && typeof obj === "object" && Object.keys(obj).length > 0;
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
      take: 10,
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
      const empresaCriada = await prisma.empresa.create({
        data: {
          nome: dadosEmpresa.nome,
          ativo: dadosEmpresa.ativo ?? true,
        },
      });

      if (unidades && unidades.length > 0) {
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

          // Contatos (como lista)
          if (Array.isArray(unidade.contato) && unidade.contato.length > 0) {
            await prisma.contato.createMany({
              data: unidade.contato.map((c) => ({
                ...c,
                fkUnidadeId: unidadeCriada.idUnidade,
              })),
            });
          }

          // Contratos
          if (Array.isArray(unidade.contratos) && unidade.contratos.length > 0) {
            await prisma.contrato.createMany({
              data: unidade.contratos.map((c) => ({
                ...c,
                fkUnidadeId: unidadeCriada.idUnidade,
                dataInicio: new Date(c.dataInicio),
                dataFim: new Date(c.dataFim),
                status: c.status as StatusContrato,
                faturadoPor: c.faturadoPor as FaturadoPor,
              })),
            });
          }
        }
      }

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
          await prisma.contato.deleteMany({
            where: { fkUnidadeId: unidadeDB.idUnidade },
          });

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
          await prisma.contrato.deleteMany({
            where: { fkUnidadeId: unidadeDB.idUnidade },
          });

          if (unidadeFront.contratos.length > 0) {
            await prisma.contrato.createMany({
              data: unidadeFront.contratos.map((c) => ({
                ...c,
                fkUnidadeId: unidadeDB.idUnidade,
                dataInicio: new Date(c.dataInicio),
                dataFim: new Date(c.dataFim),
                status: c.status as StatusContrato,
                faturadoPor: c.faturadoPor as FaturadoPor,
              })),
            });
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
          await prisma.contrato.createMany({
            data: unidade.contratos.map((c) => ({
              ...c,
              fkUnidadeId: novaUnidade.idUnidade,
              dataInicio: new Date(c.dataInicio),
              dataFim: new Date(c.dataFim),
              status: c.status as StatusContrato,
              faturadoPor: c.faturadoPor as FaturadoPor,
            })),
          });
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