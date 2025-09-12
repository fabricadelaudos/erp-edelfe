import { useEffect, useState } from "react";
import { buscarFaturamentoPorCompetencia, editarFaturamento, gerarFaturamentoPorCompetencia } from "../services/apiFaturamento";
import type { Faturamento } from "../types/EstruturaFaturamento";
import TabelaBase, { type Column } from "../components/Tabelas/TabelaBase";
import ModalEditarFaturamento from "../components/Modais/ModalEditarFaturamento";
import { formatarDocumento, formatarTelefone } from "../components/Auxiliares/formatter";
import ToolTip from "../components/Auxiliares/ToolTip";
import { Input, SelectInput } from "../components/Inputs";

export default function FaturamentoPage() {
  const [competencia, setCompetencia] = useState(() => {
    const hoje = new Date();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const ano = hoje.getFullYear();
    return `${ano}-${mes}`;
  });
  const [faturamentos, setFaturamentos] = useState<Faturamento[]>([]);

  const [modalAberto, setModalAberto] = useState(false);
  const [faturamentoSelecionado, setFaturamentoSelecionado] = useState<Faturamento | null>(null);

  const colunasFaturamento: Column<Faturamento>[] = [
    {
      header: "Status",
      accessor: "status",
      render: (v: string) => {
        const estilos: Record<string, string> = {
          ABERTA: "bg-yellow-500 text-white",
          PAGA: "bg-green-500 text-white",
          ATRASADA: "bg-red-500 text-white",
        };

        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold cursor-pointer ${estilos[v] ?? "bg-gray-100 text-gray-600"}`}
          >
            {v}
          </span>
        );
      },
      sortable: true,
    },
    {
      header: "Empresa",
      accessor: "idFaturamento",
      render: (_: any, row: Faturamento) => row.contrato?.unidade?.empresa?.nome ?? "—",
      sortable: true,
    },
    {
      header: "Unidade",
      accessor: "idFaturamento",
      render: (_: any, row: Faturamento) => row.contrato?.unidade?.nomeFantasia ?? "—",
      sortable: true,
    },
    {
      header: "CNPJ",
      accessor: "idFaturamento",
      render: (_: any, row: Faturamento) => formatarDocumento(row.contrato?.unidade?.documento ?? "", row.contrato?.unidade?.tipoDocumento ?? "") ?? "—",
      sortable: true,
    },
    {
      header: "Cidade",
      accessor: "idFaturamento",
      render: (_: any, row: Faturamento) => {
        const cidade = row.contrato?.unidade?.cidade;
        const uf = row.contrato?.unidade?.uf;

        return cidade && uf ? `${cidade}/${uf}` : "—";
      },
      sortable: true,
    },
    {
      header: "Contato",
      accessor: "idFaturamento",
      render: (_: any, row: Faturamento) => {
        const contatos = row.contrato?.unidade?.contato ?? [];
        if (!contatos.length) return "—";

        return (
          <div className="text-sm leading-tight space-y-1 max-w-[220px] truncate">
            {contatos.map((contato, index) => (
              <div key={index} className="border-b last:border-b-0 pb-1">
                {contato.email && <div>{contato.email}</div>}
                {contato.emailSecundario && <div>{contato.emailSecundario}</div>}
                {contato.telefoneWpp && (
                  <div>{formatarTelefone(contato.telefoneWpp, "WPP")}</div>
                )}
                {contato.telefoneFixo && (
                  <div>{formatarTelefone(contato.telefoneFixo, "FIXO")}</div>
                )}
              </div>
            ))}
          </div>
        );
      },
      sortable: false,
    },
    {
      header: "Faturamento",
      accessor: "idFaturamento",
      render: (_: any, row: Faturamento) => row.contrato?.faturadoPor ?? "—",
      sortable: true,
    },
    {
      header: "Contrato",
      accessor: "fkContratoId",
      render: (_: any, row: Faturamento) => {
        const { esocial, laudos } = row.contrato ?? {};

        return (
          <div className="flex items-center justify-center gap-2">
            <ToolTip text="e-Social">
              <div
                className={`w-3 h-3 cursor-pointer rounded-full ${esocial ? "bg-green-500" : "bg-gray-300"
                  }`}
              />
            </ToolTip>
            <ToolTip text="Laudos">
              <div
                className={`w-3 h-3 cursor-pointer rounded-full ${laudos ? "bg-blue-500" : "bg-gray-300"
                  }`}
              />
            </ToolTip>
          </div>
        );
      },
      sortable: true,
    },
    {
      header: "NF",
      accessor: "numeroNota",
      sortable: true,
      render: (value) => value || "-"
    },
    {
      header: "Valor Base",
      accessor: "valorBase",
      render: (v: number) =>
        Number(v).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }),
      sortable: true,
    },
    {
      header: "% Imposto",
      accessor: "impostoPorcentagem",
      render: (v: number) => `${v}%`,
      sortable: true,
    },
    {
      header: "Vencimento",
      accessor: "idFaturamento",
      render: (_: any, row: Faturamento) => row.contrato?.diaVencimento ?? "—",
      sortable: true,
    },
  ];

  const [filtros, setFiltros] = useState({
    status: "",
    empresa: "",
  });

  const [totalTitulos, setTotalTitulos] = useState(0);
  const [totalValorBase, setTotalValorBase] = useState(0);
  const [totalImposto, setTotalImposto] = useState(0);
  const [totalValor, setTotalValor] = useState(0);

  const calcularTotais = (lista: Faturamento[]) => {
    setTotalTitulos(lista.length);

    const somaBase = lista.reduce((acc, f) => acc + Number(f.valorBase), 0);
    const somaImposto = lista.reduce((acc, f) => acc + Number(f.impostoValor), 0);
    const somaValor = lista.reduce((acc, f) => acc + Number(f.valorTotal), 0);

    setTotalValorBase(somaBase);
    setTotalImposto(somaImposto);
    setTotalValor(somaValor);
  };

  const faturamentosFiltrados = faturamentos.filter(f => {
    const matchStatus = filtros.status ? f.status === filtros.status : true;
    const matchEmpresa = filtros.empresa
      ? f.contrato?.unidade?.empresa?.nome
        ?.toLowerCase()
        .includes(filtros.empresa.toLowerCase())
      : true;

    return matchStatus && matchEmpresa;
  });

  useEffect(() => {
    calcularTotais(faturamentosFiltrados);
  }, [faturamentosFiltrados]);

  const buscarFaturamento = async () => {
    try {
      const lista = await buscarFaturamentoPorCompetencia(competencia);
      if (lista.length > 0) {
        setFaturamentos(lista);
        calcularTotais(lista);
      } else {
        setFaturamentos([]);
        setTotalTitulos(0);
        setTotalValorBase(0);
        setTotalImposto(0);
        setTotalValor(0);
      }
    } catch (error) {
      console.error("Erro ao buscar faturamento:", error);
    }
  };

  useEffect(() => {
    buscarFaturamento();
  }, [competencia]);

  const gerarFaturamento = async () => {
    const lista = await gerarFaturamentoPorCompetencia(competencia);
    console.log("Faturamentos gerados:", lista);
    setFaturamentos(lista);
    calcularTotais(lista);
  };

  const abrirModal = (item: Faturamento) => {
    setFaturamentoSelecionado(item);
    setModalAberto(true);
  };

  const salvarEdicao = async (f: Faturamento) => {
    try {
      await editarFaturamento(f);
      setModalAberto(false);
      await buscarFaturamento();
    } catch (error) {
      console.error("Erro ao salvar faturamento:", error);
    }
  };

  const cardClasses = "flex items-center justify-between gap-3 bg-white shadow-sm rounded-md p-4 col-span-1";

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Faturamento</h1>
        <div className="flex items-center gap-2">
          <div>
            <label className="block text-xs">Competência:</label>
            <input
              type="month"
              value={competencia}
              onChange={(e) => setCompetencia(e.target.value)}
              className="bg-gray-200 text-center px-2 py-1 rounded mb-2 focus:outline-none"
            />
          </div>
          <button onClick={gerarFaturamento} className="bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 rounded">
            Gerar Faturamento
          </button>
        </div>
      </div>

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

      <div className="w-full overflow-x-auto bg-white p-4 rounded">
        <div className="flex justify-end gap-2 mb-2">
          <SelectInput
            label="Selecione um Status"
            name="status"
            value={filtros.status}
            onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
            options={[
              { label: "Aberta", value: "ABERTA" },
              { label: "Paga", value: "PAGA" },
              { label: "Atrasada", value: "ATRASADA" },
            ]}
            required={false}
          />

          <Input
            label="Filtrar por empresa"
            name="empresa"
            placeholder="Buscar empresa ..."
            value={filtros.empresa}
            onChange={(e) => setFiltros({ ...filtros, empresa: e.target.value })}
            required={false}
          />
        </div>


        <TabelaBase<Faturamento>
          data={faturamentosFiltrados}
          columns={colunasFaturamento}
          onEdit={abrirModal}
        />
      </div>

      <ModalEditarFaturamento
        aberto={modalAberto}
        onClose={() => setModalAberto(false)}
        faturamento={faturamentoSelecionado}
        onSalvar={salvarEdicao}
      />

    </div>
  );
}