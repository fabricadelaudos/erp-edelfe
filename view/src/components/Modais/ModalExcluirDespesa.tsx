import { useMemo, useState } from "react";
import ModalBase from "./ModalBase";
import Swal from "sweetalert2";
import { Trash } from "lucide-react";
import Spinner from "../Loading";
import { formatarData, formatarReais } from "../Auxiliares/formatter";
import type { ParcelaComConta } from "../../types/EstruturaDespesa";
import { excluirContaPagar, excluirParcelaContaPagar } from "../../services/apiDespesa";

type ContaPagarDaParcela = ParcelaComConta["contaPagar"];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  contaPagar: ContaPagarDaParcela | null;
  onDeleted?: () => Promise<void> | void; // ex: carregarContas
}

export default function ModalExcluirDespesa({
  isOpen,
  onClose,
  contaPagar,
  onDeleted,
}: Props) {
  const [loadingParcelaId, setLoadingParcelaId] = useState<number | null>(null);
  const [loadingExcluirConta, setLoadingExcluirConta] = useState(false);

  const parcelas = useMemo(() => {
    const list = contaPagar?.parcelacontapagar ?? [];
    // Ordena por número/vencimento (ajuste como preferir)
    return [...list].sort((a: any, b: any) => {
      const av = new Date(a.vencimento).getTime();
      const bv = new Date(b.vencimento).getTime();
      return av - bv;
    });
  }, [contaPagar]);

  const temParcelaPaga = useMemo(() => {
    return parcelas.some((p: any) => p.status === "PAGA");
  }, [parcelas]);

  const handleExcluirParcela = async (p: any) => {
    if (!contaPagar) return;

    // regra (recomendada): não excluir paga
    if (p.status === "PAGA") {
      await Swal.fire("Atenção", "Não é permitido excluir uma parcela paga.", "info");
      return;
    }

    const res = await Swal.fire({
      title: "Excluir parcela?",
      html: `
        <div style="text-align:left">
          <p><b>Documento:</b> ${contaPagar.numeroDocumento ?? "—"}</p>
          <p><b>Parcela:</b> ${p.numero}</p>
          <p><b>Vencimento:</b> ${formatarData(p.vencimento)}</p>
          <p><b>Valor:</b> ${formatarReais(p.valor)}</p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, excluir",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc2626",
      reverseButtons: true,
    });

    if (!res.isConfirmed) return;

    try {
      setLoadingParcelaId(p.idParcela);
      await excluirParcelaContaPagar(p.idParcela);

      await onDeleted?.();

      await Swal.fire("Excluída!", "A parcela foi removida.", "success");
      onClose();
    } catch (e: any) {
      await Swal.fire("Erro", e?.message ?? "Falha ao excluir parcela.", "error");
    } finally {
      setLoadingParcelaId(null);
    }
  };

  const handleExcluirConta = async () => {
    if (!contaPagar) return;

    if (temParcelaPaga) {
      const r1 = await Swal.fire({
        title: "Existem parcelas pagas",
        text: "Excluir a conta inteira pode remover histórico financeiro. Deseja continuar?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sim, continuar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#dc2626",
        reverseButtons: true,
      });
      if (!r1.isConfirmed) return;
    }

    const res = await Swal.fire({
      title: "Excluir a despesa inteira?",
      html: `
        <div style="text-align:left">
          <p><b>Documento:</b> ${contaPagar.numeroDocumento ?? "—"}</p>
          <p><b>Fornecedor:</b> ${contaPagar.fornecedor?.nome ?? "—"}</p>
          <p><b>Parcelas:</b> ${parcelas.length}</p>
          <p style="margin-top:8px;color:#b91c1c"><b>Isso excluirá TODAS as parcelas.</b></p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, excluir tudo",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc2626",
      reverseButtons: true,
    });

    if (!res.isConfirmed) return;

    try {
      setLoadingExcluirConta(true);
      await excluirContaPagar(contaPagar.idContaPagar);

      await onDeleted?.();

      await Swal.fire("Excluída!", "A despesa e suas parcelas foram removidas.", "success");
      onClose();
    } catch (e: any) {
      await Swal.fire("Erro", e?.message ?? "Falha ao excluir a despesa.", "error");
    } finally {
      setLoadingExcluirConta(false);
    }
  };

  if (!contaPagar) return null;

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      titulo="Excluir Despesa"
    >
      <div className="space-y-4">
        {/* Cabeçalho da conta */}
        <div className="border border-gray-200 rounded-md p-3 bg-gray-50">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="text-sm text-gray-700">
                <span className="font-semibold">Documento:</span>{" "}
                {contaPagar.numeroDocumento ?? "—"}
              </div>
              <div className="text-sm text-gray-700">
                <span className="font-semibold">Fornecedor:</span>{" "}
                {contaPagar.fornecedor?.nome ?? "—"}
              </div>
              <div className="text-sm text-gray-700">
                <span className="font-semibold">Plano:</span>{" "}
                {contaPagar.planocontasubcategoria?.nome ?? "—"}
              </div>
              {contaPagar.descricao ? (
                <div className="text-xs text-gray-500 italic">{contaPagar.descricao}</div>
              ) : null}
            </div>

            <button
              onClick={handleExcluirConta}
              disabled={loadingExcluirConta}
              className="inline-flex items-center gap-2 px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
              title="Excluir a conta e todas as parcelas"
            >
              {loadingExcluirConta ? <Spinner size={16} /> : <Trash size={16} />}
              Excluir conta
            </button>
          </div>
        </div>

        {/* Lista de parcelas */}
        <div className="border border-gray-200 rounded-md overflow-hidden">
          <div className="bg-white px-3 py-2 border-b border-gray-200 flex justify-between items-center">
            <div className="font-semibold text-gray-800">
              Parcelas ({parcelas.length})
            </div>
            {temParcelaPaga && (
              <div className="text-xs text-gray-500">
                * Parcelas pagas não podem ser excluídas
              </div>
            )}
          </div>

          <div className="max-h-[420px] overflow-auto">
            {parcelas.length === 0 ? (
              <div className="p-4 text-sm text-gray-500">Nenhuma parcela encontrada.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-50 text-gray-700">
                  <tr className="text-left">
                    <th className="px-3 py-2">Parcela</th>
                    <th className="px-3 py-2">Vencimento</th>
                    <th className="px-3 py-2">Valor</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {parcelas.map((p: any) => (
                    <tr key={p.idParcela} className="bg-white">
                      <td className="px-3 py-2 font-medium">{p.numero}</td>
                      <td className="px-3 py-2">{formatarData(p.vencimento)}</td>
                      <td className="px-3 py-2">{formatarReais(p.valor)}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            p.status === "PAGA"
                              ? "bg-green-100 text-green-700"
                              : p.status === "VENCIDA"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          onClick={() => handleExcluirParcela(p)}
                          disabled={loadingParcelaId === p.idParcela || p.status === "PAGA"}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-60 disabled:cursor-not-allowed"
                          title={p.status === "PAGA" ? "Não pode excluir parcela paga" : "Excluir parcela"}
                        >
                          {loadingParcelaId === p.idParcela ? (
                            <Spinner size={14} />
                          ) : (
                            <Trash size={14} />
                          )}
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Rodapé */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            Fechar
          </button>
        </div>
      </div>
    </ModalBase>
  );
}
