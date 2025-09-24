import { useState, useEffect } from "react";
import type { Usuario } from "../../types/EstruturaUsuario";
import { Input, ToggleInput } from "../Inputs";
import Spinner from "../Loading";

interface Props {
  usuario?: Usuario | null;
  onSalvar: (dados: Partial<Usuario>) => void;
  onCancelar: () => void;
  loading?: boolean;
}

export default function FormUsuario({ usuario, onSalvar, onCancelar, loading = false }: Props) {
  const [dados, setDados] = useState<Partial<Usuario>>({
    nome: "",
    email: "",
    ativo: true,
  });

  useEffect(() => {
    if (usuario) {
      setDados(usuario);
    } else {
      setDados({
        nome: "",
        email: "",
        ativo: true,
      });
    }
  }, [usuario]);

  const handleChange = (campo: keyof Usuario, valor: any) => {
    setDados((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loading) onSalvar(dados);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          label="Nome"
          name="nome"
          value={dados.nome || ""}
          onChange={(e) => handleChange("nome", e.target.value)}
          required
        />

        <Input
          label="E-mail"
          name="email"
          type="email"
          value={dados.email || ""}
          onChange={(e) => handleChange("email", e.target.value)}
          required
        />

        <ToggleInput
          label="Ativo"
          value={!!dados.ativo}
          onChange={(val) => setDados((prev) => ({ ...prev, ativo: val }))}
        />
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancelar}
          className="px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-100"
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-5 py-2 rounded bg-green-600 text-white hover:bg-green-700 flex items-center justify-center gap-2"
          disabled={loading}
        >
          {loading && <Spinner size={18} className="text-white" />}
          {loading ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
}