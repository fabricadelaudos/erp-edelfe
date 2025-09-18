import { useEffect, useState } from "react";
import {
  buscarFaturamentoOuProjecao,
  editarFaturamento,
  editarProjecao,
  gerarFaturamentoDeProjecao,
} from "../services/apiFaturamento";
import type {
  FaturamentoOuProjecao,
} from "../types/EstruturaFaturamento";
import TabelaBase, { type Column } from "../components/Tabelas/TabelaBase";
import ModalEditarFaturamento from "../components/Modais/ModalEditarFaturamento";
import { formatarDataInput, formatarDocumento } from "../components/Auxiliares/formatter";
import { Input, SearchableSelect, SelectInput } from "../components/Inputs";
import { ListFilter } from "lucide-react";
import Copiavel from "../components/Auxiliares/Copiavel";

export default function FaturamentoPage() {
  const hoje = new Date();
  const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

  const [faturamentos, setFaturamentos] = useState<FaturamentoOuProjecao[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [faturamentoSelecionado, setFaturamentoSelecionado] =
    useState<FaturamentoOuProjecao | null>(null);

  const [filtrosVisiveis, setFiltrosVisiveis] = useState(false);
  const [filtros, setFiltros] = useState({
    status: "",
    empresa: "",
    unidade: "",
    competenciaInicio: formatarDataInput(primeiroDiaMes),
    competenciaFim: formatarDataInput(ultimoDiaMes),
    pagamentoInicio: "",
    pagamentoFim: "",
    nota: "",
  });
  const [empresas, setEmpresas] = useState<{ label: string; value: string }[]>(
    []
  );
  const [unidades, setUnidades] = useState<{ label: string; value: string }[]>(
    []
  );

  const [selecionados, setSelecionados] = useState<FaturamentoOuProjecao[]>([]);

  const [totalTitulos, setTotalTitulos] = useState(0);
  const [totalValorBase, setTotalValorBase] = useState(0);
  const [totalImposto, setTotalImposto] = useState(0);
  const [totalValor, setTotalValor] = useState(0);

  const calcularTotais = (lista: FaturamentoOuProjecao[]) => {
    setTotalTitulos(lista.length);

    // Para faturamento uso valorBase, senão uso valor
    const somaBase = lista.reduce((acc, f) => {
      if (f.tipo === "FATURAMENTO") {
        return acc + Number(f.valorBase ?? 0);
      }
      return acc + Number(f.valorPrevisto ?? 0);
    }, 0);

    const somaImposto = lista.reduce((acc, f) => {
      if (f.tipo === "FATURAMENTO") {
        return acc + Number(f.impostoValor ?? 0);
      }
      return acc;
    }, 0);

    const somaTotal = lista.reduce((acc, f) => {
      if (f.tipo === "FATURAMENTO") {
        return acc + Number(f.valorTotal ?? 0);
      }
      return acc + Number(f.valorPrevisto ?? 0);
    }, 0);

    setTotalValorBase(somaBase);
    setTotalImposto(somaImposto);
    setTotalValor(somaTotal);
  };

  const colunasFaturamento: Column<FaturamentoOuProjecao>[] = [
    { header: "Empresa", accessor: "empresa", sortable: true },
    { header: "Unidade", accessor: "unidade", sortable: true },
    {
      header: "CNPJ", accessor: "cnpj", sortable: true, render: (v: string) => {
        const formatado = formatarDocumento(v, "CNPJ")

        return (
          <Copiavel valor={v} texto={formatado} />
        );
      }
    },
    {
      header: "Cidade",
      accessor: "cidade",
      render: (_, row) => {
        if (!row.cidade || !row.uf) return "—";

        const text = `${row.cidade}/${row.uf}`;

        return (
          <Copiavel valor={row.cidade} texto={text} />
        );
      },
      sortable: true,
    },
    {
      header: "Contato",
      accessor: "contatos",
      render: (_, row) => {
        if (!row.contatos || row.contatos.length === 0) return "—";

        const primeiro = row.contatos[0];
        const nome = primeiro.nome ?? "";
        const email = primeiro.email ?? primeiro.emailSecundario ?? "";

        return (
          <Copiavel valor={email} texto={nome} />
        );
      },
    },
    {
      header: "NF",
      accessor: "numeroNota",
      render: (v: string | undefined, row) =>
        row.tipo === "FATURAMENTO" ? v || "-" : "—",
      sortable: true,
    },
    {
      header: "Valor Base",
      accessor: "valorPrevisto",
      render: (_, row) => {
        const valorMostrar =
          row.tipo === "FATURAMENTO"
            ? row.valorTotal ?? row.valorBase ?? 0
            : row.valorPrevisto;
        return Number(valorMostrar).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        });
      },
      sortable: true,
    },
    {
      header: "Vencimento",
      accessor: "vencimento",
      render: (_: any, row: FaturamentoOuProjecao) => row.vencimento ?? "—",
      sortable: true,
    },
    {
      header: "Status",
      accessor: "status",
      render: (v: string, row) => {
        const estilos: Record<string, string> = {
          ABERTA: "bg-yellow-500 text-white",
          PAGA: "bg-green-500 text-white",
          ATRASADA: "bg-red-500 text-white",
          PENDENTE: "bg-orange-500 text-white",
          FATURADO: "bg-blue-500 text-white",
        };
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${estilos[v] ?? "bg-gray-100 text-gray-600"
              }`}
          >
            {row.tipo === "PROJECAO" ? `Projeção (${v})` : v}
          </span>
        );
      },
      sortable: true,
    },
  ];

  const faturamentosFiltrados = faturamentos.filter((f) => {
    const matchStatus = filtros.status ? f.status === filtros.status : true;
    const matchEmpresa = filtros.empresa
      ? f.empresa &&
      f.empresa.toLowerCase().includes(filtros.empresa.toLowerCase())
      : true;
    const matchUnidade = filtros.unidade
      ? f.unidade &&
      f.unidade.toLowerCase().includes(filtros.unidade.toLowerCase())
      : true;
    const matchNota = filtros.nota
      ? f.numeroNota?.toLowerCase().includes(filtros.nota.toLowerCase())
      : true;

    const competenciaDate = new Date(f.competencia + "-01");
    const inicio = filtros.competenciaInicio
      ? new Date(filtros.competenciaInicio)
      : null;
    const fim = filtros.competenciaFim ? new Date(filtros.competenciaFim) : null;
    const matchCompetencia =
      (!inicio || competenciaDate >= inicio) &&
      (!fim || competenciaDate <= fim);

    const pagoEm = f.pagoEm ? new Date(f.pagoEm) : null;
    const pagInicio = filtros.pagamentoInicio
      ? new Date(filtros.pagamentoInicio)
      : null;
    const pagFim = filtros.pagamentoFim
      ? new Date(filtros.pagamentoFim)
      : null;
    const matchPagamento =
      (!pagInicio || (pagoEm && pagoEm >= pagInicio)) &&
      (!pagFim || (pagoEm && pagoEm <= pagFim));

    return (
      matchStatus &&
      matchEmpresa &&
      matchUnidade &&
      matchNota &&
      matchCompetencia &&
      matchPagamento
    );
  });

  useEffect(() => {
    calcularTotais(faturamentosFiltrados);
  }, [faturamentosFiltrados]);

  const buscarFaturamento = async () => {
    try {
      const lista = await buscarFaturamentoOuProjecao();
      setFaturamentos(lista);
      carregarOpcoes(lista);
      calcularTotais(lista);
    } catch (error) {
      console.error("Erro ao buscar faturamentos/projeções:", error);
    }
  };

  useEffect(() => {
    buscarFaturamento();
  }, []);

  const abrirModal = (item: FaturamentoOuProjecao) => {
    setFaturamentoSelecionado(item);
    setModalAberto(true);
  };

  const salvarEdicao = async (f: FaturamentoOuProjecao) => {
    try {
      if (f.tipo === "FATURAMENTO") {
        await editarFaturamento(f);
      }

      if (f.tipo === "PROJECAO") {
        if (f.status === "FATURADO") {
          await gerarFaturamentoDeProjecao(f.id);
        } else {
          await editarProjecao(f);
        }
      }

      setModalAberto(false);
      await buscarFaturamento();
    } catch (error) {
      console.error("Erro ao salvar faturamento/projeção:", error);
    }
  };


  const carregarOpcoes = (lista: FaturamentoOuProjecao[]) => {
    const empresasUnicas = Array.from(
      new Map(
        lista
          .filter((f) => f.empresa)
          .map((e) => [e.empresa, { label: e.empresa!, value: e.empresa! }])
      ).values()
    );

    const unidadesUnicas = Array.from(
      new Map(
        lista
          .filter((f) => f.unidade)
          .map((u) => [u.unidade, { label: u.unidade!, value: u.unidade! }])
      ).values()
    );

    setEmpresas(empresasUnicas);
    setUnidades(unidadesUnicas);
  };

  const handleSelecionar = (itens: FaturamentoOuProjecao[]) => {
    setSelecionados(itens);
    console.log("Itens selecionados:", itens);
  };

  const cardClasses =
    "flex items-center justify-between gap-3 bg-white shadow-sm rounded-md p-4 col-span-1";

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Faturamento</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFiltrosVisiveis(!filtrosVisiveis)}
            className="px-3 py-2 rounded text-sm text-orange-600 bg-white"
          >
            <ListFilter size={18} />
          </button>
        </div>
      </div>

      {filtrosVisiveis && (
        <div className="bg-white border border-gray-300 rounded-md p-4 flex flex-col gap-4 mb-4">

          {/* Primeira linha: Competência e Status */}
          <div className="grid grid-cols-3 gap-4">
            <div className="h-full flex flex-col justify-between">
              <label className="block mb-1 text-sm font-medium text-gray-900">
                Status
              </label>
              <div className="flex rounded-md overflow-hidden border border-gray-300 bg-white text-sm font-medium w-full h-10 items-center">
                <button
                  onClick={() => setFiltros({ ...filtros, status: "" })}
                  className={`px-3 h-full w-full flex justify-center items-center gap-1 ${filtros.status === "" ? "bg-gray-200" : ""}`}
                >
                  <span className="text-xs">☰</span> Todos
                </button>
                <button
                  onClick={() => setFiltros({ ...filtros, status: "ABERTA" })}
                  className={`px-3 h-full w-full flex justify-center items-center gap-1 ${filtros.status === "ABERTA" ? "bg-yellow-200" : ""}`}
                >
                  <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block"></span> Aberta
                </button>
                <button
                  onClick={() => setFiltros({ ...filtros, status: "PAGA" })}
                  className={`px-3 h-full w-full flex justify-center items-center gap-1 ${filtros.status === "PAGA" ? "bg-green-200" : ""}`}
                >
                  <span className="w-2 h-2 rounded-full bg-green-600 inline-block"></span> Pago
                </button>
                <button
                  onClick={() => setFiltros({ ...filtros, status: "ATRASADA" })}
                  className={`px-3 h-full w-full flex justify-center items-center gap-1 ${filtros.status === "ATRASADA" ? "bg-red-200" : ""}`}
                >
                  <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span> Atrasado
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 col-span-2">
              <Input
                name="competenciaInicio"
                label="Competência de"
                type="date"
                value={filtros.competenciaInicio}
                onChange={(e) => setFiltros({ ...filtros, competenciaInicio: e.target.value })}
              />
              <Input
                name="competenciaFim"
                label="Competência até"
                type="date"
                value={filtros.competenciaFim}
                onChange={(e) => setFiltros({ ...filtros, competenciaFim: e.target.value })}
              />
              <Input
                name="pagamentoInicio"
                label="Pagamento de"
                type="date"
                value={filtros.pagamentoInicio}
                onChange={(e) => setFiltros({ ...filtros, pagamentoInicio: e.target.value })}
              />
              <Input
                name="pagamentoFim"
                label="Pagamento até"
                type="date"
                value={filtros.pagamentoFim}
                onChange={(e) => setFiltros({ ...filtros, pagamentoFim: e.target.value })}
              />
            </div>

          </div>

          {/* Segunda linha: Empresa | Unidade | NF */}
          <div className="grid grid-cols-4 gap-4">
            <SelectInput
              label="Status"
              name="status"
              value={filtros.status}
              onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
              options={[
                { label: "Faturada", value: "FATURADO" },
                { label: "Pendente", value: "PENDENTE" },
              ]}
              required={false}
            />

            <SearchableSelect
              label="Empresa"
              value={filtros.empresa}
              onChange={(v) =>
                setFiltros({ ...filtros, empresa: String(v), unidade: "" })
              }
              options={empresas}
              emptyOptionLabel="Todas"
            />
            <SearchableSelect
              label="Unidade"
              value={filtros.unidade}
              onChange={(v) => setFiltros({ ...filtros, unidade: String(v) })}
              options={unidades}
              emptyOptionLabel="Todas"
            />

            <Input
              name="nota"
              label="Nota Fiscal"
              value={filtros.nota}
              onChange={(e) => setFiltros({ ...filtros, nota: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setFiltros({
                status: "", empresa: "", unidade: "", competenciaInicio: "",
                competenciaFim: "", pagamentoInicio: "", pagamentoFim: "", nota: ""
              })}
              className="bg-gray-200 text-gray-600 px-4 py-2 rounded hover:bg-gray-300"
            >
              Limpar
            </button>
          </div>
        </div>
      )}

      {/* Cards */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className={cardClasses}>
          <div className="w-full">
            <p className="text-sm text-gray-500">Total de Faturas</p>
            <p className="text-lg font-bold text-gray-800 text-right">{totalTitulos}</p>
          </div>
        </div>
        <div className={cardClasses}>
          <div className="w-full">
            <p className="text-sm text-gray-500">Total Valor Base</p>
            <p className="text-lg font-bold text-blue-600 text-right">R$ {totalValorBase.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          </div>
        </div>

        <div className={cardClasses}>
          <div className="w-full">
            <p className="text-sm text-gray-500">Total Imposto</p>
            <p className="text-lg font-bold text-red-600 text-right">R$ {totalImposto.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          </div>
        </div>

        <div className={cardClasses}>
          <div className="w-full">
            <p className="text-sm text-gray-500">Valor Total</p>
            <p className="text-lg font-bold text-green-600 text-right">R$ {totalValor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
      </div>

      {selecionados.length > 0 && (
        <div className="mt-4 p-3 bg-gray-100 rounded flex justify-between items-center">
          <p>{selecionados.length} itens selecionados</p>
          <div className="flex gap-2">
            <button className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700">
              Marcar como Pago
            </button>
            <button className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700">
              Excluir
            </button>
          </div>
        </div>
      )}

      <TabelaBase<FaturamentoOuProjecao>
        className="text-xs"
        data={faturamentosFiltrados}
        columns={colunasFaturamento}
        onEdit={abrirModal}
        onSelect={handleSelecionar}
      />

      <ModalEditarFaturamento
        aberto={modalAberto}
        onClose={() => setModalAberto(false)}
        faturamento={faturamentoSelecionado}
        onSalvar={salvarEdicao}
      />

    </div>
  );
}