import type { ContratoProximo, DespesaCategoria, EvolucaoFaturamento, KpisResponse, ReceitaVsDespesa } from "../types/EstruturaDashBoard";
import type { ContaPagar } from "../types/EstruturaDespesa";
import type { Faturamento, Projecao } from "../types/EstruturaFaturamento";
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

export const getEvolucaoFaturamento = async (filtros: { ano?: string | Number}) => {
  return apiFetch<EvolucaoFaturamento[]>("/dashboard/evolucao-faturamento", {
    method: "POST",
    body: JSON.stringify(filtros),
  });
};

// Projeções
export const getProjecoes = async (filtros: any): Promise<Projecao[]> => {
  return apiFetch<Projecao[]>("/dashboard/projecoes", {
    method: "POST",
    body: JSON.stringify(filtros),
  });
};

export const getContratosProximos = async (): Promise<ContratoProximo[]> => {
  return apiFetch<ContratoProximo[]>("/dashboard/contratos-proximos", { method: "POST" });
};