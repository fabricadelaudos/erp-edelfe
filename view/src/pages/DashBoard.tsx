import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from "recharts";
import TabelaBase from "../components/Tabelas/TabelaBase";
import type { Faturamento } from "../types/EstruturaFaturamento";
import type { ContaPagar } from "../types/EstruturaDespesa";
import { Input, ToggleInput } from "../components/Inputs";

import {
  getDespesasCategoria,
  getDespesasRecentes,
  getFaturamentosRecentes,
  getKpis,
  getReceitaVsDespesa
} from "../services/apiDashBoard";

export default function DashboardPage() {
  const [periodo, setPeriodo] = useState<"mensal" | "anual">("mensal");
  const [competencia, setCompetencia] = useState("09/2025");
  const [ano, setAno] = useState<number>(2025);

  const [kpis, setKpis] = useState<any>({});
  const [receitaVsDespesa, setReceitaVsDespesa] = useState<any[]>([]);
  const [despesasCategoria, setDespesasCategoria] = useState<any[]>([]);
  const [faturamentos, setFaturamentos] = useState<Faturamento[]>([]);
  const [despesas, setDespesas] = useState<ContaPagar[]>([]);

  // novos estados
  const [evolucaoFaturamento, setEvolucaoFaturamento] = useState<any[]>([]);
  const [projecoes, setProjecoes] = useState<any[]>([]);
  const [contratosProximos, setContratosProximos] = useState<any[]>([]);

  useEffect(() => {
    carregarDados();
  }, [periodo, competencia, ano]);

  const carregarDados = async () => {
    const filtros = periodo === "mensal"
      ? { periodo, competencia }
      : { periodo, ano };

    const k = await getKpis(filtros);
    const rvd = await getReceitaVsDespesa(filtros);
    const dc = await getDespesasCategoria(filtros);
    const fr = await getFaturamentosRecentes();
    const dr = await getDespesasRecentes();

    setKpis(k);
    setReceitaVsDespesa(Array.isArray(rvd) ? rvd : [rvd]);
    setDespesasCategoria(dc);
    setFaturamentos(fr);
    setDespesas(dr);

    // mock até ter endpoint
    setEvolucaoFaturamento([
      { mes: "01/2025", valor: 12000 },
      { mes: "02/2025", valor: 13500 },
      { mes: "03/2025", valor: 11000 },
      { mes: "04/2025", valor: 16000 },
      { mes: "05/2025", valor: 18000 },
    ]);
    setProjecoes([
      { competencia: "2025", previsto: 200000, realizado: 95000, status: "PARCIAL" },
    ]);
    setContratosProximos([
      { contrato: "Contrato X", vencimento: "15/09/2025", valor: 5000 },
      { contrato: "Contrato Y", vencimento: "20/09/2025", valor: 8000 },
    ]);
  };

  return (
    <div className="h-screen w-full">

      {/* 🔹 Filtro Global */}
      <div className="flex w-full justify-between items-center gap-2 bg-white h-16 px-4">
        <div>
          <h2 className="text-xl font-bold">Painel Financeiro</h2>
        </div>
        <div className="flex items-end gap-2">
          {/* Filtro */}
          <div className={`${periodo === "mensal" ? "w-44" : "w-20"}`}>
            {periodo === "mensal" ? (
              <Input
                name="competencia"
                type="month"
                value={competencia ? `${competencia.split("/")[1]}-${competencia.split("/")[0]}` : ""}
                onChange={(e) => {
                  const [ano, mes] = e.target.value.split("-");
                  setCompetencia(`${mes}/${ano}`);
                }}
                required={false}
                className="h-10"
              />
            ) : (
              <Input
                name="ano"
                type="number"
                value={ano}
                min={2000}
                onChange={(e) => setAno(Number(e.target.value))}
                required={false}
                className="h-10"
              />
            )}
          </div>

          {/* Toogle */}
          <div className="flex rounded-md bg-gray-100">
            <button
              onClick={() => setPeriodo("mensal")}
              className={`px-4 h-10 rounded-l-md font-medium transition ${periodo === "mensal"
                ? "bg-orange-400 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              Mensal
            </button>

            <button
              onClick={() => setPeriodo("anual")}
              className={`px-4 h-10 font-medium rounded-r-md transition ${periodo === "anual"
                ? "bg-orange-400 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
            >
              Anual
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-6 space-y-4">
        {/* 🔹 KPIs */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-green-100 p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Receita Paga</p>
            <p className="text-2xl font-bold text-green-700">R$ {kpis.receitaPaga ?? 0}</p>
          </div>
          <div className="bg-red-100 p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Despesa Paga</p>
            <p className="text-2xl font-bold text-red-700">R$ {kpis.despesaPaga ?? 0}</p>
          </div>
          <div className="bg-blue-100 p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Resultado Líquido</p>
            <p className="text-2xl font-bold text-blue-700">R$ {kpis.resultadoLiquido ?? 0}</p>
          </div>
          <div className="bg-yellow-100 p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">% Receita Recebida</p>
            <p className="text-2xl font-bold text-yellow-700">
              {kpis.receitaPaga && kpis.despesaPaga
                ? ((kpis.receitaPaga / (kpis.receitaPaga + kpis.despesaPaga)) * 100).toFixed(1) + "%"
                : "0%"}
            </p>
          </div>
        </div>

        {/* 🔹 Gráficos */}
        <div className="grid grid-cols-2 gap-6">
          {/* Receita vs Despesa */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Receita vs Despesa</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={receitaVsDespesa}>
                <XAxis dataKey="competencia" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="receita" fill="#22c55e" />
                <Bar dataKey="despesa" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Despesas por Categoria */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Despesas por Categoria</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={despesasCategoria}
                  dataKey="valor"
                  nameKey="categoria"
                  outerRadius={100}
                  label
                >
                  {despesasCategoria.map((_, i) => (
                    <Cell key={i} fill={["#3b82f6", "#22c55e", "#ef4444", "#f59e0b"][i % 4]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 🔹 Evolução Faturamento */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Evolução do Faturamento (Anual)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={evolucaoFaturamento}>
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="valor" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 🔹 Tabelas */}
        <div className="grid grid-cols-2 gap-6">
          <TabelaBase
            data={projecoes}
            columns={[
              { header: "Competência", accessor: "competencia" },
              { header: "Previsto", accessor: "previsto" },
              { header: "Realizado", accessor: "realizado" },
              { header: "Status", accessor: "status" },
            ]}
          />

          <TabelaBase
            data={contratosProximos}
            columns={[
              { header: "Contrato", accessor: "contrato" },
              { header: "Vencimento", accessor: "vencimento" },
              { header: "Valor", accessor: "valor" },
            ]}
          />
        </div>
      </div>
    </div>
  );
}