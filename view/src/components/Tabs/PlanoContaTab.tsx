import { useEffect, useState } from "react";
import { Plus, Pencil } from "lucide-react";
import ToolTip from "../Auxiliares/ToolTip";
import ModalBase from "../Modais/ModalBase";
import FormPlanoConta from "../Formularios/FormPlanoConta";
import type { PlanoContaCategoria } from "../../types/EstruturaDespesa";
import { buscarPlanoContas, salvarPlanoConta } from "../../services/apiDespesa";
import Spinner from "../Loading";

// Tipo estendido com estado interno (não vem da API)
type CategoriaComEstado = PlanoContaCategoria & { expanded?: boolean };

export default function PlanoContasTab() {
  const [planos, setPlanos] = useState<CategoriaComEstado[]>([]);
  const [planoEdicao, setPlanoEdicao] = useState<PlanoContaCategoria | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const carregarPlanos = async () => {
      try {
        setLoading(true);
        const res = await buscarPlanoContas();
        setPlanos(res.map((p) => ({ ...p, expanded: false })));
      } catch (err) {
        console.error("Erro ao carregar plano de contas:", err);
      } finally {
        setLoading(false);
      }
    };

    carregarPlanos();
  }, []);

  const abrirModal = (plano?: PlanoContaCategoria) => {
    setPlanoEdicao(
      plano ?? {
        idPlanoContaCategoria: 0,
        nome: "",
        ativo: true,
        planocontasubcategoria: [],
      }
    );
    setModalAberto(true);
  };

  const salvar = async (dados: PlanoContaCategoria) => {
    try {
      setLoading(true);
      const salvo = await salvarPlanoConta({
        idPlanoContaCategoria: dados.idPlanoContaCategoria,
        nome: dados.nome,
        ativo: dados.ativo,
        planocontasubcategoria: dados.planocontasubcategoria.map((s) => ({
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
    } catch (error) {
      console.error("Erro ao salvar plano de contas:", error);
    } finally {
      setLoading(false);
    }
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
          onClick={() => abrirModal()}
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
      {loading ? (
        <div className="flex justify-center py-6">
          <Spinner size={24} />
          <span className="ml-2">Carregando...</span>
        </div>
      ) : (planos.map((categoria) => (
        <div
          key={categoria.idPlanoContaCategoria}
          className="border border-gray-300 rounded mb-2 text-sm bg-white shadow-sm"
        >
          {/* Cabeçalho da categoria */}
          <div
            onClick={() => toggleExpand(categoria.idPlanoContaCategoria)}
            role="button"
            className={`w-full flex items-center justify-between px-4 py-3 cursor-pointer rounded`}
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
                {categoria.planocontasubcategoria?.length ?? 0} subcategorias
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
          {categoria.expanded && categoria.planocontasubcategoria && categoria.planocontasubcategoria?.length > 0 && (
            <>
              <div className="px-4 pb-4 pt-2 text-gray-700 rounded">
                <p className="font-medium text-sm">Lista de Subcategorias:</p>
                <ul className="px-6 pt-1 text-xs text-gray-700 space-y-1">
                  {categoria.planocontasubcategoria.map((sub) => (
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
      )))}

      {/* Modal de cadastro/edição */}
      <ModalBase
        isOpen={modalAberto}
        onClose={() => {
          setModalAberto(false); setPlanoEdicao({
            idPlanoContaCategoria: 0,
            nome: "",
            ativo: true,
            planocontasubcategoria: [],
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
                planocontasubcategoria: [],
              });
            }}
            loading={loading}
          />
        )}
      </ModalBase>
    </div>
  );
}