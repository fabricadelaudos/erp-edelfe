import { useEffect, useState } from "react";
import ModalBase from "../Modais/ModalBase";
import FormBanco from "../Formularios/FormBanco";
import { Plus } from "lucide-react";
import TabelaBase from "../Tabelas/TabelaBase";
import type { Banco } from "../../types/EstruturaDespesa";
import { buscarBancos, criarBanco, editarBanco } from "../../services/apiDespesa";

export default function BancoTab() {
  const [bancos, setBancos] = useState<Banco[]>([]);
  const [form, setForm] = useState<Banco>({ idBanco: 0, nome: "", ativo: true });
  const [modalAberto, setModalAberto] = useState(false);

  const carregarBancos = async () => {
    try {
      const dados = await buscarBancos();
      setBancos(dados);
    } catch (error) {
      console.error("Erro ao carregar bancos", error);
    }
  };

  useEffect(() => {
    carregarBancos();
  }, []);

  const handleSalvar = async () => {
    try {
      if (form.idBanco > 0) {
        console.log("Editando banco:", form);
        await editarBanco(form.idBanco, form);
      } else {
        console.log("Criando banco:", form);
        await criarBanco(form);
      }

      setModalAberto(false);
      carregarBancos();
    } catch (error) {
      console.error("Erro ao salvar banco", error);
    }
  };


  const handleEditar = (banco: Banco) => {
    setForm(banco);
    setModalAberto(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Bancos Cadastrados</h2>
        <button
          onClick={() => {
            setForm({ idBanco: 0, nome: "", ativo: true });
            setModalAberto(true);
          }}
          className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
        >
          <Plus size={16} /> Adicionar
        </button>
      </div>

      <TabelaBase
        data={bancos}
        columns={[
          { header: "Nome", accessor: "nome" },
          {
            header: "Status",
            accessor: "ativo",
            render: (v) => (
              <span className={`font-medium ${v ? "text-green-600" : "text-red-500"}`}>
                {v ? "Ativo" : "Inativo"}
              </span>
            ),
          },
        ]}
        onEdit={handleEditar}
      />

      <ModalBase titulo="Banco" isOpen={modalAberto} onClose={() => {setModalAberto(false); setForm({ idBanco: 0, nome: "", ativo: true });}}>
        <FormBanco form={form} setForm={setForm} onSalvar={handleSalvar} />
      </ModalBase>
    </div>
  );
}