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
  contato: Contato[];
  contratos: Contrato[];
}

export interface Contato {
  idContato?: number;
  nome: string;
  email: string;
  emailSecundario?: string;
  telefoneFixo?: string;
  telefoneWpp?: string;
  fkUnidadeId?: number;
}

export interface Contrato {
  idContrato: number;
  dataInicio: string;
  dataFim?: string;
  parcelas?: number;
  valorBase?: string;        // Valor total do contrato (mensal)
  valorPorVida?: string;     // Apenas para por vida
  valorRecorrente?: string;  // Apenas para recorrente
  porVida: boolean;
  recorrente: boolean;
  status: "ATIVO" | "ENCERRADO" | "CANCELADO";
  faturadoPor: "MEDWORK" | "EDELFE";
  observacao?: string;
  // Campo temporário para cálculo de por vida
  vidasAtivasTemp?: number;
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