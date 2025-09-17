import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

import { toast } from "react-hot-toast";
import { Input } from "../../components/Inputs";

import logo from "../../media/logo.png";

export default function LoginPage() {

  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    await toast.promise(
      login(email, senha),
      {
        loading: "Entrando...",
        success: "Login realizado com sucesso!",
        error: (err) => err.message || "Erro ao fazer login",
      }
    );
    navigate("/");
  };

  return (
    <div className="min-h-screen flex">
      {/* Lado esquerdo: formulário */}
      <div className="w-full flex flex-col justify-center items-center px-8 bg-gray-100">
        <div className="w-full max-w-lg">
          <div className="flex items-center justify-center gap-2">
            <img src={logo} alt="Logo" className="w-8 h-8" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">Bem vindo de volta</h1>

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="E-mail"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="stanley@gmail.com"
            />

            <Input
              label="Senha"
              name="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="********"
            />

            <button
              type="submit"
              className="w-full bg-orange-400 hover:bg-orange-500 text-white font-semibold py-2 rounded transition"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
