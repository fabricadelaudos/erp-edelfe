import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import type { Empresa } from "../types/EstruturaEmpresa";
import { getEmpresas } from "../services/apiEmpresa";
import SearchInput from "../components/Auxiliares/SearchInput";
import TabelaBase from "../components/Tabelas/TabelaBase";
import ModalBase from "../components/Modais/ModalBase";
import FormEmpresa from "../components/Formularios/FormEmpresa";

export default function EmpresaPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [busca, setBusca] = useState("");
  const [modalAberto, setModalAberto] = useState(false);

  useEffect(() => {
    const carregar = async () => {
      const data = await getEmpresas();
      setEmpresas(data);
    };
    carregar();
  }, [busca]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Empresas</h2>
        <button
          onClick={() => setModalAberto(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          <Plus size={18} />
          Adicionar Empresa
        </button>
      </div>

      <SearchInput onBusca={setBusca} />

      <TabelaBase
        data={empresas}
        columns={[
          { header: "Nome da Empresa", accessor: "nome", sortable: true },
          {
            header: "Status",
            accessor: "ativo",
            render: (valor) => (valor ? "Ativo" : "Inativo"),
            sortable: true,
          },
        ]}
      />

      <ModalBase
        titulo="Nova Empresa"
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
      >
        <FormEmpresa aoSalvar={() => {
          setModalAberto(false);
          setBusca("");
        }} />
      </ModalBase>
    </div>
  );
}
