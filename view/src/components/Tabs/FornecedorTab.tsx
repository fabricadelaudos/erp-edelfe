import { useEffect, useState } from "react";
import { Plus, Pencil } from "lucide-react";
import TabelaBase from "../Tabelas/TabelaBase";
import ToolTip from "../Auxiliares/ToolTip";
import ModalBase from "../Modais/ModalBase";
import {
  buscarFornecedores,
  criarFornecedor,
  editarFornecedor,
} from "../../services/apiDespesa";
import { formatarDocumento } from "../Auxiliares/formatter";
import type { Fornecedor } from "../../types/EstruturaDespesa";
import FormFornecedor from "../Formularios/FormFornecedor";

export default function FornecedorTab() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [fornecedorEdicao, setFornecedorEdicao] = useState<Fornecedor | null>(null);
  const [modalAberto, setModalAberto] = useState(false);

  useEffect(() => {
    buscarFornecedores().then(setFornecedores).catch(() => {
      setFornecedores([]);
      console.error("Erro ao buscar fornecedores");
    });
  }, []);

  const abrirModal = (fornecedor?: Fornecedor) => {
    setFornecedorEdicao(
      fornecedor ?? {
        idFornecedor: 0,
        nome: "",
        tipoPessoa: "FORNECEDOR",
        tipoDocumento: "CNPJ",
        documento: "",
        observacao: "",
        ativo: true,
      }
    );
    setModalAberto(true);
  };

  const salvarFornecedor = async (dados: Fornecedor) => {
    try {
      let salvo: Fornecedor;

      if (dados.idFornecedor > 0) {
        salvo = await editarFornecedor(dados.idFornecedor, dados);
        setFornecedores((prev) =>
          prev.map((f) => (f.idFornecedor === salvo.idFornecedor ? salvo : f))
        );
      } else {
        salvo = await criarFornecedor(dados);
        setFornecedores((prev) => [...prev, salvo]);
      }

      setModalAberto(false);
    } catch (error) {
      console.error("Erro ao salvar fornecedor:", error);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Fornecedores</h2>
        <button
          onClick={() => abrirModal()}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
        >
          <Plus size={16} /> Adicionar
        </button>
      </div>

      <TabelaBase
        columns={[
          { header: "Nome", accessor: "nome" },
          {
            header: "Tipo de Pessoa",
            accessor: "tipoPessoa",
            render: (v: string) => {
              switch (v) {
                case "CLIENTE": return "Cliente";
                case "FORNECEDOR": return "Fornecedor";
                case "CLIENTE_FORNECEDOR": return "Cliente e Fornecedor";
                default: return v;
              }
            },
          },
          {
            header: "Documento",
            accessor: "documento",
            render: (_: any, row: Fornecedor) =>
              formatarDocumento(row.documento, row.tipoDocumento),
          },
          {
            header: "Status",
            accessor: "ativo",
            render: (v: boolean) => (
              <span className={v ? "text-green-600" : "text-red-600"}>
                {v ? "Ativo" : "Inativo"}
              </span>
            ),
          },
          {
            header: "Ações",
            accessor: "idFornecedor",
            render: (_: any, row: Fornecedor) => (
              <ToolTip text="Editar">
                <button
                  onClick={() => abrirModal(row)}
                  className="p-1 text-blue-600 hover:text-blue-800"
                >
                  <Pencil size={18} />
                </button>
              </ToolTip>
            ),
          },
        ]}
        data={fornecedores}
      />

      <ModalBase
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        titulo={
          fornecedorEdicao?.idFornecedor
            ? "Editar Fornecedor"
            : "Novo Fornecedor"
        }
      >
        {fornecedorEdicao && (
          <FormFornecedor
            dados={fornecedorEdicao}
            onSalvar={salvarFornecedor}
            onCancelar={() => setModalAberto(false)}
          />
        )}
      </ModalBase>
    </div>
  );
}