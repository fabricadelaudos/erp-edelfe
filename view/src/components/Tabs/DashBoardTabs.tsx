import { useState } from "react";
import TabelaBase from "../Tabelas/TabelaBase";
import type { ContratoProximo, Projecao } from "../../types/EstruturaDashBoard";
import TabelaProjecao from "../Tabelas/TabelaProjeção";

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
        <TabelaProjecao dados={projecoes as any} />
      )}

      {abaAtiva === "contratos" && (
        <TabelaBase
          data={contratosProximos}
          columns={[
            { header: "Empresa", accessor: "empresa" },
            { header: "Unidade", accessor: "unidade" },
            { header: "Contrato", accessor: "contrato" },
            { header: "Vencimento", accessor: "vencimento" },
            {
              header: "Dias Restantes",
              accessor: "diasRestantes",
              render: (dias: number) => (
                <span
                  className={
                    dias <= 15
                      ? "text-red-600 font-semibold"
                      : dias <= 30
                        ? "text-orange-500 font-semibold"
                        : "text-gray-700 font-semibold"
                  }
                >
                  {dias} dias
                </span>
              ),
            },
            {
              header: "Valor",
              accessor: "valor",
              render: (valor: number) =>
                valor != null
                  ? valor.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })
                  : "-",
            },
          ]}
          itemsPerPage={5}
        />
      )}

    </div>
  );
}