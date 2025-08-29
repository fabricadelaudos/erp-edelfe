import { Request, Response } from 'express';
import {
  buscarEmpresa,
  criarEmpresa,
  editarEmpresa,
  buscarEmpresas,
  listarEmpresas,
} from '../../useCases/empresa/empresa';

export const buscarEmpresaController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'ID da empresa ausente' });

    const empresa = await buscarEmpresa.execute(parseInt(id));
    if (!empresa) return res.status(404).json({ error: 'Empresa não encontrada' });

    return res.json(empresa);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

export const buscarEmpresasController = async (req: Request, res: Response) => {
  try {
    const termo = req.query.busca?.toString().trim();
    if (termo && termo.length < 3) {
      return res.status(400).json({ error: "Informe ao menos 3 letras para busca." });
    }

    const empresas = termo
      ? await buscarEmpresas.execute(termo)
      : await listarEmpresas.execute();

    return res.json(empresas);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

export const criarEmpresaController = async (req: Request, res: Response) => {
  try {
    const idUsuario = (req.user as any)?.idUsuario;
    const empresa = await criarEmpresa.execute({ ...req.body, idUsuario });
    return res.status(201).json(empresa);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

export const editarEmpresaController = async (req: Request, res: Response) => {
  try {
    const idUsuario = (req.user as any)?.idUsuario;
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'ID da empresa ausente' });

    const empresa = await editarEmpresa.execute(parseInt(id), { ...req.body, idUsuario });
    return res.json(empresa);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};