import { useEffect, useState } from "react";
import { Input, TextArea, SelectInput } from "../Inputs";
import type { Contrato } from "../../types/EstruturaEmpresa";

interface Props {
  contrato: Contrato;
  onChange?: (contrato: Contrato) => void;
  onSave?: (contrato: Contrato) => void;
  onCancel?: () => void;
  showActions?: boolean;
}

export default function FormContrato({
  contrato,
  onChange,
  onSave,
  onCancel,
  showActions = true,
}: Props) {
  const [formLocal, setFormLocal] = useState<Contrato>({ ...contrato });

  useEffect(() => {
    setFormLocal({ ...contrato });
  }, [contrato]);

  const atualizar = <K extends keyof Contrato>(campo: K, valor: Contrato[K]) => {
    const atualizado = { ...formLocal, [campo]: valor };
    setFormLocal(atualizado);
    onChange?.(atualizado);
  };

  const handleSave = () => onSave?.(formLocal);
  const handleCancel = () => {
    setFormLocal({ ...contrato });
    onCancel?.();
  };

  const isMensal = !formLocal.porVida && !formLocal.recorrente;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          type="date"
          name="dataInicio"
          label="Data Início"
          value={formLocal.dataInicio}
          onChange={(e) => atualizar("dataInicio", e.target.value)}
        />

        <Input
          type="date"
          name="dataFim"
          label="Data Fim"
          value={formLocal.dataFim || ""}
          onChange={(e) => atualizar("dataFim", e.target.value)}
        />

        {isMensal && (
          <Input
            name="parcelas"
            label="Parcelas"
            type="number"
            min={1}
            value={formLocal.parcelas || 1}
            onChange={(e) => atualizar("parcelas", Number(e.target.value))}
          />
        )}

        {!formLocal.porVida && !formLocal.recorrente && (
          <Input
            name="valorBase"
            label="Valor Total (Mensal)"
            type="text"
            value={formLocal.valorBase || ""}
            onChange={(e) => atualizar("valorBase", e.target.value)}
          />
        )}

        {formLocal.porVida && (
          <>
            <Input
              name="valorPorVida"
              label="Valor por Vida"
              type="text"
              value={formLocal.valorBase || ""}
              onChange={(e) => atualizar("valorBase", e.target.value)}
            />
            <Input
              name="vidasAtivasTemp"
              label="Vidas Ativas (Apenas cálculo)"
              type="number"
              value={formLocal.vidasAtivasTemp ?? ""}
              onChange={(e) => atualizar("vidasAtivasTemp", Number(e.target.value))}
            />
          </>
        )}

        {formLocal.recorrente && !formLocal.porVida && (
          <Input
            name="valorRecorrente"
            label="Valor Mensal Recorrente"
            type="text"
            value={formLocal.valorRecorrente || ""}
            onChange={(e) => atualizar("valorRecorrente", e.target.value)}
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Toggle Por Vida */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Por Vida</span>
          <button
            type="button"
            onClick={() => atualizar("porVida", !formLocal.porVida)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formLocal.porVida ? "bg-green-500" : "bg-gray-300"}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formLocal.porVida ? "translate-x-6" : "translate-x-1"}`}
            />
          </button>
        </div>

        {/* Toggle Recorrente */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Recorrente</span>
          <button
            type="button"
            onClick={() => atualizar("recorrente", !formLocal.recorrente)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formLocal.recorrente ? "bg-green-500" : "bg-gray-300"}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formLocal.recorrente ? "translate-x-6" : "translate-x-1"}`}
            />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <SelectInput
          name="status"
          label="Status"
          value={formLocal.status}
          onChange={(e) => atualizar("status", e.target.value as Contrato["status"])}
          options={[
            { value: "ATIVO", label: "Ativo" },
            { value: "ENCERRADO", label: "Encerrado" },
            { value: "CANCELADO", label: "Cancelado" },
          ]}
        />
        <SelectInput
          name="faturadoPor"
          label="Faturado Por"
          value={formLocal.faturadoPor}
          onChange={(e) => atualizar("faturadoPor", e.target.value as Contrato["faturadoPor"])}
          options={[
            { value: "MEDWORK", label: "Medwork" },
            { value: "EDELFE", label: "Edelfe" },
          ]}
        />
      </div>

      <TextArea
        name="observacao"
        label="Observações"
        value={formLocal.observacao || ""}
        onChange={(e) => atualizar("observacao", e.target.value)}
        required={false}
      />

      {showActions && (
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
          >
            Salvar
          </button>
        </div>
      )}
    </div>
  );
}