import { useMemo, useState } from "react";
import type { Contrato } from "../../types/EstruturaEmpresa";
import ModalBase from "../Modais/ModalBase";
import FormContrato from "../Formularios/FormContrato";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { formatarData, formatarReais } from "../Auxiliares/formatter";

interface Props {
  contratos: Contrato[];
  onChange: (contratos: Contrato[]) => void;
}

export default function ListaContratos({ contratos = [], onChange }: Props) {
  const [aberto, setAberto] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<Contrato | null>(null);

  const list = useMemo(() => {
    // Ordena por dataInicio desc para visual (opcional)
    return [...contratos].sort((a, b) => (b.dataInicio || "").localeCompare(a.dataInicio || ""));
  }, [contratos]);

  const openNovo = () => {
    setDraft({
      idContrato: 0,
      dataInicio: "",
      dataFim: "",
      parcelas: 1,
      valorBase: "",
      porVida: false,
      recorrente: false,
      status: "ATIVO",
      faturadoPor: "EDELFE",
      observacao: "",
    });
    setEditIndex(null);
    setAberto(true);
  };

  const openEditar = (originalIndex: number) => {
    // como exibimos ordenado, precisamos achar o índice no array original:
    const row = list[originalIndex];
    const idxInOriginal = contratos.findIndex((c) => c === row);
    setEditIndex(idxInOriginal);
    setDraft({ ...contratos[idxInOriginal] });
    setAberto(true);
  };

  const closeModal = () => {
    setAberto(false);
    setEditIndex(null);
    setDraft(null);
  };

  const salvar = (novo: Contrato) => {
    const novos = [...contratos];
    if (editIndex == null) {
      novos.push(novo);
    } else {
      novos[editIndex] = novo;
    }
    onChange(novos);
    closeModal();
  };

  const remover = (originalIndex: number) => {
    const row = list[originalIndex];
    const idxInOriginal = contratos.findIndex((c) => c === row);
    if (idxInOriginal === -1) return;
    if (confirm("Deseja remover este contrato?")) {
      const novos = contratos.filter((_, i) => i !== idxInOriginal);
      onChange(novos);
      // Se estava editando esse mesmo item no modal, fecha
      if (aberto && editIndex === idxInOriginal) closeModal();
    }
  };

  const statusBadge = (s: Contrato["status"]) => {
    const map: Record<Contrato["status"], string> = {
      ATIVO: "bg-green-100 text-green-800",
      ENCERRADO: "bg-gray-300 text-gray-800",
      CANCELADO: "bg-red-100 text-red-800",
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${map[s] || "bg-gray-100 text-gray-800"}`}>
        {s}
      </span>
    );
  };

  return (
    <div className="space-y-3">
      <div className="w-full flex justify-end">
        <button
          onClick={openNovo}
          className="flex items-center gap-2 text-sm bg-orange-400 px-4 py-2 rounded hover:bg-orange-500 text-white"
        >
          <Plus size={16} />
          Adicionar Contrato
        </button>
      </div>

      <div className="rounded-md border border-gray-200 overflow-hidden text-center">
        <table className="w-full bg-white text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">Modalidade</th>
              <th className="px-3 py-2">Início</th>
              <th className="px-3 py-2">Fim</th>
              <th className="px-3 py-2">Valor Base</th>
              <th className="px-3 py-2">Parcelas</th>
              <th className="px-3 py-2">Por Vida</th>
              <th className="px-3 py-2">Recorrente</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Faturado por</th>
              <th className="px-3 py-2 w-28">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {list.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-3 py-6 text-gray-500">
                  Nenhum contrato cadastrado.
                </td>
              </tr>
            ) : (
              list.map((c, i) => (
                <tr key={i} className={i % 2 ? "bg-gray-50" : "bg-white"}>
                  <td className="px-3 py-2">{c.idContrato}</td>
                  <td className="px-3 py-2">{c.esocial && "e-Social"} - {c.laudos && "Laudos"}</td>
                  <td className="px-3 py-2">{formatarData(c.dataInicio)}</td>
                  <td className="px-3 py-2">{formatarData(c.dataFim)}</td>
                  <td className="px-3 py-2">{formatarReais(c.valorBase)}</td>
                  <td className="px-3 py-2">{c.parcelas ?? "—"}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-block w-3 h-3 rounded-full ${c.porVida ? "bg-green-500" : "bg-gray-300"
                        }`}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-block w-3 h-3 rounded-full ${c.recorrente ? "bg-green-500" : "bg-gray-300"
                        }`}
                    />
                  </td>
                  <td className="px-3 py-2">{statusBadge(c.status)}</td>
                  <td className="px-3 py-2">{c.faturadoPor}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEditar(i)}
                        className="text-blue-600 hover:text-blue-700"
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => remover(i)}
                        className="text-red-500 hover:text-red-600"
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ModalBase
        titulo={editIndex == null ? "Novo Contrato" : "Editar Contrato"}
        isOpen={aberto}
        onClose={closeModal}
      >
        {aberto && draft && (
          <FormContrato
            contrato={draft}
            onChange={setDraft}
            onSave={salvar}
            onCancel={closeModal}
          />
        )}
      </ModalBase>
    </div>
  );
}