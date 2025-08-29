import { apiFetch } from './apiFetch';
import type { Usuario } from '../types/EstruturaUsuario';

export const getUsuario = async (): Promise<Usuario> => apiFetch<Usuario>('/api/usuario');