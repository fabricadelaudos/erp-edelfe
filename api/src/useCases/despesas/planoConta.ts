import { prisma } from '../../config/prisma-client';
import { registrarEvento } from '../../shared/utils/registrarEvento';


export const buscarPlanoContaCategoria = {
  async execute(id: number) {
    return await prisma.planocontacategoria.findUnique({
      where: { idPlanoContaCategoria: id },
      include: { planocontasubcategoria: true }
    });
  }
};

export const buscarPlanoContaCategorias = {
  async execute() {
    return await prisma.planocontacategoria.findMany({
      include: { planocontasubcategoria: true },
      orderBy: { nome: 'asc' }
    });
  }
};

export const salvarPlanoContaCategoria = {
  async execute(data: any) {
    const { idUsuario, idPlanoContaCategoria, nome, planocontasubcategoria } = data;

    if (!nome) throw new Error("Nome da categoria é obrigatório");

    if (idPlanoContaCategoria) {
      // === EDIÇÃO ===
      const categoriaAntes = await prisma.planocontacategoria.findUnique({
        where: { idPlanoContaCategoria },
        include: { planocontasubcategoria: true }
      });

      await prisma.planocontacategoria.update({
        where: { idPlanoContaCategoria },
        data: { nome }
      });

      const idsRecebidos = planocontasubcategoria
        .filter((s: any) => s.idPlanoContaSubCategoria)
        .map((s: any) => s.idPlanoContaSubCategoria);

      // Remover subcategorias não mais presentes
      await prisma.planocontasubcategoria.deleteMany({
        where: {
          fkPlanoContaCategoria: idPlanoContaCategoria,
          idPlanoContaSubCategoria: { notIn: idsRecebidos }
        }
      });

      // Atualizar ou criar
      for (const sub of planocontasubcategoria) {
        if (sub.idPlanoContaSubCategoria) {
          await prisma.planocontasubcategoria.update({
            where: { idPlanoContaSubCategoria: sub.idPlanoContaSubCategoria },
            data: { nome: sub.nome }
          });
        } else {
          await prisma.planocontasubcategoria.create({
            data: {
              nome: sub.nome,
              fkPlanoContaCategoria: idPlanoContaCategoria
            }
          });
        }
      }

      const atualizado = await prisma.planocontacategoria.findUnique({
        where: { idPlanoContaCategoria },
        include: { planocontasubcategoria: true }
      });

      await registrarEvento({
        idUsuario,
        tipo: "editar",
        entidade: "planoContaCategoria",
        entidadeId: idPlanoContaCategoria,
        descricao: `Categoria '${atualizado?.nome}' atualizada com subcategorias.`,
        dadosAntes: categoriaAntes,
        dadosDepois: atualizado
      });

      return atualizado;
    } else {
      // === CRIAÇÃO ===
      const novaCategoria = await prisma.planocontacategoria.create({
        data: { nome }
      });

      for (const sub of planocontasubcategoria) {
        await prisma.planocontasubcategoria.create({
          data: {
            nome: sub.nome,
            fkPlanoContaCategoria: novaCategoria.idPlanoContaCategoria
          }
        });
      }

      const criado = await prisma.planocontacategoria.findUnique({
        where: { idPlanoContaCategoria: novaCategoria.idPlanoContaCategoria },
        include: { planocontasubcategoria: true }
      });

      await registrarEvento({
        idUsuario,
        tipo: "criar",
        entidade: "planoContaCategoria",
        entidadeId: novaCategoria.idPlanoContaCategoria,
        descricao: `Categoria '${novaCategoria.nome}' criada com subcategorias.`,
        dadosDepois: criado
      });

      return criado;
    }
  }
};

export const buscarSubcategorias = {
  async execute(idCategoria: number) {
    return await prisma.planocontasubcategoria.findMany({
      where: { fkPlanoContaCategoria: idCategoria },
      orderBy: { nome: 'asc' }
    });
  }
};