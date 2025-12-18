import type { Contrato } from "./EstruturaEmpresa";

export interface Faturamento {
  idFaturamento: number;
  fkContratoId: number;
  contrato?: Contrato;
  valorBase: number;
  impostoPorcentagem: number;
  impostoValor: number;
  valorTotal: number;
  vidas?: number;
  numeroNota?: string;
  status: "ABERTA" | "PAGA" | "ATRASADA";
  competencia: string;
  competenciaPagamento?: string;
  pagoEm?: string;
  boletoEmitido?: boolean;
  emailEnviado?: boolean;
}

export interface Projecao {
  idProjecao: number;
  fkContratoId: number;
  valorBase: string;
  impostoPorcentagem: string;
  impostoValor: string;
  valorTotal: string;
}

export interface FaturamentoOuProjecao {
  id: number;
  tipo: "PROJECAO" | "FATURAMENTO";
  competencia: string;
  valorPrevisto: number;

  // novos campos
  valorBase?: number;
  valorTotal?: number;
  impostoPorcentagem?: number;
  impostoValor?: number;

  vidas?: number;
  status: string;
  numeroNota?: string;
  empresa?: string;
  unidade?: string;
  cnpj?: string;
  endereco?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
  faturadoPor?: string;
  esocial?: boolean;
  laudos?: boolean;
  pagoEm?: string;
  vencimento?: string;
  boletoEmitido?: boolean;
  emailEnviado?: boolean;

  contatos?: {
    idContato: number;
    nome: string;
    email?: string;
    emailSecundario?: string;
    telefoneWpp?: string;
    telefoneFixo?: string;
  }[];

  contrato?: Contrato;
}