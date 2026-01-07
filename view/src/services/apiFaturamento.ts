import type { Faturamento, FaturamentoOuProjecao } from "../types/EstruturaFaturamento";
import { apiFetch, apiPatch } from "./apiFetch";

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

export const editarFaturamentosEmMassa = async (
  lista: { id: number; dados: any }[]
) => {
  return apiFetch(`/faturamento/editarMassa`, {
    method: "PUT",
    body: JSON.stringify(lista),
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
  return apiFetch(`/faturamento/projecao`, {
    method: "PUT",
    body: JSON.stringify([{ id: dados.id, dados }]),
  });
};

export const editarProjecoesEmMassa = async (
  lista: { id: number; dados: any }[]
) => {
  return apiFetch(`/faturamento/projecao`, {
    method: "PUT",
    body: JSON.stringify(lista),
  });
};

export const toggleBoletoEmitido = async (id: number, valor: boolean) => {
  await apiPatch(`/faturamento/${id}/boleto`, {
    method: "PATCH",
    body: JSON.stringify({ boletoEmitido: valor }),
  });
};

export const toggleEmailEnviado = async (id: number, valor: boolean) => {
  await apiPatch(`/faturamento/${id}/email`, {
    method: "PATCH",
    body: JSON.stringify({ emailEnviado: valor }),
  });
};