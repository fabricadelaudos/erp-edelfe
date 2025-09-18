export interface Empresa {
  idEmpresa: number;
  nome: string;
  ativo: boolean;
  unidades?: Unidade[];
}

export interface Unidade {
  idUnidade: number;
  fkEmpresaId: number;
  nomeFantasia: string;
  razaoSocial: string;
  tipoDocumento: 'CNPJ' | 'CAEPF';
  documento: string;
  inscricaoEstadual?: string;
  endereco: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  ativo: boolean;
  observacao?: string;
  retemIss?: boolean;
  contatos: Contato[];
  contratos: Contrato[];
  enderecoCep?: EnderecoCep;
  empresa?: Empresa;
}

export interface Contato {
  idContato?: number;
  nome: string;
  email: string;
  emailSecundario?: string;
  telefoneFixo?: string;
  telefoneWpp?: string;
}

export interface Contrato {
  idContrato: number;
  dataInicio: string;
  dataFim?: string;
  parcelas?: number;
  valorBase?: string;
  valorPorVida?: string;
  valorRecorrente?: string;
  porVida: boolean;
  recorrente: boolean;
  status: "ATIVO" | "ENCERRADO" | "CANCELADO";
  faturadoPor: "MEDWORK" | "EDELFE";
  esocial?: boolean;
  laudos?: boolean;
  observacao?: string;
  vidas?: number;
  diaVencimento?: string;
  unidade?: Unidade;
}

export interface EnderecoCep {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}