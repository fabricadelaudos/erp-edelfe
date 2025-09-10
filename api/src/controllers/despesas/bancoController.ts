import { Request, Response } from 'express';
import {
  buscarBanco,
  buscarBancos,
  criarBanco,
  editarBanco
} from '../../useCases/despesas/banco';

export const buscarBancoController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const banco = await buscarBanco.execute(parseInt(id));
    return res.json(banco);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const buscarBancosController = async (_: Request, res: Response) => {
  try {
    const lista = await buscarBancos.execute();
    return res.json(lista);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const criarBancoController = async (req: Request, res: Response) => {
  try {
    const idUsuario = (req.user as any)?.idUsuario;
    const banco = await criarBanco.execute({ ...req.body, idUsuario });
    return res.status(201).json(banco);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const editarBancoController = async (req: Request, res: Response) => {
  try {
    const idUsuario = (req.user as any)?.idUsuario;
    const { id } = req.params;
    const banco = await editarBanco.execute(parseInt(id), { ...req.body, idUsuario });
    return res.json(banco);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};