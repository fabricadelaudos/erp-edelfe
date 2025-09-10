import { prisma } from '../../config/prisma-client';
import { registrarEvento } from '../../shared/utils/registrarEvento';


export const buscarPlanoContaCategoria = {
  async execute(id: number) {
    return await prisma.planoContaCategoria.findUnique({
      where: { idPlanoContaCategoria: id },
      include: { subcategorias: true }
    });
  }
};

export const buscarPlanoContaCategorias = {
  async execute() {
    return await prisma.planoContaCategoria.findMany({
      include: { subcategorias: true },
      orderBy: { nome: 'asc' }
    });
  }
};

export const salvarPlanoContaCategoria = {
  async execute(data: any) {
    const { idUsuario, idPlanoContaCategoria, nome, subcategorias } = data;

    if (!nome) throw new Error("Nome da categoria é obrigatório");

    if (idPlanoContaCategoria) {
      // === EDIÇÃO ===
      const categoriaAntes = await prisma.planoContaCategoria.findUnique({
        where: { idPlanoContaCategoria },
        include: { subcategorias: true }
      });

      await prisma.planoContaCategoria.update({
        where: { idPlanoContaCategoria },
        data: { nome }
      });

      const idsRecebidos = subcategorias
        .filter((s: any) => s.idPlanoContaSubCategoria)
        .map((s: any) => s.idPlanoContaSubCategoria);

      // Remover subcategorias não mais presentes
      await prisma.planoContaSubcategoria.deleteMany({
        where: {
          fkPlanoContaCategoria: idPlanoContaCategoria,
          idPlanoContaSubCategoria: { notIn: idsRecebidos }
        }
      });

      // Atualizar ou criar
      for (const sub of subcategorias) {
        if (sub.idPlanoContaSubCategoria) {
          await prisma.planoContaSubcategoria.update({
            where: { idPlanoContaSubCategoria: sub.idPlanoContaSubCategoria },
            data: { nome: sub.nome }
          });
        } else {
          await prisma.planoContaSubcategoria.create({
            data: {
              nome: sub.nome,
              fkPlanoContaCategoria: idPlanoContaCategoria
            }
          });
        }
      }

      const atualizado = await prisma.planoContaCategoria.findUnique({
        where: { idPlanoContaCategoria },
        include: { subcategorias: true }
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
      const novaCategoria = await prisma.planoContaCategoria.create({
        data: { nome }
      });

      for (const sub of subcategorias) {
        await prisma.planoContaSubcategoria.create({
          data: {
            nome: sub.nome,
            fkPlanoContaCategoria: novaCategoria.idPlanoContaCategoria
          }
        });
      }

      const criado = await prisma.planoContaCategoria.findUnique({
        where: { idPlanoContaCategoria: novaCategoria.idPlanoContaCategoria },
        include: { subcategorias: true }
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
    return await prisma.planoContaSubcategoria.findMany({
      where: { fkPlanoContaCategoria: idCategoria },
      orderBy: { nome: 'asc' }
    });
  }
};