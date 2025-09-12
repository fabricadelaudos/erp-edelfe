import type { DespesaCategoria, KpisResponse, ReceitaVsDespesa } from "../types/EstruturaDashBoard";
import type { ContaPagar } from "../types/EstruturaDespesa";
import type { Faturamento } from "../types/EstruturaFaturamento";
import { apiFetch } from "./apiFetch";

// Função auxiliar pra montar query string
function toQuery(params: Record<string, any>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) query.append(k, String(v));
  });
  return query.toString();
}

export const getKpis = async (params: { periodo: "mensal" | "anual"; competencia?: string; ano?: number }) =>
  apiFetch<KpisResponse>(`/dashboard/kpis?${toQuery(params)}`, { method: "GET" });

export const getReceitaVsDespesa = async (params: { periodo: "mensal" | "anual"; competencia?: string; ano?: number }) =>
  apiFetch<ReceitaVsDespesa[] | ReceitaVsDespesa>(`/dashboard/receita-vs-despesa?${toQuery(params)}`, { method: "GET" });

export const getDespesasCategoria = async (params: { periodo: "mensal" | "anual"; competencia?: string; ano?: number }) =>
  apiFetch<DespesaCategoria[]>(`/dashboard/despesas-categoria?${toQuery(params)}`, { method: "GET" });

export const getFaturamentosRecentes = async (limit = 10) =>
  apiFetch<Faturamento[]>(`/dashboard/faturamentos-recentes?limit=${limit}`, { method: "GET" });

export const getDespesasRecentes = async (limit = 10) =>
  apiFetch<ContaPagar[]>(`/dashboard/despesas-recentes?limit=${limit}`, { method: "GET" });
