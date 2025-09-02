import type { Projecao } from "../types/EstruturaFaturamento";
import { apiFetch } from "./apiFetch";

export async function buscarProjecoesPendentes(competencia: string): Promise<Projecao[]> {
  return apiFetch<Projecao[]>(`/projecao/pendentes/${competencia}`);
}