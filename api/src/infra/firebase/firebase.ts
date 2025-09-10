import admin from 'firebase-admin';

var serviceAccount = require("./edelfe-ea70f-firebase-adminsdk-fbsvc-cfaa9e4e7b.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

export async function gerarLinkRedefinicaoSenha(email: string) {
  return await admin.auth().generatePasswordResetLink(email);
}

export default admin;