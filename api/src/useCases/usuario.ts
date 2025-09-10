import { prisma } from "../config/prisma-client";
import admin from "../infra/firebase/firebase";
import { registrarEvento } from "../shared/utils/registrarEvento";

export const buscarUsuario = {
  async execute(id: number) {
    const usuario = await prisma.usuario.findUnique({
      where: { idUsuario: id, },
    });

    return usuario;
  },
};

export const buscarUsuarios = {
  async execute() {
    return await prisma.usuario.findMany({
      orderBy: [{ idUsuario: "desc" }, { ativo: "desc" }]
    });
  }
};

export const criarUsuario = {
  async execute(data: any, { idUsuario }: { idUsuario: number }) {
    // 1. Criar usuário no Firebase Auth
    const firebaseUser = await admin.auth().createUser({
      email: data.email,
      password: data.senha ?? "123456",
      displayName: data.nome,
    });

    // 2. Salvar no banco com o ID do Firebase
    const novo = await prisma.usuario.create({
      data: {
        nome: data.nome,
        email: data.email,
        ativo: data.ativo ?? true,
        firebaseId: firebaseUser.uid,
      },
    });

    // 3. Registrar evento
    await registrarEvento({
      idUsuario,
      tipo: "criar",
      entidade: "usuario",
      entidadeId: novo.idUsuario,
      descricao: `Usuário '${novo.nome}' criado com sucesso.`,
      dadosDepois: novo,
    });

    return novo;
  }
};

export const editarUsuario = {
  async execute(id: number, data: any, { idUsuario }: { idUsuario: number }) {
    const antes = await prisma.usuario.findUnique({ where: { idUsuario: id } });
    if (!antes) throw new Error("Usuário não encontrado");

    // Se mudou o email, atualizar no Firebase
    if (data.email && data.email !== antes.email && antes.firebaseId) {
      await admin.auth().updateUser(antes.firebaseId, {
        email: data.email,
        displayName: data.nome,
      });
    }

    const atualizado = await prisma.usuario.update({
      where: { idUsuario: id },
      data: {
        nome: data.nome,
        email: data.email,
        ativo: data.ativo,
      },
    });

    await registrarEvento({
      idUsuario,
      tipo: "editar",
      entidade: "usuario",
      entidadeId: id,
      descricao: `Usuário '${atualizado.nome}' editado com sucesso.`,
      dadosAntes: antes,
      dadosDepois: atualizado,
    });

    return atualizado;
  }
};

export const excluirUsuario = {
  async execute(id: number, user: any) {
    const existente = await prisma.usuario.findUnique({
      where: { idUsuario: id }
    });

    if (!existente) throw new Error("Usuário não encontrado");

    await prisma.usuario.delete({
      where: { idUsuario: id }
    });

    await registrarEvento({
      idUsuario: user.idUsuario,
      tipo: "EXCLUSAO",
      descricao: `Excluiu usuário ${existente.nome}`,
      entidade: "usuario",
      entidadeId: id,
      dadosAntes: existente,
    });
  }
};