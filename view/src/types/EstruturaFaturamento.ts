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
}

export interface Projecao {
  idProjecao: number;
  fkContratoId: number;
  valorBase: string;
  impostoPorcentagem: string;
  impostoValor: string;
  valorTotal: string;
}