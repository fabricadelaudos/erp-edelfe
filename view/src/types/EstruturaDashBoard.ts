export interface KpisResponse {
  faturamento: number;
  contasPagar: number;
  imposto: number;
  lucro: number;
}

export interface ReceitaVsDespesa {
  competencia: string;
  receita: number;
  despesa: number;
}

export interface DespesaCategoria {
  categoria: string;
  valor: number;
}

export interface FaturamentoResumo {
  id: number;
  competencia: string;
  valor: number;
  status: string;
  unidade?: string;
}

// Evolução do Faturamento
export interface EvolucaoFaturamento {
  mes: string;   // ex: "01/2025"
  valor: number;
}

// Projeções
export interface Projecao {
  competencia: string;   // ex: "2025-09"
  previsto: number;
  realizado: number;
  status: string;        // "PARCIAL" | "CONCLUIDO" | etc.
}

export interface ProjecaoMensal {
  mes: string;       // "jan/25"
  recebido: number;  // valor recebido no mês
  aVencer: number;   // valor a vencer no mês
  atrasado: number;  // valor atrasado no mês
}

export interface ProjecaoUnidade {
  unidade: string;
  meses: { mes: string; recebido: number; aVencer: number; atrasado: number }[];
}

export interface ContratoProximo {
  contrato: string;
  vencimento: string;
  valor: number;
}