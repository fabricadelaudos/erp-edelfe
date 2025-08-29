import { apiFetch } from './apiFetch';
import type { Empresa } from '../types/EstruturaEmpresa';

export const getEmpresas = async (): Promise<Empresa[]> =>
  apiFetch<Empresa[]>('/api/empresa');

export const salvarEmpresa = async (data: { nome: string }): Promise<Empresa> =>
  apiFetch<Empresa>('/api/empresa', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const editarEmpresa = async (id: number, data: Empresa): Promise<Empresa> =>
  apiFetch<Empresa>(`/api/empresa/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });