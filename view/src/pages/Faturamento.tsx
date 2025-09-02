import { useEffect, useState } from "react";
import { buscarFaturamentoPorCompetencia, gerarFaturamentoPorCompetencia } from "../services/apiFaturamento";
import type { Faturamento } from "../types/EstruturaFaturamento";
import TabelaBase, { type Column } from "../components/Tabelas/TabelaBase";
import ModalEditarFaturamento from "../components/Modais/ModalEditarFaturamento";

export default function FaturamentoPage() {
  const [competencia, setCompetencia] = useState(() => {
    const hoje = new Date();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const ano = hoje.getFullYear();
    return `${ano}-${mes}`;
  });
  const [faturamentos, setFaturamentos] = useState<Faturamento[]>([]);
  const [gerado, setGerado] = useState(false);

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
      header: "Contrato",
      accessor: "fkContratoId",
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
      header: "Imposto",
      accessor: "impostoValor",
      render: (v: number) =>
        Number(v).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }),
      sortable: true,
    },
    {
      header: "Valor Total",
      accessor: "valorTotal",
      render: (v: number) =>
        Number(v).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }),
      sortable: true,
    },
    {
      header: "Vidas",
      accessor: "vidas",
      sortable: true,
    },
    {
      header: "NF",
      accessor: "numeroNF",
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

  useEffect(() => {
    const buscarFaturamento = async () => {
      try {
        const lista = await buscarFaturamentoPorCompetencia(competencia);
        if (lista.length > 0) {
          setFaturamentos(lista);
          setGerado(true);
        } else {
          setFaturamentos([]);
          setGerado(false);
        }
      } catch (error) {
        console.error("Erro ao buscar faturamento:", error);
      }
    };

    buscarFaturamento();
  }, [competencia]);

  const gerarFaturamento = async () => {
    const lista = await gerarFaturamentoPorCompetencia(competencia);
    setFaturamentos(lista);
    setGerado(true);
  };

  const abrirModal = (item: Faturamento) => {
    setFaturamentoSelecionado(item);
    setModalAberto(true);
  };

  const salvarEdicao = (f: Faturamento) => {
    const copia = [...faturamentos];
    const index = copia.findIndex((x) => x.idFaturamento === f.idFaturamento);
    if (index >= 0) {
      copia[index] = f;
      setFaturamentos(copia);
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
              type="text"
              value={competencia}
              onChange={(e) => setCompetencia(e.target.value)}
              placeholder="09/2025"
              className="bg-gray-200 text-center px-2 py-1 rounded mb-2 focus:outline-none"
            />
          </div>
          <button onClick={gerarFaturamento} className="bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 rounded">
            Gerar Faturamento
          </button>
        </div>
      </div>


      <TabelaBase<Faturamento>
        data={faturamentos}
        columns={colunasFaturamento}
        onEdit={abrirModal}
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