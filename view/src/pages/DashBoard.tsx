import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from "recharts";
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
import Spinner from "../components/Loading";

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

  // Legedas
  const [hiddenKeys, setHiddenKeys] = useState<string[]>([
    "faturamentoPorVida",
    "faturamentoMensal",
    "faturamentoRecorrente",
    "imposto",
  ]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, [periodo, competencia, ano]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const filtros = periodo === "mensal"
        ? { periodo, competencia }
        : { periodo, ano };

      const k = await getKpis(filtros);
      const rvd = await getReceitaVsDespesa(filtros);
      const dc = await getDespesasCategoria(filtros);
      const ef = await getEvolucaoFaturamento(filtros);
      const pj = await getProjecoes(filtros);
      const ct = await getContratosProximos();

      setKpis(k);
      setReceitaVsDespesa(Array.isArray(rvd) ? rvd : [rvd]);
      setDespesasCategoria(dc);
      setContratosProximos(ct);
      setEvolucaoFaturamento(ef);
      setProjecoes(pj);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLegendClick = (o: any) => {
    const { dataKey } = o;
    if (hiddenKeys.includes(dataKey)) {
      setHiddenKeys(hiddenKeys.filter((k) => k !== dataKey));
    } else {
      setHiddenKeys([...hiddenKeys, dataKey]);
    }
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
          {/* Receita */}
          <div className="p-4 rounded-lg bg-white">
            <div className="flex justify-between items-center">
              <p className="text-xs font-medium text-gray-500 uppercase">Receita</p>
              <BanknoteArrowUp className="w-5 h-5 text-green-600" />
            </div>
            {loading ? (
              <div className="flex justify-end py-2">
                <Spinner size={24} className="text-green-600" />
              </div>
            ) : (
              <p className="text-2xl font-bold text-green-600 text-right">
                R$ {kpis.faturamento?.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) ?? "0,00"}
              </p>
            )}
          </div>

          {/* Despesa */}
          <div className="p-4 rounded-lg bg-white">
            <div className="flex justify-between items-center">
              <p className="text-xs font-medium text-gray-500 uppercase">Despesa</p>
              <BanknoteArrowDown className="w-5 h-5 text-red-600" />
            </div>
            {loading ? (
              <div className="flex justify-end py-2">
                <Spinner size={24} className="text-red-600" />
              </div>
            ) : (
              <p className="text-2xl font-bold text-red-600 text-right">
                R$ {kpis.contasPagar?.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) ?? "0,00"}
              </p>
            )}
          </div>

          {/* Imposto */}
          <div className="p-4 rounded-lg bg-white">
            <div className="flex justify-between items-center">
              <p className="text-xs font-medium text-gray-500 uppercase">Imposto</p>
              <BarChart2 className="w-5 h-5 text-blue-600" />
            </div>
            {loading ? (
              <div className="flex justify-end py-2">
                <Spinner size={24} className="text-blue-600" />
              </div>
            ) : (
              <p className="text-2xl font-bold text-blue-600 text-right">
                R$ {kpis.imposto?.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) ?? "0,00"}
              </p>
            )}
          </div>

          {/* Lucro Líquido */}
          <div className="p-4 rounded-lg bg-white">
            <div className="flex justify-between items-center">
              <p className="text-xs font-medium text-gray-500 uppercase">Lucro Líquido</p>
              <PieChartIcon className="w-5 h-5 text-yellow-600" />
            </div>
            {loading ? (
              <div className="flex justify-end py-2">
                <Spinner size={24} className="text-yellow-600" />
              </div>
            ) : (
              <p className="text-2xl font-bold text-yellow-600 text-right">
                R$ {kpis.lucro?.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) ?? "0,00"}
              </p>
            )}
          </div>
        </div>

        {/* 🔹 Gráficos */}
        <div className="grid grid-cols-2 gap-6">
          {/* Receita vs Despesa */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Receita vs Despesa</h3>

            {loading ? (
              <div className="flex items-center justify-center h-[250px]">
                <Spinner size={20} className="text-orange-500" />
                <p className="ml-2 text-orange-300 font-bold">Carregando...</p>
              </div>
            ) : receitaVsDespesa.length === 0 ? (
              <div className="flex items-center justify-center h-[250px] text-gray-500">
                Nenhum dado disponível
              </div>
            ) : (
              // 🔹 Gráfico com dados
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={receitaVsDespesa}>
                  <XAxis
                    dataKey="competencia"
                    tickFormatter={(value: string) => {
                      const [mes, ano] = value.split("/");
                      const meses = [
                        "jan", "fev", "mar", "abr", "mai", "jun",
                        "jul", "ago", "set", "out", "nov", "dez"
                      ];
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
                            <span
                              style={{ backgroundColor: entry.color }}
                              className="w-3 h-3 rounded-full"
                            />
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
            )}
          </div>

          {/* Despesas por Categoria */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Despesas por Categoria</h3>

            {loading ? (
              <div className="flex items-center justify-center h-[250px]">
                <Spinner size={20} className="text-orange-500" />
                <p className="ml-2 text-orange-300 font-bold">Carregando...</p>
              </div>
            ) : despesasCategoria.length === 0 ? (
              <div className="flex items-center justify-center h-[250px] text-gray-500">
                Nenhum dado disponível
              </div>
            ) : (
              // 🔹 Gráfico com dados
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
                      <Cell
                        key={i}
                        fill={
                          [
                            "#3b82f6", // azul
                            "#22c55e", // verde
                            "#ef4444", // vermelho
                            "#f59e0b", // laranja
                            "#a855f7", // roxo
                            "#10b981", // teal
                          ][i % 6]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) =>
                      `R$ ${Number(value).toLocaleString("pt-BR")}`
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* 🔹 Evolução Faturamento */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Evolução do Faturamento (Anual)</h3>

          {loading ? (
            <div className="flex items-center justify-center h-[300px]">
              <Spinner size={20} className="text-orange-500" />
              <p className="ml-2 text-orange-300 font-bold">Carregando...</p>
            </div>
          ) : evolucaoFaturamento.length === 0 ? (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              Nenhum dado disponível
            </div>
          ) : (
            // 🔹 Gráfico com dados
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={evolucaoFaturamento}>
                <XAxis
                  dataKey="mes"
                  tickFormatter={(value: number) => {
                    const meses = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
                    return meses[value - 1];
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
                  content={({ active, payload, label }) => {
                    if (!active || !payload || label == null) return null;

                    const meses = [
                      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
                      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
                    ];

                    const mesIndex = Number(label) - 1;
                    const nomeMes = meses[mesIndex] ?? "";

                    const ordem = ["despesas", "imposto", "faturamentoTotal", "faturamentoPorVida", "faturamentoMensal", "faturamentoRecorrente"];

                    const cores: Record<string, string> = {
                      despesas: "#ef4444",
                      imposto: "#ef4444",
                      faturamentoTotal: "#3b82f6",
                      faturamentoPorVida: "#22c55e",
                      faturamentoMensal: "#8b5cf6",
                      faturamentoRecorrente: "#f59e0b",
                    };

                    const nomes: Record<string, string> = {
                      despesas: "Despesas",
                      imposto: "Imposto",
                      faturamentoTotal: "Faturamento",
                      faturamentoPorVida: "Por Vida",
                      faturamentoMensal: "Mensal",
                      faturamentoRecorrente: "Recorrente",
                    };

                    return (
                      <div className="bg-white p-2 rounded border border-gray-300 text-sm">
                        <p className="font-medium text-gray-600 mb-1">Mês: {nomeMes}</p>
                        {ordem.map((key) => {
                          const item = payload.find((p) => p.dataKey === key);
                          if (!item) return null;
                          const valor = key === "despesas" || key === "imposto" ? -Number(item.value) : Number(item.value);

                          return (
                            <div key={key} className="flex gap-1">
                              <span className="text-gray-600">{nomes[key]}:</span>
                              <span style={{ color: cores[key] }} className="font-medium">
                                {valor.toLocaleString("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                })}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  }}
                />
                <Legend
                  content={() => (
                    <div className="flex gap-4 text-sm select-none cursor-pointer pl-4 pb-2 justify-center">
                      <span
                        style={{ color: "#ef4444", opacity: hiddenKeys.includes("despesas") ? 0.5 : 1 }}
                        onClick={() => handleLegendClick({ dataKey: "despesas" })}
                      >
                        ● Despesas
                      </span>
                      <span
                        style={{ color: "#ef4444", opacity: hiddenKeys.includes("imposto") ? 0.5 : 1 }}
                        onClick={() => handleLegendClick({ dataKey: "imposto" })}
                      >
                        ● Imposto
                      </span>
                      <span
                        style={{ color: "#3b82f6", opacity: hiddenKeys.includes("faturamentoTotal") ? 0.5 : 1 }}
                        onClick={() => handleLegendClick({ dataKey: "faturamentoTotal" })}
                      >
                        ● Faturamento
                      </span>
                      <span
                        style={{ color: "#22c55e", opacity: hiddenKeys.includes("faturamentoPorVida") ? 0.5 : 1 }}
                        onClick={() => handleLegendClick({ dataKey: "faturamentoPorVida" })}
                      >
                        ● Por Vida
                      </span>
                      <span
                        style={{ color: "#8b5cf6", opacity: hiddenKeys.includes("faturamentoMensal") ? 0.5 : 1 }}
                        onClick={() => handleLegendClick({ dataKey: "faturamentoMensal" })}
                      >
                        ● Mensal
                      </span>
                      <span
                        style={{ color: "#f59e0b", opacity: hiddenKeys.includes("faturamentoRecorrente") ? 0.5 : 1 }}
                        onClick={() => handleLegendClick({ dataKey: "faturamentoRecorrente" })}
                      >
                        ● Recorrente
                      </span>
                    </div>
                  )}
                />

                {/* Linhas para cada dataset */}
                <Line type="monotone" dataKey="faturamentoRecorrente" name="Recorrente" stroke="#f59e0b" strokeWidth={2} hide={hiddenKeys.includes("faturamentoRecorrente")} />
                <Line type="monotone" dataKey="faturamentoMensal" name="Mensal" stroke="#8b5cf6" strokeWidth={2} hide={hiddenKeys.includes("faturamentoMensal")} />
                <Line type="monotone" dataKey="faturamentoPorVida" name="Por Vida" stroke="#22c55e" strokeWidth={2} hide={hiddenKeys.includes("faturamentoPorVida")} />
                <Line type="monotone" dataKey="faturamentoTotal" name="Total" stroke="#3b82f6" strokeWidth={2} hide={hiddenKeys.includes("faturamentoTotal")} />
                <Line type="monotone" dataKey="despesas" name="Despesas" stroke="#ef4444" strokeWidth={2} hide={hiddenKeys.includes("despesas")} />
                <Line type="monotone" dataKey="imposto" name="Imposto" stroke="#ef4444" strokeWidth={2} strokeDasharray="4 2" hide={hiddenKeys.includes("imposto")} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* 🔹 Tabelas */}
        <DashboardTabs projecoes={projecoes} contratosProximos={contratosProximos} loading={loading} />
      </div>
    </div>
  );
}