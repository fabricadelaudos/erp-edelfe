export interface Empresa {
  idEmpresa: number;
  nome: string;
  ativo: boolean;
  unidades: Unidade[];
}

export interface Unidade {
  idUnidade: number;
  fkEmpresaId: number;
  nomeFantasia: string;
  razaoSocial: string;
  tipoDocumento: string;
  cnpj: string;
  inscricaoEstadual: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  cep: string;
  ativo: boolean;
  observacao: string;
  contatos: [];
  contratos: [];
}