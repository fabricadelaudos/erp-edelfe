import { useMemo, useState } from "react";
import type { Contato, unidadeContato } from "../../types/EstruturaEmpresa";
import FormContato from "../Formularios/FormContato";
import ModalBase from "../Modais/ModalBase";
import { Pencil, Trash2, Plus } from "lucide-react";
import { formatarTelefone } from "../Auxiliares/formatter";
import Swal from "sweetalert2";

interface Props {
  contatos: unidadeContato[];
  contatosEmpresa?: Contato[];
  onChange: (contatos: unidadeContato[]) => void;
  unidadeIdAtual: number
}

export default function ListaContato({ contatos = [], contatosEmpresa = [], onChange, unidadeIdAtual }: Props) {
  const [aberto, setAberto] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const contatoEmEdicao = useMemo<Contato | null>(() => {
    if (editIndex === null) return null;
    return contatos[editIndex]?.contato ?? null;
  }, [editIndex, contatos]);
  const contatosExtraidos: Contato[] = useMemo(() => {
    return contatos
      .filter((v) => v.fkUnidadeId === unidadeIdAtual)
      .map((v) => v.contato);
  }, [contatos, unidadeIdAtual]);

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
    Swal.fire({
      title: "Tem certeza?",
      text: "Você deseja remover este contato?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sim, remover",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        const novos = contatos.filter((_, i) => i !== index);
        onChange(novos);

        Swal.fire("Removido!", "O contato foi removido com sucesso.", "success");
      }
    });
  };

  const salvar = (c: Contato) => {
    const novos = [...contatos];

    const novoVinculo: unidadeContato = {
      fkUnidadeId: unidadeIdAtual,
      fkContatoId: c.idContato ?? 0,
      contato: c,
      idUnidadeContato: Date.now(),
    };

    if (editIndex === contatos.length) {
      novos.push(novoVinculo);
    } else if (editIndex !== null && editIndex >= 0) {
      novos[editIndex] = novoVinculo;
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
      <div className="rounded-md border border-gray-200 overflow-hidden text-center">
        <table className="w-full bg-white text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="px-3 py-2">Nome</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Telefone</th>
              <th className="px-3 py-2">WhatsApp</th>
              <th className="px-3 py-2 text-center w-28">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {Array.isArray(contatosExtraidos) && contatosExtraidos.length > 0 ? (
              contatosExtraidos.map((c, i) => (
                <tr key={i} className={i % 2 ? "bg-gray-50" : "bg-white"}>
                  <td className="px-3 py-2">{c.nome || "—"}</td>
                  <td className="px-3 py-2">{c.email || "—"}</td>
                  <td className="px-3 py-2">{formatarTelefone(c.telefoneFixo ?? "", "FIXO") || "—"}</td>
                  <td className="px-3 py-2">{formatarTelefone(c.telefoneWpp ?? "", "WPP") || "—"}</td>
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
            contatosEmpresa={contatosEmpresa}
            onSave={salvar}
            onCancel={cancelar}
          />
        )}
      </ModalBase>
    </div>
  );
}