import type { Banco } from "../../types/EstruturaDespesa";
import { Input } from "../Inputs";
import CheckboxStatus from "../Inputs";
import Spinner from "../Loading";

interface Props {
  form: Banco;
  setForm: React.Dispatch<React.SetStateAction<Banco>>;
  onSalvar: () => void;
  loading?: boolean;
}

export default function FormBanco({ form, setForm, onSalvar, loading = false }: Props) {
  return (
    <div className="flex items-center gap-4">
      <Input
        label="Nome do Banco"
        name="nome"
        value={form.nome}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setForm({ ...form, nome: e.target.value })
        }
        placeholder="Ex: Banco do Brasil"
      />

      <div className="flex flex-col items-center">
        <label className="block mb-1 text-sm font-medium text-gray-900">Ativo</label>
        <CheckboxStatus
          checked={form.ativo}
          onChange={(checked) => setForm({ ...form, ativo: checked })}
        />
      </div>

      <button
        onClick={onSalvar}
        disabled={loading}
        className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <div className="flex items-center gap-2">
              <Spinner size={20} className="text-white" />
              <span>Salvando...</span>
            </div>
          </>
        ) : "Salvar"}
      </button>
    </div>
  );
}