export interface KpisResponse {
  receitaPaga: number;
  despesaPaga: number;
  resultadoLiquido: number;
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