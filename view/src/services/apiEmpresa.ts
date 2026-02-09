import { apiFetch } from './apiFetch';
import type { Contato, Empresa, EnderecoCep } from '../types/EstruturaEmpresa';

export const getEmpresas = async (): Promise<Empresa[]> =>
  apiFetch<Empresa[]>('/empresa');

export const salvarEmpresa = async (data: { nome: string }): Promise<Empresa> =>
  apiFetch<Empresa>('/empresa', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const editarEmpresa = async (id: number, data: Empresa): Promise<Empresa> =>
  apiFetch<Empresa>(`/empresa/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export async function buscarCep(cep: string): Promise<EnderecoCep | null> {
  const cepLimpo = cep.replace(/\D/g, '');

  if (cepLimpo.length !== 8) return null;

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    const data: EnderecoCep = await response.json();

    if (data.erro) return null;

    return data;
  } catch (error) {
    console.error("Erro ao buscar CEP:", error);
    return null;
  }
}

export async function buscarCnpj(documento: string) {
  const cnpj = String(documento || "").replace(/\D/g, "");
  if (cnpj.length !== 14) return null;

  const url = `https://brasilapi.com.br/api/cnpj/v1/${cnpj}`;

  const res = await fetch(url);
  if (!res.ok) return null;

  return await res.json();
}

export const buscarContatos = async (idEmpresa: number): Promise<Contato[]> => apiFetch<Contato[]>(`/empresa/${idEmpresa}/contatos`);