import { Request, Response } from 'express';
import {
  buscarContaPagar,
  buscarContasPagar,
  criarContaPagar,
  editarContaPagar,
  buscarParcela,
  atualizarParcela,
} from '../../useCases/despesas/contaPagar';

export const buscarContaPagarController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const conta = await buscarContaPagar.execute(parseInt(id));
    return res.json(conta);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const buscarContasPagarController = async (_: Request, res: Response) => {
  try {
    const contas = await buscarContasPagar.execute();
    return res.json(contas);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const criarContaPagarController = async (req: Request, res: Response) => {
  try {
    const idUsuario = (req.user as any)?.idUsuario;
    const conta = await criarContaPagar.execute({ ...req.body, idUsuario });
    return res.status(201).json(conta);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const editarContaPagarController = async (req: Request, res: Response) => {
  try {
    const idUsuario = (req.user as any)?.idUsuario;
    const { id } = req.params;
    const conta = await editarContaPagar.execute(parseInt(id), { ...req.body, idUsuario });
    return res.json(conta);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

// Parcelas
export const buscarParcelaController = async (req: Request, res: Response) => {
  try {
    const parcela = await buscarParcela.execute(parseInt(req.params.id));
    return res.json(parcela);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const atualizarParcelaController = async (req: Request, res: Response) => {
  try {
    const idUsuario = (req.user as any)?.idUsuario;
    const parcela = await atualizarParcela.execute(parseInt(req.params.id), { ...req.body, idUsuario });
    return res.json(parcela);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};