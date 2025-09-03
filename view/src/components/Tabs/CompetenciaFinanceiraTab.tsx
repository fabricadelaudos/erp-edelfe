import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import ModalBase from "../Modais/ModalBase";
import { buscarCompetencias, criarCompetencia } from "../../services/apiCompetencia";
import TabelaBase from "../Tabelas/TabelaBase";
import FormCompetencia from "../Formularios/FormCompetencia";
import { formatarCompetenciaParaExibicao } from "../Auxiliares/formatter";

interface Competencia {
  idCompetenciaFinanceira: number;
  competencia: string;
  imposto: number;
  ipca: number;
  iss: number;
}

export default function CompetenciaFinanceiraTab() {
  const [competencias, setCompetencias] = useState<Competencia[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [form, setForm] = useState({ competencia: "", imposto: "", ipca: "", iss: "" });
  const [erro, setErro] = useState("");

  useEffect(() => {
    buscarCompetencias().then(setCompetencias);
  }, []);

  const salvar = async () => {
    setErro("");
    try {
      const nova = await criarCompetencia(form);
      setCompetencias([...competencias, nova]);
      setModalAberto(false);
      setForm({ competencia: "", imposto: "", ipca: "", iss: "" });
    } catch (error: any) {
      if (error?.message) {
        setErro(error.message);
      } else {
        setErro("Erro ao salvar competência.");
      }
    }
  };


  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Competências</h2>
        <button
          onClick={() => setModalAberto(true)}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
        >
          <Plus size={16} /> Adicionar
        </button>
      </div>

      <TabelaBase
        data={competencias}
        columns={[
          {
            header: "Competência",
            accessor: "competencia",
            render: (valor) => formatarCompetenciaParaExibicao(valor),
          },
          {
            header: "Imposto",
            accessor: "imposto",
            render: (valor) => `${Number(valor).toFixed(2)}%`,
          },
          {
            header: "IPCA",
            accessor: "ipca",
            render: (valor) => `${Number(valor).toFixed(2)}%`,
          },
          {
            header: "ISS",
            accessor: "iss",
            render: (valor) => `${Number(valor).toFixed(2)}%`,
          },
        ]}
      />

      <ModalBase titulo="Nova Competência" isOpen={modalAberto} onClose={() => setModalAberto(false)}>
        {erro && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 border border-red-300 text-sm">
            {erro}
          </div>
        )}
        <FormCompetencia
          form={form}
          setForm={setForm}
          onSalvar={salvar}
        />
      </ModalBase>
    </div>
  );
}
