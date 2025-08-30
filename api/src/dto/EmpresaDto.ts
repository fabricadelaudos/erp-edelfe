export interface ContatoInput {
  nome: string;
  email: string;
  emailSecundario?: string;
  telefoneFixo?: string;
  telefoneWpp?: string;
}

export interface ContratoInput {
  dataInicio: string;
  dataFim: string;
  parcelas: number;
  valorBase: string;
  porVida: boolean;
  recorrente: boolean;
  status: string;
  faturadoPor: string;
  observacao?: string;
}

export interface UnidadeInput {
  nomeFantasia: string;
  razaoSocial: string;
  tipoDocumento: string;
  documento: string;
  inscricaoEstadual?: string;
  endereco: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  observacao?: string;
  ativo?: boolean;

  contato?: ContatoInput;
  contratos?: ContratoInput[];
}

export interface EmpresaInput {
  nome: string;
  ativo?: boolean;
  idUsuario: number;
  unidades?: UnidadeInput[];
}