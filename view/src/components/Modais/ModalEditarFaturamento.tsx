import { useState, useEffect } from "react";
import type { Faturamento } from "../../types/EstruturaFaturamento";
import ModalBase from "../Modais/ModalBase";
import { formatarDocumento, formatarReais, formatarTelefone } from "../Auxiliares/formatter";
import Copiavel from "../Auxiliares/Copiavel";
import { Input, SelectInput } from "../Inputs";

interface Props {
  aberto: boolean;
  onClose: () => void;
  faturamento: Faturamento | null;
  onSalvar: (f: Faturamento) => void;
  editavel?: boolean;
}

export default function ModalEditarFaturamento({
  aberto,
  onClose,
  faturamento,
  onSalvar,
  editavel = true,
}: Props) {
  const [dados, setDados] = useState<Faturamento | null>(null);

  useEffect(() => {
    setDados(faturamento);
  }, [faturamento]);

  if (!dados) return null;

  const handleChange = (campo: keyof Faturamento, valor: any) => {
    setDados((prev) => (prev ? { ...prev, [campo]: valor } : prev));
  };

  const salvar = () => {
    if (dados) {
      onSalvar(dados);
      onClose();
    }
  };

  return (
    <ModalBase isOpen={aberto} onClose={onClose} titulo="Detalhes do Faturamento">
      <div className="flex flex-col gap-6 p-4 text-sm">
        <div className="grid grid-cols-5 gap-4">
          <div className="space-y-1">
            <label className="font-medium text-gray-600">Faturado por</label>
            <div>{dados.contrato?.faturadoPor ?? "—"}</div>
          </div>

          <div className="space-y-1">
            <label className="font-medium text-gray-600">Modalidade</label>
            <div className="flex flex-wrap gap-2 text-xs">
              {dados.contrato?.recorrente && <span>🔁 Recorrente</span>}
              {dados.contrato?.porVida && <span>🧍‍♂️ Por Vida</span>}
              {dados.contrato?.parcelas && <span>📅 {dados.contrato.parcelas} Parcelas</span>}
            </div>
          </div>

          <div>
            <label className="font-medium text-gray-600 mb-1 block">Empresa</label>
            <Copiavel valor={dados.contrato?.unidade?.empresa?.nome ?? "—"} />
          </div>

          <div>
            <label className="font-medium text-gray-600 mb-1 block">Unidade</label>
            <Copiavel valor={dados.contrato?.unidade?.nomeFantasia ?? "—"} />
          </div>

          <div>
            <label className="font-medium text-gray-600 mb-1 block">CNPJ</label>
            <Copiavel
              valor={formatarDocumento(
                dados.contrato?.unidade?.documento ?? "",
                dados.contrato?.unidade?.tipoDocumento ?? ""
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-6 gap-4">
          <SelectInput
            name="status"
            label="Status"
            value={dados.status}
            onChange={(e) => handleChange("status", e.target.value)}
            options={[
              { label: "ABERTA", value: "ABERTA" },
              { label: "PAGA", value: "PAGA" },
              { label: "ATRASADA", value: "ATRASADA" },
            ]}
            disable={!editavel}
            className={`border border-gray-300 text-sm rounded-md block w-full p-2.5 focus:border-2 focus:border-blue-500 focus:outline-none bg-white 
              ${dados.status === "PAGA"
                ? "text-green-600 font-semibold"
                : dados.status === "ATRASADA"
                  ? "text-red-600 font-semibold"
                  : dados.status === "ABERTA" && "text-yellow-600 font-semibold"
              }`}
          />

          <Input
            name="numeroNota"
            label="Número da Nota"
            value={dados.numeroNota ?? ""}
            onChange={(e) => handleChange("numeroNota", e.target.value)}
            disable={!editavel}
          />

          {dados.contrato?.porVida && (
            <Input
              name="vidas"
              label="Vidas"
              type="number"
              value={dados.vidas ?? ""}
              onChange={(e) => handleChange("vidas", Number(e.target.value))}
              disable={!editavel}
            />
          )}

          <div>
            <label className="font-medium text-gray-600 mb-1 block">Valor Base</label>
            <Copiavel valor={formatarReais(dados.valorBase?.toString()) ?? "—"} />
          </div>

          <div>
            <label className="font-medium text-gray-600 mb-1 block">Imposto (%)</label>
            <Copiavel
              valor={`${dados.impostoPorcentagem ?? "—"}%`}
            />
          </div>

          <div>
            <label className="font-medium text-gray-600 mb-1 block">Imposto (R$)</label>
            <Copiavel valor={formatarReais(dados.impostoValor?.toString()) ?? "—"} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-medium text-gray-600 mb-1 block">Contato</label>
            <div className="space-y-2">
              {(dados.contrato?.unidade?.contato ?? []).map((contato, i) => (
                <div key={i} className="border border-orange-300 rounded-md p-2 bg-orange-50 space-y-1">
                  {contato.nome && <Copiavel valor={contato.nome} />}
                  <div className="flex items-center gap-1 justify-between">
                    {contato.email && (
                      <div className="flex items-center gap-1">
                        <span className="text-gray-400 text-xs">Email: </span>
                        <Copiavel valor={contato.email} />
                      </div>
                    )}
                    {contato.emailSecundario && (
                      <div className="flex items-center gap-1">
                        <span className="text-gray-400 text-xs">Email Secundário: </span>
                        <Copiavel valor={contato.emailSecundario} />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 justify-between">
                    {contato.telefoneWpp && (
                      <div className="flex items-center gap-1">
                        <span className="text-gray-400 text-xs">WhatsApp: </span>
                        <Copiavel valor={formatarTelefone(contato.telefoneWpp, "WPP")} />
                      </div>
                    )}
                    {contato.telefoneFixo && (
                      <div className="flex items-center gap-1">
                        <span className="text-gray-400 text-xs">Fixo: </span>
                        <Copiavel valor={formatarTelefone(contato.telefoneFixo, "FIXO")} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="font-medium text-gray-600 mb-1 block">Endereço</label>
            <div className="space-y-1 bg-green-50 border border-green-400 p-2 rounded-md">
              <div>{dados.contrato?.unidade?.endereco}, {dados.contrato?.unidade?.numero} - {dados.contrato?.unidade?.bairro}</div>
              <Copiavel valor={`${dados.contrato?.unidade?.cidade}/${dados.contrato?.unidade?.uf}`} />
              <div>CEP: {dados.contrato?.unidade?.cep}</div>
            </div>
          </div>
        </div>
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
