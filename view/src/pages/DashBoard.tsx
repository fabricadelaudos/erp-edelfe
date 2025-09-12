import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from "recharts";
import TabelaBase from "../components/Tabelas/TabelaBase";
import { Input } from "../components/Inputs";

import {
  getContratosProximos,
  getDespesasCategoria,
  getEvolucaoFaturamento,
  getKpis,
  getProjecoes,
  getReceitaVsDespesa
} from "../services/apiDashBoard";
import { BanknoteArrowDown, BanknoteArrowUp, BarChart2, PieChartIcon } from "lucide-react";
import DashboardTabs from "../components/Tabs/DashBoardTabs";

export default function DashboardPage() {
  const [periodo, setPeriodo] = useState<"mensal" | "anual">("mensal");
  const [competencia, setCompetencia] = useState("09/2025");
  const [ano, setAno] = useState<number>(2025);

  const [kpis, setKpis] = useState<any>({});
  const [receitaVsDespesa, setReceitaVsDespesa] = useState<any[]>([]);
  const [despesasCategoria, setDespesasCategoria] = useState<any[]>([]);

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
    const ef = await getEvolucaoFaturamento(filtros);
    const pj = await getProjecoes(filtros);
    const ct = await getContratosProximos();

    console.log(pj)
    console.log(ct)

    setKpis(k);
    setReceitaVsDespesa(Array.isArray(rvd) ? rvd : [rvd]);
    setDespesasCategoria(dc);
    setContratosProximos(ct);
    setEvolucaoFaturamento(ef);
    setProjecoes(pj);
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
      <div className="p-6 space-y-4 text-xs">
        {/* 🔹 KPIs */}
        <div className="grid grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-white">
            <div className="flex justify-between items-center">
              <p className="text-xs font-medium text-gray-500 uppercase">Receita</p>
              <BanknoteArrowUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600 text-right">
              R$ {kpis.faturamento ?? 0}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-white">
            <div className="flex justify-between items-center">
              <p className="text-xs font-medium text-gray-500 uppercase">Despesa</p>
              <BanknoteArrowDown className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-red-600 text-right">
              R$ {kpis.contasPagar ?? 0}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-white">
            <div className="flex justify-between items-center">
              <p className="text-xs font-medium text-gray-500 uppercase">Imposto</p>
              <BarChart2 className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-600 text-right">
              R$ {kpis.imposto ?? 0}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-white">
            <div className="flex justify-between items-center">
              <p className="text-xs font-medium text-gray-500 uppercase">Lucro Líquido</p>
              <PieChartIcon className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-yellow-600 text-right">
              R$ {kpis.lucro ?? 0}
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
                <XAxis
                  dataKey="competencia"
                  tickFormatter={(value: string) => {
                    const [mes, ano] = value.split("/");
                    const meses = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
                    return `${meses[parseInt(mes, 10) - 1]}/${ano.slice(-2)}`;
                  }}
                />
                <YAxis
                  tickFormatter={(value) =>
                    value.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                      maximumFractionDigits: 0,
                    })
                  }
                />
                <Tooltip
                  formatter={(value, name) => [
                    `R$ ${Number(value).toLocaleString("pt-BR")}`,
                    name === "receita" ? "Receita" : "Despesa",
                  ]}
                  cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
                />
                <Legend
                  content={({ payload }) => (
                    <div className="flex gap-2 justify-center">
                      {payload?.slice().reverse().map((entry) => (
                        <span key={entry.value} className="flex items-center gap-1">
                          <span style={{ backgroundColor: entry.color }} className="w-3 h-3 rounded-full" />
                          {entry.value === "receita" ? "Receita" : "Despesa"}
                        </span>
                      ))}
                    </div>
                  )}
                />
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
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  label={({ name, value }) =>
                    `${name}: R$ ${Number(value).toLocaleString("pt-BR")}`
                  }
                >
                  {despesasCategoria.map((_, i) => (
                    <Cell key={i} fill={["#3b82f6", "#22c55e", "#ef4444", "#f59e0b", "#a855f7", "#10b981"][i % 6]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) =>
                    `R$ ${Number(value).toLocaleString("pt-BR")}`
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 🔹 Evolução Faturamento */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Evolução do Faturamento (Anual)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={evolucaoFaturamento}>
              <XAxis
                dataKey="mes"
                tickFormatter={(value: string) => {
                  const [mes, ano] = value.split("/");
                  const meses = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
                  return `${meses[parseInt(mes, 10) - 1]}/${ano.slice(-2)}`;
                }}
              />
              <YAxis
                tickFormatter={(value) =>
                  value.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                    maximumFractionDigits: 0,
                  })
                }
              />
              <Tooltip
                formatter={(value: number) =>
                  value.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })
                }
                labelFormatter={(label) => `Mês: ${label}`}
              />
              <Legend />
              <Line type="monotone" dataKey="valor" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>

        </div>

        {/* 🔹 Tabelas */}
        <DashboardTabs projecoes={projecoes} contratosProximos={contratosProximos} />
      </div>
    </div>
  );
}