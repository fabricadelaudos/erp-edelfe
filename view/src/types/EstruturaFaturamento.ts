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
  cidade?: string;
  uf?: string;
  faturadoPor?: string;
  esocial?: boolean;
  laudos?: boolean;
  pagoEm?: string;
  vencimento?: string;

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