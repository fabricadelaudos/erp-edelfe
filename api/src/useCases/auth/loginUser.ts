import admin from '../../infra/firebase/firebase';
import { prisma } from '../../config/prisma-client';

import { generateToken } from '../../services/authService';
import { registrarEvento } from '../../shared/utils/registrarEvento';

export async function loginUser(idToken: string) {
  const decoded = await admin.auth().verifyIdToken(idToken);
  const { uid, email } = decoded;

  if (!email) {
    throw new Error("Email não encontrado no token");
  }

  let usuario = await prisma.usuario.findUnique({
    where: { firebaseId: uid },
  });

  if (!usuario) {
    throw new Error("Usuário não encontrado!");
  }

  if (usuario.ativo === 0) {
    throw new Error("Usuário inativo!");
  }

  const token = generateToken({ idUsuario: usuario.idUsuario, email: usuario.email });

  try {
    await registrarEvento({
      idUsuario: usuario.idUsuario,
      tipo: "login",
      descricao: `Token: ${token}`,
    });
  } catch (e) {
    throw new Error("Erro ao registrar evento de login:" + e);
  }

  return {
    usuario: usuario,
    token,
  };
}
