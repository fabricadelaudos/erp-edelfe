export interface Usuario {
  idUsuario: number;
  nome: string;
  ativo?: boolean;
  email: string;
  firebaseId?: string;
  criado_em?: Date;
  editado_em?: Date;
}