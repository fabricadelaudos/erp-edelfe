import { useState } from "react";
import CompetenciaFinanceiraTab from "../components/Tabs/CompetenciaFinanceiraTab";

export default function EmpresaConfigPage() {
  const [abaSelecionada, setAbaSelecionada] = useState<"competencia" | "outra">("competencia");

  return (
    <div className="p-6 bg-white rounded-md border border-gray-300">
      <div className="flex gap-4 border-b mb-4">
        <button
          className={`px-4 py-2 ${abaSelecionada === "competencia" ? "border-b-2 border-orange-500 font-semibold" : ""}`}
          onClick={() => setAbaSelecionada("competencia")}
        >
          Competência Financeira
        </button>
      </div>

      {abaSelecionada === "competencia" && <CompetenciaFinanceiraTab />}
    </div>
  );
}