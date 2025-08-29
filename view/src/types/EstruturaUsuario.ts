export interface Usuario {
  idUsuario: number;
  email: string;
  nome: string;
  criado_em?: Date;
  editado_em?: Date;
  ativo?: number;
  firebaseId?: string;
}