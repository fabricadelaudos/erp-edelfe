import admin from "firebase-admin";

if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  throw new Error("⚠️ FIREBASE_SERVICE_ACCOUNT não configurada no .env");
}

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT as string);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export async function gerarLinkRedefinicaoSenha(email: string) {
  return await admin.auth().generatePasswordResetLink(email);
}

export default admin;