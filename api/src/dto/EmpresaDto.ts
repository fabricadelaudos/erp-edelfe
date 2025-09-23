export interface ContatoInput {
  idContato?: number;
  nome: string;
  email: string;
  emailSecundario?: string;
  telefoneFixo?: string;
  telefoneWpp?: string;
}

export interface unidadeContato {
  idUnidadeContato: number;
  fkUnidadeId: number;
  fkContatoId: number;

  contato: ContatoInput;
}

export interface ContratoInput {
  idContrato: number;
  dataInicio: string;
  dataFim: string;
  parcelas: number;
  valorBase: string;
  porVida: boolean;
  vidas?: number;
  recorrente: boolean;
  status: string;
  faturadoPor: string;
  esocial?: boolean;
  laudos?: boolean;
  observacao?: string;
  vidasAtivas?: number;
  diaVencimento?: string;
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
  retemIss?: boolean;
  ativo?: boolean;

  contatos?: unidadeContato[];
  contratos?: ContratoInput[];
}

export interface EmpresaInput {
  nome: string;
  ativo?: boolean;
  idUsuario: number;
  unidades?: UnidadeInput[];
}