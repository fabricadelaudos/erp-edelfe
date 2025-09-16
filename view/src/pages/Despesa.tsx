import { useState, useEffect } from "react";
import TabelaBase from "../components/Tabelas/TabelaBase";
import ModalBase from "../components/Modais/ModalBase";
import FormDespesa from "../components/Formularios/FormDespesa";
import { buscarContasPagar, confirmarPagamentoParcela } from "../services/apiDespesa";
import type { ContaPagar, ParcelaContaPagar } from "../types/EstruturaDespesa";
import { Input, SearchableSelect } from "../components/Inputs";
import { BanknoteIcon, ListFilter, Plus } from "lucide-react";
import ToolTip from "../components/Auxiliares/ToolTip";
import Swal from "sweetalert2";
import { formatarData, formatarReais } from "../components/Auxiliares/formatter";

type ParcelaComConta = ParcelaContaPagar & { contaPagar: ContaPagar };

export default function DespesaPage() {

  const hoje = new Date();
  const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

  const formatarDataInput = (data: Date): string => {
    return data.toISOString().split("T")[0];
  };

  const [parcelas, setParcelas] = useState<ParcelaComConta[]>([]);
  const [parcelasFiltradas, setParcelasFiltradas] = useState<ParcelaComConta[]>([]);
  const [filtrosVisiveis, setFiltrosVisiveis] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroFornecedor, setFiltroFornecedor] = useState("");
  const [filtroPlanoConta, setFiltroPlanoConta] = useState("");
  const [filtroPagamentoInicio, setFiltroPagamentoInicio] = useState("");
  const [filtroPagamentoFim, setFiltroPagamentoFim] = useState("");
  const [filtroVencimentoInicio, setFiltroVencimentoInicio] = useState(
    formatarDataInput(primeiroDiaMes)
  );
  const [filtroVencimentoFim, setFiltroVencimentoFim] = useState(
    formatarDataInput(ultimoDiaMes)
  );
  const [modalAberto, setModalAberto] = useState(false);

  const [todosFornecedores, setTodosFornecedores] = useState<string[]>([]);
  const [todosPlanos, setTodosPlanos] = useState<string[]>([]);

  const [totalTitulos, setTotalTitulos] = useState(0);
  const [totalPago, setTotalPago] = useState(0);
  const [totalPagoValor, setTotalPagoValor] = useState(0);
  const [totalAberto, setTotalAberto] = useState(0);
  const [totalAbertoValor, setTotalAbertoValor] = useState(0);

  const carregarContas = async () => {
    const contas = await buscarContasPagar();

    const todasParcelas = contas.flatMap((c) =>
      c.parcelasConta.map((p) => ({
        ...p,
        contaPagar: c,
      }))
    );
    setParcelas(todasParcelas);

    setTodosFornecedores([
      ...new Set(todasParcelas.map((p) => p.contaPagar.fornecedor.nome)),
    ]);
    setTodosPlanos([
      ...new Set(todasParcelas.map((p) => p.contaPagar.planoConta.nome)),
    ]);
  };

  useEffect(() => {
    carregarContas();
  }, []);

  const handleConfirmarPagamento = async (idParcela: number) => {
    await confirmarPagamentoParcela(idParcela);

    const contas = await buscarContasPagar();
    const todasParcelas = contas.flatMap((c) =>
      c.parcelasConta.map((p) => ({
        ...p,
        contaPagar: c
      }))
    );
    setParcelas(todasParcelas);
  };

  useEffect(() => {
    handleAplicarFiltrar();
  }, [parcelas]);

  const calcularTotais = async (parcelas: ParcelaComConta[]) => {
    // Total de títulos
    setTotalTitulos(parcelas.length);

    // Parcelas pagas
    const pagas = parcelas.filter((p) => p.status === "PAGA");
    const totalPago = pagas.length;
    const totalPagoValor = pagas.reduce((acc, p) => acc + parseFloat(p.valor), 0);

    // Parcelas em aberto
    const abertas = parcelas.filter((p) => p.status !== "PAGA");
    const totalAberto = abertas.length;
    const totalAbertoValor = abertas.reduce((acc, p) => acc + parseFloat(p.valor), 0);

    // Atualiza os estados
    setTotalPago(totalPago);
    setTotalPagoValor(totalPagoValor);
    setTotalAberto(totalAberto);
    setTotalAbertoValor(totalAbertoValor);
  };


  const handleAplicarFiltrar = async () => {
    const Filtradas = parcelas.filter((p) => {
      const dentroDoStatus = !filtroStatus || p.status === filtroStatus;
      const dentroFornecedor = !filtroFornecedor || p.contaPagar.fornecedor.nome === filtroFornecedor;
      const dentroPlano = !filtroPlanoConta || p.contaPagar.planoConta.nome === filtroPlanoConta;

      const venc = new Date(p.vencimento);
      const vencInicio = filtroVencimentoInicio ? new Date(filtroVencimentoInicio) : null;
      const vencFim = filtroVencimentoFim ? new Date(filtroVencimentoFim) : null;

      const dentroVencimento =
        (!vencInicio || venc >= vencInicio) &&
        (!vencFim || venc <= vencFim);

      return (
        dentroDoStatus &&
        dentroFornecedor &&
        dentroPlano &&
        dentroVencimento
      );
    });

    setParcelasFiltradas(Filtradas);
    await calcularTotais(Filtradas);
  }

  const handleLimparFiltros = () => {
    setFiltroStatus("");
    setFiltroFornecedor("");
    setFiltroPlanoConta("");
    setFiltroPagamentoInicio("");
    setFiltroPagamentoFim("");
    setFiltroVencimentoInicio("");
    setFiltroVencimentoFim("");
  }

  const confirmarPagamento = async (parcela: ParcelaComConta) => {
    const html = `
      <div class="text-left">
        <p><b>Número:</b> ${parcela.numero}</p>
        <p><b>Vencimento:</b> ${formatarData(parcela.vencimento)}</p>
        <p><b>Valor:</b> ${formatarReais(parcela.valor)}</p>
      </div>
    `;

    const result = await Swal.fire({
      title: "Confirmar Pagamento",
      html: html,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sim, confirmar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      await handleConfirmarPagamento(parcela.idParcela);
      Swal.fire("Confirmado!", "O pagamento foi registrado com sucesso.", "success");
    }
  };


  const cardClasses = "flex items-center gap-3 bg-white shadow-sm rounded-md p-4 col-span-1";

  return (
    <div className="flex flex-col h-full w-full p-4 space-y-4">
      {/* Título + Botão adicionar */}
      <div className="flex items-center justify-between mb-4 gap-4">
        <h2 className="text-xl font-bold">Despesas</h2>

        <div className="flex gap-2">
          <button
            onClick={() => setModalAberto(true)}
            className="flex items-center gap-2 bg-orange-400 text-white px-4 py-2 rounded hover:bg-orange-500"
          >
            <Plus size={18} />
            Despesa
          </button>
          <button
            onClick={() => setFiltrosVisiveis(!filtrosVisiveis)}
            className="px-3 py-2 rounded text-sm text-orange-600 bg-white"
          >
            <ListFilter size={18} />
          </button>
        </div>
      </div>

      {filtrosVisiveis && (
        <>
          {/* Filtros Avançados */}
          < div className="bg-white border border-gray-300 rounded-md p-4 flex flex-col gap-4">

            {/* Primeira linha: Status | Vencimento */}
            <div className="grid grid-cols-3 gap-2">
              {/* Grupo: Status */}
              <div className="h-full flex flex-col justify-between">
                <label className="block mb-1 text-sm font-medium text-gray-900">
                  Status da Parcela
                </label>
                <div className="flex rounded-md overflow-hidden border border-gray-300 bg-white text-sm font-medium w-full h-full items-center">
                  <button
                    onClick={() => setFiltroStatus("")}
                    className={`px-2 h-full w-full flex justify-center items-center gap-1 ${filtroStatus === "" ? "bg-gray-200" : ""}`}
                  >
                    <span className="text-xs">☰</span> Todos
                  </button>
                  <button
                    onClick={() => setFiltroStatus("ABERTA")}
                    className={`px-2 h-full w-full flex justify-center items-center gap-1 ${filtroStatus === "ABERTA" ? "bg-blue-200" : ""}`}
                  >
                    <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span> Em aberto
                  </button>
                  <button
                    onClick={() => setFiltroStatus("PAGA")}
                    className={`px-2 h-full w-full flex justify-center items-center gap-1 ${filtroStatus === "PAGA" ? "bg-green-200" : ""}`}
                  >
                    <span className="w-2 h-2 rounded-full bg-green-600 inline-block"></span> Pago
                  </button>
                  <button
                    onClick={() => setFiltroStatus("VENCIDA")}
                    className={`px-2 h-full w-full flex justify-center items-center gap-1 ${filtroStatus === "VENCIDA" ? "bg-red-200" : ""}`}
                  >
                    <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span> Vencido
                  </button>
                </div>
              </div>

              {/* Grupo: Período de Vencimento */}
              <div className="col-span-2">
                <div className="grid grid-cols-2 gap-4 h-full">
                  <Input
                    name="vencimentoInicio"
                    label="Vencimento de"
                    type="date"
                    value={filtroVencimentoInicio}
                    onChange={(e) => setFiltroVencimentoInicio(e.target.value)}
                    required={false}
                  />
                  <Input
                    name="vencimentoFim"
                    label="Vencimento até"
                    type="date"
                    value={filtroVencimentoFim}
                    onChange={(e) => setFiltroVencimentoFim(e.target.value)}
                    required={false}
                  />
                </div>
              </div>
            </div>


            {/* Segunda linha: Pagamento | Plano de Contas | Fornecedor */}
            <div className="grid grid-cols-3 gap-6">
              {/* Grupo: Período de Pagamento */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  name="pagamentoInicio"
                  label="Pagamento de"
                  type="date"
                  value={filtroPagamentoInicio}
                  onChange={(e) => setFiltroPagamentoInicio(e.target.value)}
                  required={false}
                />
                <Input
                  name="pagamentoFim"
                  label="Pagamento até"
                  type="date"
                  value={filtroPagamentoFim}
                  onChange={(e) => setFiltroPagamentoFim(e.target.value)}
                  required={false}
                />
              </div>

              {/* Plano de Contas */}
              <div>
                <SearchableSelect
                  label="Plano de Contas"
                  value={filtroPlanoConta}
                  onChange={(v) => setFiltroPlanoConta(String(v))}
                  options={todosPlanos.map((p) => ({ label: p, value: p }))}
                  emptyOptionLabel="Todos"
                />
              </div>

              {/* Fornecedor */}
              <div>
                <SearchableSelect
                  label="Fornecedor"
                  value={filtroFornecedor}
                  onChange={(v) => setFiltroFornecedor(String(v))}
                  options={todosFornecedores.map((f) => ({ label: f, value: f }))}
                  emptyOptionLabel="Todos"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button className="bg-gray-200 text-gray-600 px-4 py-2 rounded hover:bg-gray-300" onClick={handleLimparFiltros}>Limpar Filtros</button>
              <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" onClick={handleAplicarFiltrar}>Aplicar Filtros</button>
            </div>
          </div>
        </>
      )}

      <div className="grid grid-cols-5 gap-4 mb-4">
        <div className={cardClasses}>
          <div className="w-full">
            <p className="text-sm text-gray-500">Total de Títulos</p>
            <p className="text-lg font-bold text-gray-800 text-right">{totalTitulos}</p>
          </div>
        </div>

        <div className={cardClasses}>
          <div className="w-full">
            <p className="text-sm text-gray-500">Pagos</p>
            <p className="text-lg font-bold text-gray-800 text-right">{totalPago}</p>
          </div>
        </div>

        <div className={cardClasses}>
          <div className="w-full">
            <p className="text-sm text-gray-500">Aberto</p>
            <p className="text-lg font-bold text-gray-800 text-right">{totalAberto}</p>
          </div>
        </div>

        <div className={cardClasses}>
          <div className="w-full">
            <p className="text-sm text-gray-500">Total Pago</p>
            <p className="text-lg font-bold text-green-600 text-right">R$ {totalPagoValor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          </div>
        </div>

        <div className={cardClasses}>
          <div className="w-full">
            <p className="text-sm text-gray-500">Total em Aberto</p>
            <p className="text-lg font-bold text-red-600 text-right">R$ {totalAbertoValor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <TabelaBase<ParcelaComConta>
        data={parcelasFiltradas}
        columns={[
          {
            header: "Parcela",
            accessor: "numero",
            sortable: true
          },
          {
            header: "Valor",
            accessor: "valor",
            render: (v: string | number) => `R$ ${parseFloat(v as string).toFixed(2)}`,
            sortable: true
          },
          {
            header: "Vencimento",
            accessor: "vencimento",
            render: (v: string) => {
              const [ano, mes, dia] = v.split("T")[0].split("-");
              return `${dia}/${mes}/${ano}`;
            },
            sortable: true
          },
          {
            header: "Pago em",
            accessor: "pagoEm",
            render: (v: string | null) => {
              if (!v) return "—";
              const [ano, mes, dia] = v.split("T")[0].split("-");
              return `${dia}/${mes}/${ano}`;
            },
            sortable: true
          },
          {
            header: "Documento",
            accessor: "contaPagar",
            render: (_, row) => row.contaPagar.numeroDocumento,
            sortable: true
          },
          {
            header: "Fornecedor",
            accessor: "contaPagar",
            render: (_, row) => row.contaPagar.fornecedor.nome,
            sortable: true
          },
          {
            header: "Plano de Contas",
            accessor: "contaPagar",
            render: (_, row) => row.contaPagar.planoConta.nome,
            sortable: true
          },
          {
            header: "Status",
            accessor: "status",
            sortable: true,
            render: (status: string) => {
              const cores = {
                PENDENTE: "bg-yellow-100 text-yellow-700",
                PAGA: "bg-green-100 text-green-700",
                ATRASADA: "bg-red-100 text-red-700",
              };

              return (
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${cores[status as keyof typeof cores] ?? "bg-blue-100 text-blue-700"}`}
                >
                  {status}
                </span>
              );
            },
          },
          {
            header: "Ações",
            accessor: "contaPagar",
            render: (_: any, row: any) => (
              <ToolTip text="Confirmar Pagamento" position="left">
                <button
                  className="text-green-600 hover:text-green-700"
                  onClick={() => confirmarPagamento(row)}
                  disabled={row.status === "PAGA"}
                >
                  <BanknoteIcon />
                </button>
              </ToolTip>
            )
          },
        ]}
      />

      {/* Modal Cadastro de Despesa */}
      {
        modalAberto && (
          <ModalBase
            isOpen={modalAberto}
            onClose={() => setModalAberto(false)}
            titulo="Cadastrar Despesa"
          >
            <FormDespesa onClose={() => { setModalAberto(false); carregarContas(); }} />
          </ModalBase>
        )
      }
    </div >
  );
}