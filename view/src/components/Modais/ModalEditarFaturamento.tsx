import { useEffect, useState } from "react";
import type { FaturamentoOuProjecao } from "../../types/EstruturaFaturamento";
import ModalBase from "../Modais/ModalBase";
import { formatarDocumento, formatarReais } from "../Auxiliares/formatter";
import Copiavel from "../Auxiliares/Copiavel";
import { Input, SelectInput } from "../Inputs";

interface Props {
  aberto: boolean;
  onClose: () => void;
  faturamento: FaturamentoOuProjecao | null;
  onSalvar: (f: FaturamentoOuProjecao) => void;
  editavel?: boolean;
}

export default function ModalEditarFaturamento({
  aberto,
  onClose,
  faturamento,
  onSalvar,
  editavel = true,
}: Props) {
  const [dados, setDados] = useState<FaturamentoOuProjecao | null>(null);

  useEffect(() => {
    if (!faturamento) return;

    const isProjecao = faturamento.tipo === "PROJECAO";
    const valorBase = Number(faturamento?.contrato?.valorBase ?? 0);
    const vidas = Number(faturamento.vidas ?? faturamento.vidas ?? 0);

    const valorCalculado = isProjecao ? valorBase * vidas : faturamento.valorPrevisto;

    setDados({
      ...faturamento,
      valorPrevisto: valorCalculado,
      vidas: vidas,
    });
  }, [faturamento]);


  if (!dados) return null;

  const handleChange = (campo: keyof FaturamentoOuProjecao, valor: any) => {
    setDados((prev) => {
      if (!prev) return null;

      const atualizado = { ...prev, [campo]: valor };

      // Se for projeção e vidas forem alteradas
      if (prev.tipo === "PROJECAO" && campo === "vidas") {
        const base = Number(prev.contrato?.valorBase ?? 0);
        const vidas = Number(valor);
        const calculado = base * vidas;

        atualizado.valorPrevisto = calculado;
      }

      return atualizado;
    });
  };

  const salvar = () => {
    if (dados) {
      onSalvar(dados);
      onClose();
    }
  };

  const isProjecao = dados.tipo === "PROJECAO";
  const isFaturamento = dados.tipo === "FATURAMENTO";

  const opcoesStatus = isProjecao
    ? [
      { label: "PENDENTE", value: "PENDENTE" },
      { label: "FATURADO", value: "FATURADO" },
    ]
    : [
      { label: "ABERTA", value: "ABERTA" },
      { label: "PAGA", value: "PAGA" },
      { label: "ATRASADA", value: "ATRASADA" },
    ];

  return (
    <ModalBase
      isOpen={aberto}
      onClose={onClose}
      titulo={isProjecao ? "Detalhes da Projeção" : "Detalhes do Faturamento"}
    >
      <div className="flex flex-col gap-6 p-4 text-sm">
        {/* Linha 1 */}
        <div className="grid grid-cols-5 gap-4">
          {isFaturamento && (
            <>
              <div className="space-y-1">
                <label className="font-medium text-gray-600">Faturado por</label>
                <div>{dados.faturadoPor ?? "—"}</div>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-gray-600">eSocial / Laudos</label>
                <div className="flex flex-wrap gap-2 text-xs">
                  {dados.esocial && <span>📑 eSocial</span>}
                  {dados.laudos && <span>📋 Laudos</span>}
                  {!dados.esocial && !dados.laudos && <span>—</span>}
                </div>
              </div>
            </>
          )}

          <div>
            <label className="font-medium text-gray-600 mb-1 block">Empresa</label>
            <Copiavel valor={dados.empresa ?? "—"} />
          </div>

          <div>
            <label className="font-medium text-gray-600 mb-1 block">Unidade</label>
            <Copiavel valor={dados.unidade ?? "—"} />
          </div>

          <div>
            <label className="font-medium text-gray-600 mb-1 block">CNPJ</label>
            <Copiavel valor={formatarDocumento(dados.cnpj ?? "", "CNPJ")} />
          </div>
        </div>

        {/* Linha 2 */}
        <div className="grid grid-cols-4 gap-4">
          <SelectInput
            name="status"
            label="Status"
            value={dados.status}
            onChange={(e) => handleChange("status", e.target.value)}
            options={opcoesStatus}
            disable={!editavel}
            className={`border border-gray-300 text-sm rounded-md block w-full p-2.5 focus:border-2 focus:border-blue-500 focus:outline-none bg-white 
              ${dados.status === "PAGA"
                ? "text-green-600 font-semibold"
                : dados.status === "ATRASADA"
                  ? "text-red-600 font-semibold"
                  : dados.status === "ABERTA"
                    ? "text-yellow-600 font-semibold"
                    : "text-gray-600"
              }`}
          />

          {isFaturamento && (
            <Input
              name="numeroNota"
              label="Número da Nota"
              value={dados.numeroNota?.toString() ?? ""}
              onChange={(e) => handleChange("numeroNota", e.target.value)}
              disable={!editavel}
            />
          )}

          {isFaturamento && (
            <>
              <div>
                <label className="font-medium text-gray-600 mb-1 block">Valor Base</label>
                <Copiavel valor={formatarReais(dados.valorBase?.toString()) ?? "—"} />
              </div>

              <div>
                <label className="font-medium text-gray-600 mb-1 block">Valor Total</label>
                <Copiavel valor={formatarReais(dados.valorTotal?.toString()) ?? "—"} />
              </div>
            </>
          )}

          {isProjecao && (
            <>
              <Input
                name="vidas"
                label="Vidas Ativas"
                type="number"
                value={dados.vidas ?? ""}
                onChange={(e) =>
                  handleChange("vidas", Number(e.target.value))
                }
                disable={!editavel}
              />

              <div>
                <label className="font-medium text-gray-600 mb-1 block">Valor Previsto</label>
                <Copiavel valor={formatarReais(dados.valorPrevisto?.toString()) ?? "—"} />
              </div>
            </>
          )}
        </div>

        {/* Linha 3 */}
        {isFaturamento && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-medium text-gray-600 mb-1 block">Imposto (%)</label>
              <Copiavel valor={`${dados.impostoPorcentagem?.toString() ?? "—"}%`} />
            </div>

            <div>
              <label className="font-medium text-gray-600 mb-1 block">Imposto (R$)</label>
              <Copiavel valor={formatarReais(dados.impostoValor?.toString()) ?? "—"} />
            </div>
          </div>
        )}

        {/* Endereço resumido */}
        {(dados.cidade || dados.uf) && (
          <div className="bg-green-50 border border-green-400 p-2 rounded-md text-sm">
            {dados.cidade && dados.uf
              ? `${dados.cidade}/${dados.uf}`
              : dados.cidade ?? dados.uf}
          </div>
        )}
      </div>

      {editavel && (
        <div className="mt-6 flex justify-end gap-3 px-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            Cancelar
          </button>
          <button
            onClick={salvar}
            className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 transition"
          >
            Salvar
          </button>
        </div>
      )}
    </ModalBase>
  );
}
