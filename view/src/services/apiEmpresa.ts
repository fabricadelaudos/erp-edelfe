import { apiFetch } from './apiFetch';
import type { Empresa, EnderecoCep } from '../types/EstruturaEmpresa';

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