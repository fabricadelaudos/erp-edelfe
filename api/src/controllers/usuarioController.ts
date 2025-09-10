import { Request, Response } from 'express';
import { buscarUsuario, buscarUsuarios, criarUsuario, editarUsuario, excluirUsuario } from '../useCases/usuario';
import admin from '../infra/firebase/firebase';

export const buscarUsuarioController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'ID do usuário ausente' });

    const usuario = await buscarUsuario.execute(parseInt(id));
    if (!usuario) return res.status(404).json({ error: 'usuario não encontrado' });

    return res.json(usuario);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

export const buscarUsuariosController = async (req: Request, res: Response) => {
  try {
    const usuarios = await buscarUsuarios.execute()

    if (!usuarios) return res.status(404).json({ error: 'Nenhum usuario encontrado' });

    return res.json(usuarios);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

export const criarUsuarioController = async (req: Request, res: Response) => {
  try {
    const idUsuario = (req.user as any)?.idUsuario;
    const usuario = await criarUsuario.execute(req.body, { idUsuario });
    return res.status(201).json(usuario);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

export const editarUsuarioController = async (req: Request, res: Response) => {
  try {
    const idUsuario = (req.user as any)?.idUsuario;
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'ID do usuário ausente' });

    const usuario = await editarUsuario.execute(parseInt(id), req.body, { idUsuario });
    return res.json(usuario);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

export const excluirUsuarioController = async (req: Request, res: Response) => {
  try {
    const idUsuario = (req.user as any)?.idUsuario;
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'ID da empresa ausente' });

    const usuario = await excluirUsuario.execute(parseInt(id), idUsuario);
    return res.json(usuario);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

export const enviarLinkRecuperacaoSenhaController = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "E-mail é obrigatório." });

  try {
    const link = await admin.auth().generatePasswordResetLink(email);
    return res.json({ link });
  } catch (error: any) {
    console.error("Erro ao gerar link de recuperação:", error);
    return res.status(400).json({ error: "Erro ao gerar link. Verifique o e-mail informado." });
  }
};
