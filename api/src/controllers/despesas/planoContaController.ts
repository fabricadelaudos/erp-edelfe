import { Request, Response } from 'express';
import { buscarPlanoContaCategoria, buscarPlanoContaCategorias, buscarSubcategorias, salvarPlanoContaCategoria } from "../../useCases/despesas/planoConta";

export const buscarPlanoContaCategoriaController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const categoria = await buscarPlanoContaCategoria.execute(parseInt(id));
    return res.json(categoria);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const buscarPlanoContaCategoriasController = async (_: Request, res: Response) => {
  try {
    const lista = await buscarPlanoContaCategorias.execute();
    return res.json(lista);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const salvarPlanoContaCategoriaController = async (req: Request, res: Response) => {
  try {
    const idUsuario = (req.user as any)?.idUsuario;
    const resultado = await salvarPlanoContaCategoria.execute({ ...req.body, idUsuario });
    return res.status(201).json(resultado);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const buscarSubcategoriasController = async (req: Request, res: Response) => {
  try {
    const { idCategoria } = req.params;
    const lista = await buscarSubcategorias.execute(parseInt(idCategoria));
    return res.json(lista);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};