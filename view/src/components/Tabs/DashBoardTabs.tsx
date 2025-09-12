import { useState } from "react";
import TabelaBase from "../Tabelas/TabelaBase";
import type { ContratoProximo, Projecao } from "../../types/EstruturaDashBoard";
import TabelaProjecaoAnual from "../Tabelas/TabelaProjeção";

interface DashboardTabsProps {
  projecoes: Projecao[];
  contratosProximos: ContratoProximo[];
}

export default function DashboardTabs({ projecoes, contratosProximos }: DashboardTabsProps) {
  const [abaAtiva, setAbaAtiva] = useState<"projecoes" | "contratos">("projecoes");

  return (
    <div className="bg-white rounded-lg shadow p-4">
      {/* Abas */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          onClick={() => setAbaAtiva("projecoes")}
          className={`px-4 py-2 font-medium text-sm rounded-t-md transition ${abaAtiva === "projecoes"
              ? "bg-orange-400 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
        >
          📊 Projeções
        </button>
        <button
          onClick={() => setAbaAtiva("contratos")}
          className={`px-4 py-2 font-medium text-sm rounded-t-md transition ${abaAtiva === "contratos"
              ? "bg-orange-400 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
        >
          📑 Contratos Próximos
        </button>
      </div>

      {/* Conteúdo */}
      {abaAtiva === "projecoes" && (
        <TabelaProjecaoAnual dados={projecoes as any} />
      )}

      {abaAtiva === "contratos" && (
        <TabelaBase
          data={contratosProximos}
          columns={[
            { header: "Contrato", accessor: "contrato" },
            { header: "Vencimento", accessor: "vencimento" },
            { header: "Valor", accessor: "valor" },
          ]}
          itemsPerPage={5}
        />
      )}
    </div>
  );
}