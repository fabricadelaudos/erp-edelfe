import type { Banco } from "../../types/EstruturaDespesa";
import { Input } from "../Inputs";
import CheckboxStatus from "../Inputs";

interface Props {
  form: Banco;
  setForm: React.Dispatch<React.SetStateAction<Banco>>;
  onSalvar: () => void;
}

export default function FormBanco({ form, setForm, onSalvar }: Props) {
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
        className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
      >
        Salvar
      </button>
    </div>
  );
}