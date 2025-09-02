import { useEffect, useState } from "react";
import type { Empresa } from "../types/EstruturaEmpresa";
import { getEmpresas } from "../services/apiEmpresa";

import SearchInput from "../components/Auxiliares/SearchInput";
import ModalBase from "../components/Modais/ModalBase";
import FormEmpresa from "../components/Formularios/FormEmpresa";
import TabelaBase, { type Column } from "../components/Tabelas/TabelaBase";
import { Plus } from "lucide-react";

export default function EmpresaPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [empresaSelecionada, setEmpresaSelecionada] = useState<Empresa | null>(null);
  const [busca, setBusca] = useState("");
  const [modalAberto, setModalAberto] = useState(false);

  const columns: Column<Empresa>[] = [
    { header: "Nome da Empresa", accessor: "nome", sortable: true },
    {
      header: "Status",
      accessor: "ativo",
      render: (valor) => (valor ? "Ativo" : "Inativo"),
      sortable: true,
    },
  ];

  useEffect(() => {
    const carregarEmpresas = async () => {
      const data = await getEmpresas();
      setEmpresas(data);
    };
    carregarEmpresas();
  }, []);

  const handleEditar = (empresa: Empresa) => {
    setEmpresaSelecionada(empresa);
    setModalAberto(true);
  };

  const handleNovaEmpresa = () => {
    setEmpresaSelecionada(null);
    setModalAberto(true);
  };

  const empresasFiltradas = empresas.filter((e) =>
    e.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="p-6 bg-white rounded-md border border-gray-300">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Empresas</h2>
        <button
          onClick={handleNovaEmpresa}
          className="flex items-center gap-2 bg-orange-400 text-white px-4 py-2 rounded hover:bg-orange-500"
        >
          <Plus size={18} />
          Empresa
        </button>
      </div>

      <SearchInput onBusca={setBusca} placeholder="Buscar empresa..." />

      <TabelaBase
        data={empresasFiltradas}
        columns={columns}
        onEdit={handleEditar}
      />

      <ModalBase
        titulo={empresaSelecionada ? "Editar Empresa" : "Nova Empresa"}
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
      >
        <FormEmpresa
          empresaSelecionada={empresaSelecionada ?? undefined}
          aoSalvar={async () => {
            setModalAberto(false);
            const data = await getEmpresas();
            setEmpresas(data);
          }}
        />
      </ModalBase>
    </div>
  );
}