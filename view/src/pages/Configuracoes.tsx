import { useState } from "react";

import UsuarioTab from "../components/Tabs/UsuarioTab";
import CompetenciaFinanceiraTab from "../components/Tabs/CompetenciaFinanceiraTab";
import BancoTab from "../components/Tabs/BancoTab";
import PlanoContaTab from "../components/Tabs/PlanoContaTab";
import FornecedorTab from "../components/Tabs/FornecedorTab";

type Aba =
  | "usuario"
  | "competencia"
  | "bancos"
  | "planoConta"
  | "fornecedores";

export default function EmpresaConfigPage() {
  const [abaSelecionada, setAbaSelecionada] = useState<Aba>("usuario");

  const abas = [
    { id: "usuario", label: "Usuários" },
    { id: "competencia", label: "Competência Financeira" },
    { id: "bancos", label: "Bancos" },
    { id: "planoConta", label: "Plano de Contas" },
    { id: "fornecedores", label: "Fornecedores" },
  ];

  return (
    <div className="p-6 bg-white rounded-md border border-gray-300">
      {/* Abas */}
      <div className="flex gap-4 border-b border-green-400 mb-4">
        {abas.map((aba) => (
          <button
            key={aba.id}
            className={`px-4 py-2 transition-colors duration-200 ${abaSelecionada === aba.id
                ? "border-b-2 border-orange-500 font-semibold text-orange-600"
                : "text-green-500 hover:text-orange-500"
              }`}
            onClick={() => setAbaSelecionada(aba.id as Aba)}
          >
            {aba.label}
          </button>
        ))}
      </div>

      {/* Conteúdo da aba selecionada */}
      {abaSelecionada === "usuario" && <UsuarioTab />}
      {abaSelecionada === "competencia" && <CompetenciaFinanceiraTab />}
      {abaSelecionada === "bancos" && <BancoTab />}
      {abaSelecionada === "planoConta" && <PlanoContaTab />}
      {abaSelecionada === "fornecedores" && <FornecedorTab />}
    </div>
  );
}
