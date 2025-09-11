import type {
  Banco,
  PlanoContaCategoria,
  Fornecedor,
  ContaPagar,
  ParcelaContaPagar,
} from "../types/EstruturaDespesa";
import { apiFetch } from "./apiFetch";


const baseBanco = "/banco";
const basePlanoConta = "/planoConta";
const baseFornecedor = "/fornecedor";
const baseConta = "/contaPagar";

// Contas a Pagar
export async function buscarContasPagar(): Promise<ContaPagar[]> {
  return await apiFetch(baseConta);
}

export async function buscarContaPagar(id: number): Promise<ContaPagar> {
  return await apiFetch(`${baseConta}/${id}`);
}

export async function criarContaPagar(data: any): Promise<ContaPagar> {
  return await apiFetch(baseConta, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function editarContaPagar(id: number, data: any): Promise<ContaPagar> {
  return await apiFetch(`${baseConta}/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function confirmarPagamentoParcela(idParcela: number): Promise<ParcelaContaPagar> {
  return await apiFetch(`${baseConta}/${idParcela}/pagar`, {
    method: "PUT",
  });
}

//  Fornecedor
export async function buscarFornecedores(): Promise<Fornecedor[]> {
  return await apiFetch(baseFornecedor);
}

export async function criarFornecedor(data: Partial<Fornecedor>): Promise<Fornecedor> {
  return await apiFetch(baseFornecedor, {
    method: "POST",
    body: JSON.stringify(data),
  });
}


export async function editarFornecedor(id: number, data: Partial<Fornecedor>): Promise<Fornecedor> {
  return await apiFetch(`${baseFornecedor}/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// Banco
export async function buscarBancos(): Promise<Banco[]> {
  return await apiFetch(baseBanco);
}


export async function criarBanco(data: Partial<Banco>): Promise<Banco> {
  return await apiFetch(baseBanco, {
    method: "POST",
    body: JSON.stringify(data),
  });
}


export async function editarBanco(id: number, data: Partial<Banco>): Promise<Banco> {
  return await apiFetch(`${baseBanco}/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// Plano de Contas
export async function buscarPlanoContas(): Promise<PlanoContaCategoria[]> {
  return await apiFetch(basePlanoConta);
}


export async function salvarPlanoConta(data: Partial<PlanoContaCategoria> & { subcategorias: { idPlanoContaSubCategoria?: number; nome: string }[] }): Promise<PlanoContaCategoria> {
  return await apiFetch(`${basePlanoConta}/salvar`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}