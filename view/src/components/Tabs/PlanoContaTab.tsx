import { useEffect, useState } from "react";
import { Plus, Pencil } from "lucide-react";
import ToolTip from "../Auxiliares/ToolTip";
import ModalBase from "../Modais/ModalBase";
import FormPlanoConta from "../Formularios/FormPlanoConta";
import type { PlanoContaCategoria } from "../../types/EstruturaDespesa";
import { buscarPlanoContas, salvarPlanoConta } from "../../services/apiDespesa";

// Tipo estendido com estado interno (não vem da API)
type CategoriaComEstado = PlanoContaCategoria & { expanded?: boolean };

export default function PlanoContasTab() {
  const [planos, setPlanos] = useState<CategoriaComEstado[]>([]);
  const [planoEdicao, setPlanoEdicao] = useState<PlanoContaCategoria | null>(null);
  const [modalAberto, setModalAberto] = useState(false);

  useEffect(() => {
    buscarPlanoContas().then((res) =>
      setPlanos(res.map((p) => ({ ...p, expanded: false })))
    );
  }, []);

  const abrirModal = (plano?: PlanoContaCategoria) => {
    setPlanoEdicao(
      plano ?? {
        idPlanoContaCategoria: 0,
        nome: "",
        ativo: true,
        subcategorias: [],
      }
    );
    setModalAberto(true);
  };

  const salvar = async (dados: PlanoContaCategoria) => {
    const salvo = await salvarPlanoConta({
      idPlanoContaCategoria: dados.idPlanoContaCategoria,
      nome: dados.nome,
      ativo: dados.ativo,
      subcategorias: dados.subcategorias.map((s) => ({
        idPlanoContaSubCategoria: s.idPlanoContaSubCategoria,
        nome: s.nome,
        ativo: s.ativo,
      })),
    });

    setPlanos((prev) => {
      const existe = prev.find(
        (p) => p.idPlanoContaCategoria === salvo.idPlanoContaCategoria
      );
      if (existe) {
        return prev.map((p) =>
          p.idPlanoContaCategoria === salvo.idPlanoContaCategoria
            ? { ...salvo, expanded: p.expanded ?? false }
            : p
        );
      }
      return [...prev, { ...salvo, expanded: true }];
    });

    setModalAberto(false);
  };

  const toggleExpand = (id: number) => {
    setPlanos((prev) =>
      prev.map((p) =>
        p.idPlanoContaCategoria === id ? { ...p, expanded: !p.expanded } : p
      )
    );
  };

  return (
    <div className="p-4 space-y-4">
      {/* Botão Adicionar */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Planos de Contas</h2>
        <button
          onClick={() => setModalAberto(true)}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
        >
          <Plus size={16} /> Adicionar
        </button>
      </div>

      {/* Feedback se vazio */}
      {planos.length === 0 && (
        <p className="text-gray-500 text-sm text-center py-6">
          Nenhum Plano de Contas encontrado.
        </p>
      )}

      {/* Lista de categorias */}
      {planos.map((categoria) => (
        <div
          key={categoria.idPlanoContaCategoria}
          className="border border-gray-300 rounded mb-2 bg-white shadow-sm"
        >
          {/* Cabeçalho da categoria */}
          <div
            onClick={() => toggleExpand(categoria.idPlanoContaCategoria)}
            role="button"
            className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer rounded ${categoria.expanded ? "bg-gray-50 border-b border-gray-300" : ""}`}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">
                {categoria.expanded ? "▾" : "▸"}
              </span>
              <span className="font-medium">{categoria.nome}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded ${categoria.ativo
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
                  }`}
              >
                {categoria.ativo ? "Ativo" : "Inativo"}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {categoria.subcategorias.length} subcategorias
              </span>
              <ToolTip text="Editar">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    abrirModal(categoria);
                  }}
                  className="p-1 text-blue-600 hover:text-blue-800"
                >
                  <Pencil size={18} />
                </button>
              </ToolTip>
            </div>
          </div>

          {/* Subcategorias */}
          {categoria.expanded && categoria.subcategorias.length > 0 && (
            <>
              <div className="px-4 pb-4 pt-2 bg-gray-50 text-gray-700 rounded">
                <p className="font-medium text-sm">Lista de Subcategorias:</p>
                <ul className="px-6 pt-1 text-sm text-gray-700 space-y-1">
                  {categoria.subcategorias.map((sub) => (
                    <li
                      key={sub.idPlanoContaSubCategoria}
                      className="list-decimal"
                    >
                      <span>{sub.nome}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      ))}

      {/* Modal de cadastro/edição */}
      <ModalBase
        isOpen={modalAberto}
        onClose={() => {
          setModalAberto(false); setPlanoEdicao({
            idPlanoContaCategoria: 0,
            nome: "",
            ativo: true,
            subcategorias: [],
          });
        }}
        titulo={
          planoEdicao?.idPlanoContaCategoria
            ? "Editar Categoria"
            : "Nova Categoria"
        }
      >
        {planoEdicao && (
          <FormPlanoConta
            dados={planoEdicao}
            onSalvar={salvar}
            onCancelar={() => {
              setModalAberto(false); setPlanoEdicao({
                idPlanoContaCategoria: 0,
                nome: "",
                ativo: true,
                subcategorias: [],
              });
            }}
          />
        )}
      </ModalBase>
    </div>
  );
}