import { Request, Response } from 'express';
import { buscarFornecedor, buscarFornecedores, criarFornecedor, editarFornecedor, listarFornecedores } from '../../useCases/despesas/fornecedor';

export const buscarFornecedorController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'ID do fornecedor ausente' });

    const fornecedor = await buscarFornecedor.execute(parseInt(id));
    if (!fornecedor) return res.status(404).json({ error: 'Fornecedor não encontrado' });

    return res.json(fornecedor);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

export const buscarFornecedoresController = async (req: Request, res: Response) => {
  try {
    const termo = req.query.busca?.toString().trim();
    if (termo && termo.length < 3) {
      return res.status(400).json({ error: "Informe ao menos 3 letras para busca." });
    }

    const fornecedores = termo
      ? await buscarFornecedores.execute(termo)
      : await listarFornecedores.execute();

    return res.json(fornecedores);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

export const criarFornecedorController = async (req: Request, res: Response) => {
  try {
    const idUsuario = (req.user as any)?.idUsuario;
    const fornecedor = await criarFornecedor.execute({ ...req.body, idUsuario });
    return res.status(201).json(fornecedor);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

export const editarFornecedorController = async (req: Request, res: Response) => {
  try {
    const idUsuario = (req.user as any)?.idUsuario;
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'ID do fornecedor ausente' });

    const fornecedor = await editarFornecedor.execute(parseInt(id), { ...req.body, idUsuario });
    return res.json(fornecedor);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};