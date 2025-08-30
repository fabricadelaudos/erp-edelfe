import { useMemo, useState } from "react";
import type { Contato } from "../../types/EstruturaEmpresa";
import FormContato from "../Formularios/FormContato";
import ModalBase from "../Modais/ModalBase"; // mesmo ModalBase que você já usa em EmpresaPage
import { Pencil, Trash2, Plus } from "lucide-react";

interface Props {
  contatos: Contato[];
  onChange: (contatos: Contato[]) => void;
}

export default function ListaContato({ contatos = [], onChange }: Props) {
  const [aberto, setAberto] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const contatoEmEdicao = useMemo<Contato | null>(() => {
    if (editIndex === null) return null;
    return contatos[editIndex] ?? null;
  }, [editIndex, contatos]);

  const abrirNovo = () => {
    const length = Array.isArray(contatos) ? contatos.length : null;
    setEditIndex(length);
    setAberto(true);
  };

  const abrirEditar = (index: number) => {
    setEditIndex(index);
    setAberto(true);
  };

  const remover = (index: number) => {
    const novos = contatos.filter((_, i) => i !== index);
    onChange(novos);
  };

  const salvar = (c: Contato) => {
    const novos = [...contatos];
    if (editIndex === contatos.length) {
      novos.push(c);
    } else if (editIndex !== null && editIndex >= 0) {
      novos[editIndex] = c;
    }
    onChange(novos);
    setAberto(false);
    setEditIndex(null);
  };

  const cancelar = () => {
    setAberto(false);
    setEditIndex(null);
  };

  const isNovoContato = editIndex !== null && Array.isArray(contatos) && editIndex === contatos.length;

  return (
    <div className="space-y-3">
      <div className="w-full flex justify-end">
        <button
          onClick={abrirNovo}
          className="flex items-center gap-2 text-sm bg-orange-400 px-4 py-2 rounded hover:bg-orange-500 text-white"
        >
          <Plus size={16} />
          Adicionar Contato
        </button>
      </div>

      {/* Tabela simples */}
      <div className="rounded-md border border-gray-200 overflow-hidden">
        <table className="w-full bg-white text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="px-3 py-2 text-left">Nome</th>
              <th className="px-3 py-2 text-left">Email</th>
              <th className="px-3 py-2 text-left">Telefone</th>
              <th className="px-3 py-2 text-left">WhatsApp</th>
              <th className="px-3 py-2 text-center w-28">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {Array.isArray(contatos) && contatos.length > 0 ? (
              contatos.map((c, i) => (
                <tr key={i} className={i % 2 ? "bg-gray-50" : "bg-white"}>
                  <td className="px-3 py-2">{c.nome || "—"}</td>
                  <td className="px-3 py-2">{c.email || "—"}</td>
                  <td className="px-3 py-2">{c.telefoneFixo || "—"}</td>
                  <td className="px-3 py-2">{c.telefoneWpp || "—"}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => abrirEditar(i)}
                        className="text-blue-500 hover:text-blue-700"
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => remover(i)}
                        className="text-red-500 hover:text-red-700"
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-gray-500">
                  Nenhum contato adicionado.
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>

      {/* Modal de criação/edição */}
      <ModalBase
        titulo={isNovoContato ? "Novo Contato" : "Editar Contato"}
        isOpen={aberto}
        onClose={cancelar}
      >
        {aberto && (
          <FormContato
            contato={
              contatoEmEdicao ?? {
                nome: "",
                email: "",
                emailSecundario: "",
                telefoneFixo: "",
                telefoneWpp: "",
              }
            }
            onSave={salvar}
            onCancel={cancelar}
          />
        )}
      </ModalBase>
    </div>
  );
}