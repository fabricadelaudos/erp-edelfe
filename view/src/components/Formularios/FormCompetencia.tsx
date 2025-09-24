import { Input } from "../Inputs";
import Spinner from "../Loading";

interface Props {
  form: {
    competencia: string;
    imposto: string;
    ipca: string;
    iss: string;
  };
  setForm: React.Dispatch<React.SetStateAction<{
    competencia: string;
    imposto: string;
    ipca: string;
    iss: string;
  }>>;
  onSalvar: () => void;
  loading?: boolean;
}

export default function FormCompetencia({ form, setForm, onSalvar, loading = false }: Props) {
  return (
    <div className="space-y-4">
      <Input
        label="Competência (MM/AAAA)"
        type="month"
        name="competencia"
        value={
          form.competencia
            ? `${form.competencia.split("/")[1]}-${form.competencia.split("/")[0]}`
            : ""
        }
        onChange={(e) => {
          const [ano, mes] = e.target.value.split("-");
          setForm({ ...form, competencia: `${mes}/${ano}` });
        }}
        required
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

      <Input
        label="ISS (%)"
        name="iss"
        type="number"
        step={0.01}
        value={form.iss}
        onChange={(e) => setForm({ ...form, iss: e.target.value })}
      />

      <div className="text-right">
        <button
          onClick={onSalvar}
          disabled={loading}
          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Spinner size={16} className="text-white" />
              <span>Salvando...</span>
            </div>
          ) : "Salvar"}
        </button>
      </div>
    </div>
  );
}
