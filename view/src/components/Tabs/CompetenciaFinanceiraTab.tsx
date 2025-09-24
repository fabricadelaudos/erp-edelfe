import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import ModalBase from "../Modais/ModalBase";
import { buscarCompetencias, criarCompetencia, editarCompetencia } from "../../services/apiCompetencia";
import TabelaBase from "../Tabelas/TabelaBase";
import FormCompetencia from "../Formularios/FormCompetencia";
import { formatarCompetenciaParaExibicao } from "../Auxiliares/formatter";
import type { CompetenciaFinanceira } from "../../types/EstruturaCompetencia";

export default function CompetenciaFinanceiraTab() {
  const [competencias, setCompetencias] = useState<CompetenciaFinanceira[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [form, setForm] = useState({ competencia: "", imposto: "", ipca: "", iss: "" });
  const [erro, setErro] = useState("");
  const [editando, setEditando] = useState<CompetenciaFinanceira | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const carregarCompetencias = async () => {
      try {
        setLoading(true);
        const data = await buscarCompetencias();
        setCompetencias(data);
      } catch (err) {
        console.error("Erro ao carregar competências", err);
      } finally {
        setLoading(false);
      }
    };

    carregarCompetencias();
  }, []);

  const abrirNovo = () => {
    setEditando(null);
    setForm({ competencia: "", imposto: "", ipca: "", iss: "" });
    setModalAberto(true);
  };

  const abrirEdicao = (row: CompetenciaFinanceira) => {
    setEditando(row);
    setForm({
      competencia: row.competencia,
      imposto: String(row.imposto),
      ipca: String(row.ipca),
      iss: String(row.iss),
    });
    setModalAberto(true);
  };

  const salvar = async () => {
    setErro("");
    try {
      setLoading(true);
      if (editando) {
        // editar
        const atualizado = await editarCompetencia(editando.idCompetenciaFinanceira, form);
        setCompetencias(
          competencias.map((c) =>
            c.idCompetenciaFinanceira === atualizado.idCompetenciaFinanceira ? atualizado : c
          )
        );
      } else {
        const nova = await criarCompetencia(form);
        setCompetencias([...competencias, nova]);
      }
      setModalAberto(false);
      setForm({ competencia: "", imposto: "", ipca: "", iss: "" });
      setEditando(null);
    } catch (error: any) {
      setErro(error?.message ?? "Erro ao salvar competência.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Competências</h2>
        <button
          onClick={abrirNovo}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
        >
          <Plus size={16} /> Adicionar
        </button>
      </div>

      <TabelaBase<CompetenciaFinanceira>
        columns={[
          { header: "Competência", accessor: "competencia", render: (value) => formatarCompetenciaParaExibicao(value) },
          { header: "Imposto", accessor: "imposto", render: (value) => `${value}%` },
          { header: "IPCA", accessor: "ipca", render: (value) => `${value}%` },
          { header: "ISS", accessor: "iss", render: (value) => `${value}%` },
        ]}
        data={competencias}
        onEdit={abrirEdicao}
        isLoading={loading}
      />

      <ModalBase
        titulo={editando ? "Editar Competência" : "Nova Competência"}
        isOpen={modalAberto}
        onClose={() => {
          setModalAberto(false);
          setEditando(null);
        }}
      >
        {erro && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 border border-red-300 text-sm">
            {erro}
          </div>
        )}
        <FormCompetencia form={form} setForm={setForm} onSalvar={salvar} loading={loading} />
      </ModalBase>
    </div>
  );
}
