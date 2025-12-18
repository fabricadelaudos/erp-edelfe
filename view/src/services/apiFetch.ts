import toast from "react-hot-toast";
import { obterDoStorage } from "../contexts/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

export async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {

  const dados = obterDoStorage();
  const token = dados?.token;

  const res = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();

  if (res.status === 403 || res.status === 401) {

    if (data.error?.includes("horário")) {
      localStorage.removeItem("token");
      toast.error("Sua sessão expirou, por favor, faca login novamente.");
      window.location.replace("/login");
      return Promise.reject(data);
    }
  }

  if (!res.ok) {
    throw new Error(data.error || 'Erro na requisição');
  }

  return data;
}

export async function apiPatch<T>(
  url: string,
  options: RequestInit = {}
): Promise<T | null> {

  const dados = obterDoStorage();
  const token = dados?.token;

  const res = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  // 🔥 Se não tem conteúdo, não tenta dar json()
  if (res.status === 204) {
    return null;
  }

  let data: any = null;

  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (res.status === 401 || res.status === 403) {
    if (data?.error?.includes("horário")) {
      localStorage.removeItem("token");
      toast.error("Sua sessão expirou, por favor, faça login novamente.");
      window.location.replace("/login");
      return Promise.reject(data);
    }
  }

  if (!res.ok) {
    throw new Error(data?.error || "Erro na requisição");
  }

  return data as T;
}