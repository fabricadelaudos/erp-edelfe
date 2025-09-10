import { prisma } from '../../config/prisma-client';
import { registrarEvento } from '../../shared/utils/registrarEvento';

export const buscarBanco = {
  async execute(id: number) {
    return await prisma.banco.findUnique({ where: { idBanco: id } });
  }
};

export const buscarBancos = {
  async execute() {
    return await prisma.banco.findMany({ orderBy: { ativo: 'desc' } });
  }
};

export const criarBanco = {
  async execute(data: any) {
    const { idUsuario, idBanco, ...dados } = data;
    const banco = await prisma.banco.create({ data: dados });

    await registrarEvento({
      idUsuario,
      tipo: 'criar',
      entidade: 'banco',
      entidadeId: banco.idBanco,
      descricao: `Banco '${banco.nome}' criado com sucesso!`,
      dadosDepois: banco
    });

    return banco;
  }
};

export const editarBanco = {
  async execute(id: number, data: any) {
    const { idUsuario, ...dados } = data;

    const antes = await prisma.banco.findUnique({ where: { idBanco: id } });

    const atualizado = await prisma.banco.update({
      where: { idBanco: id },
      data: dados
    });

    await registrarEvento({
      idUsuario,
      tipo: 'editar',
      entidade: 'banco',
      entidadeId: id,
      descricao: `Banco '${atualizado.nome}' editado com sucesso!`,
      dadosAntes: antes,
      dadosDepois: atualizado
    });

    return atualizado;
  }
};