import type { CompetenciaFinanceira } from "../types/EstruturaCompetencia";
import { apiFetch } from "./apiFetch";

export interface CompetenciaFinanceiraInput {
  competencia: string;
  imposto: string;
  ipca: string;
}

export async function buscarCompetenciaAtual(): Promise<CompetenciaFinanceira> {
  return apiFetch<CompetenciaFinanceira>(`/competencia/atual`);
}

export async function buscarCompetencias(): Promise<CompetenciaFinanceira[]> {
  return apiFetch<CompetenciaFinanceira[]>("/competencia");
}

export async function criarCompetencia(
  dados: CompetenciaFinanceiraInput
): Promise<CompetenciaFinanceira> {
  return apiFetch<CompetenciaFinanceira>("/competencia", {
    method: "POST",
    body: JSON.stringify({
      ...dados,
      imposto: Number(dados.imposto),
      ipca: Number(dados.ipca),
    }),
  });
}
