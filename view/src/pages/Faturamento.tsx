import { useEffect, useState } from "react";
import { buscarFaturamentoPorCompetencia, editarFaturamento, gerarFaturamentoPorCompetencia } from "../services/apiFaturamento";
import type { Faturamento } from "../types/EstruturaFaturamento";
import TabelaBase, { type Column } from "../components/Tabelas/TabelaBase";
import ModalEditarFaturamento from "../components/Modais/ModalEditarFaturamento";
import { formatarDocumento, formatarTelefone } from "../components/Auxiliares/formatter";
import ToolTip from "../components/Auxiliares/ToolTip";

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
        console.log(row.contrato?.unidade?.contato);
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
    {
      header: "Status",
      accessor: "status",
      render: (v: string) => {
        const cores: Record<string, string> = {
          ABERTA: "text-yellow-600",
          PAGA: "text-green-700",
          ATRASADA: "text-red-600",
        };
        return <span className={`font-semibold ${cores[v] ?? ""}`}>{v}</span>;
      },
      sortable: true,
    },
  ];

  const buscarFaturamento = async () => {
    try {
      const lista = await buscarFaturamentoPorCompetencia(competencia);
      if (lista.length > 0) {
        setFaturamentos(lista);
      } else {
        setFaturamentos([]);
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
    setFaturamentos(lista);
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

  return (
    <div className="p-5 bg-white rounded border border-gray-300">
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


      <div className="w-full overflow-x-auto">
        <TabelaBase<Faturamento>
          data={faturamentos}
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