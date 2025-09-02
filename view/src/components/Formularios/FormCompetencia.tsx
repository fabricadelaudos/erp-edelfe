import { Input } from "../Inputs";

interface Props {
  form: {
    competencia: string;
    imposto: string;
    ipca: string;
  };
  setForm: React.Dispatch<React.SetStateAction<{
    competencia: string;
    imposto: string;
    ipca: string;
  }>>;
  onSalvar: () => void;
}

export default function FormCompetencia({ form, setForm, onSalvar }: Props) {
  return (
    <div className="space-y-4">
      <Input
        label="Competência (MM/AAAA)"
        name="competencia"
        value={form.competencia}
        onChange={(e) => setForm({ ...form, competencia: e.target.value })}
        placeholder="09/2025"
      />

      <Input
        label="Imposto (%)"
        name="imposto"
        type="number"
        step={0.01}
        value={form.imposto}
        onChange={(e) => setForm({ ...form, imposto: e.target.value })}
      />

      <Input
        label="IPCA (%)"
        name="ipca"
        type="number"
        step={0.01}
        value={form.ipca}
        onChange={(e) => setForm({ ...form, ipca: e.target.value })}
      />

      <div className="text-right">
        <button
          onClick={onSalvar}
          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
        >
          Salvar
        </button>
      </div>
    </div>
  );
}
