import type { Faturamento, FaturamentoOuProjecao } from "../types/EstruturaFaturamento";
import { apiFetch } from "./apiFetch";

export interface FaturamentoInput {
  fkContratoId: number;
  fkProjecaoId?: number;
  fkCompetenciaFinanceiraId: number;
  competencia: string;
  valorBase: string;
  impostoPorcentagem: string;
  impostoValor: string;
  valorTotal: string;
  status: string;
  vidas?: number;
  pagoEm?: string;
  competenciaPagamento?: string;
  numeroNota?: string;
}

export async function buscarFaturamentosPorContrato(idContrato: number): Promise<Faturamento[]> {
  return apiFetch<Faturamento[]>(`/faturamento/contrato/${idContrato}`);
}

export async function buscarFaturamentoPorCompetencia(competencia: string): Promise<Faturamento[]> {
  const competenciaEncoded = encodeURIComponent(competencia);
  return apiFetch<Faturamento[]>(`/faturamento/competencia/${competenciaEncoded}`);
}

export async function gerarFaturamentoPorCompetencia(competencia: string): Promise<Faturamento[]> {
  return apiFetch<Faturamento[]>(`/faturamento/gerar`, {
    method: "POST",
    body: JSON.stringify({ competencia }),
  });
}

export const editarFaturamento = async (dados: FaturamentoOuProjecao) => {
  return apiFetch(`/faturamento/${dados.id}`, {
    method: "PUT",
    body: JSON.stringify(dados),
  });
};

export const buscarFaturamentoOuProjecao = async (): Promise<FaturamentoOuProjecao[]> => {
  return apiFetch<FaturamentoOuProjecao[]>("/faturamento/completo");
};

export const gerarFaturamentoDeProjecao = async (id: number) => {
  return apiFetch(`/faturamento/gerar/${id}`, {
    method: "POST",
  });
};

export const editarProjecao = async (dados: FaturamentoOuProjecao) => {
  return apiFetch(`/faturamento/projecao/${dados.id}`, {
    method: "PUT",
    body: JSON.stringify(dados),
  });
};