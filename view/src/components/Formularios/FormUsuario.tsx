import { useState, useEffect } from "react";
import type { Usuario } from "../../types/EstruturaUsuario";
import { Input, ToggleInput } from "../Inputs";

interface Props {
  usuario?: Usuario | null;
  onSalvar: (dados: Partial<Usuario>) => void;
  onCancelar: () => void;
}

export default function FormUsuario({ usuario, onSalvar, onCancelar }: Props) {
  const [dados, setDados] = useState<Partial<Usuario>>({
    nome: "",
    email: "",
    ativo: true,
  });

  // 🧠 Esse efeito sincroniza o estado com a prop ao abrir o modal
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
    onSalvar(dados);
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
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-5 py-2 rounded bg-green-600 text-white hover:bg-green-700"
        >
          Salvar
        </button>
      </div>
    </form>
  );
}
