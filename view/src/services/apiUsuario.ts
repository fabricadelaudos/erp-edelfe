import { apiFetch } from './apiFetch';
import type { Usuario } from '../types/EstruturaUsuario';

export const getUsuario = async (): Promise<Usuario> => apiFetch<Usuario>('/usuario');

export const criarUsuario = async (data: Partial<Usuario>): Promise<Usuario> => apiFetch<Usuario>('/usuario', { method: 'POST', body: JSON.stringify(data) });

export const editarUsuario = async (data: Partial<Usuario>): Promise<Usuario> => apiFetch<Usuario>('/usuario', { method: 'PUT', body: JSON.stringify(data) });

export const excluirUsuario = async (): Promise<Usuario> => apiFetch<Usuario>('/usuario', { method: 'DELETE' });

export const recuperarSenha = async (email: string): Promise<string> => {
  const response = await apiFetch<{ link: string }>('/usuario/recuperarSenha', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });

  return response.link;
};