import { prisma } from "../../config/prisma-client";
import { registrarEvento } from "../../shared/utils/registrarEvento";


export const buscarFornecedor = {
  async execute(id: number) {
    return await prisma.fornecedor.findUnique({
      where: { idFornecedor: id },
    });
  }
};

export const buscarFornecedores = {
  async execute(termo: string) {
    return await prisma.fornecedor.findMany({
      where: {
        nome: { contains: termo },
      },
      orderBy: [
        { nome: 'asc' },
        { ativo: 'desc' }
      ],
    });
  }
};

export const listarFornecedores = {
  async execute() {
    return await prisma.fornecedor.findMany({ orderBy: [{ nome: 'asc' }, { ativo: 'desc' }] });
  }
};

export const criarFornecedor = {
  async execute(data: any) {
    const { idUsuario, idFornecedor, ...dados } = data;

    try {
      const novo = await prisma.fornecedor.create({ data: dados });

      await registrarEvento({
        idUsuario,
        tipo: "criar",
        entidade: "fornecedor",
        entidadeId: novo.idFornecedor,
        descricao: `Fornecedor '${novo.nome}' criado com sucesso!`,
        dadosDepois: novo,
      });

      return novo;
    } catch (err: any) {
      if (err.code === "P2002" && err.meta?.target?.includes("documento")) {
        throw new Error("Já existe um fornecedor cadastrado com este CNPJ/CPF.");
      }
      throw err;
    }
  },
};

export const editarFornecedor = {
  async execute(id: number, data: any) {
    const { idUsuario, ...dados } = data;

    const antes = await prisma.fornecedor.findUnique({ where: { idFornecedor: id } });

    const atualizado = await prisma.fornecedor.update({
      where: { idFornecedor: id },
      data: dados
    });

    await registrarEvento({
      idUsuario,
      tipo: 'editar',
      entidade: 'fornecedor',
      entidadeId: id,
      descricao: `Fornecedor '${atualizado.nome}' editado com sucesso!`,
      dadosAntes: antes,
      dadosDepois: atualizado
    });

    return atualizado;
  }
};