import { createContext, useContext, useEffect, useState } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import type { Usuario } from "../types/EstruturaUsuario";

const API_URL = import.meta.env.VITE_API_URL;
const STORAGE_KEY = import.meta.env.VITE_STORAGE_KEY;

interface AuthContextType {
  user: Usuario | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
  token: string | null;
}

function salvarNoStorage(dados: { token: string; user: Usuario }) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
}

export function obterDoStorage() {
  const dados = localStorage.getItem(STORAGE_KEY);
  if (!dados) return null;
  try {
    return JSON.parse(dados) as { token: string; user: Usuario };
  } catch {
    return null;
  }
}

function limparStorage() {
  localStorage.removeItem(STORAGE_KEY);
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restaurarSessao = async () => {
      const dados = obterDoStorage();

      if (!dados || !dados.token || !dados.user) {
        await logout();
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/auth/verify`, {
          headers: {
            Authorization: `Bearer ${dados.token}`,
          },
        });

        if (!res.ok) throw new Error("Token inválido");

        setUser(dados.user);
        setToken(dados.token);
      } catch {
        await logout();
      } finally {
        setLoading(false);
      }
    };

    restaurarSessao();
  }, []);

  const login = async (email: string, senha: string): Promise<void> => {
    try {
      setLoading(true);
      const cred = await signInWithEmailAndPassword(auth, email, senha);
      const firebaseUser = cred.user;
      const firebaseToken = await firebaseUser.getIdToken();

      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: firebaseToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "Erro ao validar no backend.");
      }

      salvarNoStorage({ token: data.token, user: data.usuario });
      setUser(data.usuario);
      setToken(data.token);
    } catch (err: any) {
      console.error("Erro no login:", err);
      throw new Error(err.message || "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);

      if (token) {
        const res = await fetch(`${API_URL}/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || data.erro);
        }
      }

      limparStorage();
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error("Erro ao deslogar:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
