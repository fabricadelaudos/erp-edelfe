export interface FaturamentoOuProjecao {
  id: number;
  tipo: "PROJECAO" | "FATURAMENTO";
  competencia: string;
  valorPrevisto: number; // valor genérico (usa valorPrevisto ou valorTotal)
  vidas?: number | null;
  status: string;
  numeroNota?: string;

  // Dados comuns
  empresa?: string;
  unidade?: string;
  cnpj?: string;
  cidade?: string;
  uf?: string;
  faturadoPor?: string;
  esocial?: boolean | null;
  laudos?: boolean | null;
  pagoEm?: string;
  vencimento?: string;

  boletoEmitido?: boolean;
  emailEnviado?: boolean;

  // Só para FATURAMENTO
  valorBase?: number;
  valorTotal?: number;
  impostoPorcentagem?: number;
  impostoValor?: number;
}