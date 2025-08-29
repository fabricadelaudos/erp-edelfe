import { prisma } from "../../config/prisma-client";
import { registrarEvento } from "../../shared/utils/registrarEvento";

interface EmpresaInput {
  nome: string;
  ativo?: boolean;
  idUsuario: number;
}

export const buscarEmpresa = {
  async execute(id: number) {
    return await prisma.empresa.findUnique({
      where: { idEmpresa: id },
    });
  },
};

export const buscarEmpresas = {
  async execute(termo: string) {
    return await prisma.empresa.findMany({
      where: {
        nome: { contains: termo },
      },
      take: 10,
    });
  },
};

export const listarEmpresas = {
  async execute() {
    return await prisma.empresa.findMany({
      orderBy: { nome: 'asc' },
    });
  },
};

export const criarEmpresa = {
  async execute(data: EmpresaInput) {
    try {
      const { idUsuario, ...dadosEmpresa } = data;

      const empresa = await prisma.empresa.create({
        data: {
          ...dadosEmpresa,
        },
      });

      await registrarEvento({
        idUsuario,
        tipo: "criar",
        entidade: "empresa",
        entidadeId: empresa.idEmpresa,
        descricao: `Empresa '${empresa.nome}' criada com sucesso!`,
        dadosDepois: empresa,
      });

      return empresa;
    } catch (e: any) {
      await registrarEvento({
        idUsuario: data.idUsuario,
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
    try {
      const { idUsuario, ...dadosEmpresa } = data;

      const empresaAntes = await prisma.empresa.findUnique({
        where: { idEmpresa: id },
      });

      const empresa = await prisma.empresa.update({
        where: { idEmpresa: id },
        data: {
          ...dadosEmpresa,
        },
      });

      await registrarEvento({
        idUsuario,
        tipo: "editar",
        entidade: "empresa",
        entidadeId: empresa.idEmpresa,
        descricao: `Empresa '${empresa.nome}' editada com sucesso!`,
        dadosAntes: empresaAntes,
        dadosDepois: empresa,
      });

      return empresa;
    } catch (e: any) {
      await registrarEvento({
        idUsuario: data.idUsuario,
        tipo: "erro",
        entidade: "empresa",
        entidadeId: id,
        descricao: `Erro ao editar empresa: ${e.message}`,
      });
      throw new Error("Erro ao editar empresa: " + e.message);
    }
  },
};
