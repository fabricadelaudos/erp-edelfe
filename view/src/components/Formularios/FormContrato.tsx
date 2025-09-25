import { useEffect, useState } from "react";
import { Input, TextArea, SelectInput } from "../Inputs";
import type { Contrato } from "../../types/EstruturaEmpresa";
import { formatarDataInput } from "../Auxiliares/formatter";
import toast from "react-hot-toast";

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
    let atualizado = { ...formLocal, [campo]: valor };

    // Se porVida for ativado, forçamos recorrente = true
    if (campo === "porVida") {
      atualizado.recorrente = valor ? true : atualizado.recorrente;
    }

    setFormLocal(atualizado);
    onChange?.(atualizado);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isPorVida && (formLocal.vidas === 0 || formLocal.vidas === undefined)) {
      return toast.error("Informe o nº de vidas ativas.");
    }

    if (!formLocal.esocial && !formLocal.laudos) {
      return toast.error("Informe se possui e-Social e/ou Laudos.");
    }

    if (!formLocal.diaVencimento) {
      return toast.error("Informe o dia do vencimento.");
    }

    const contratoFinal: Contrato = {
      ...formLocal,
      recorrente: formLocal.porVida ? true : formLocal.recorrente,
    };

    onSave?.(contratoFinal);
  };

  const handleCancel = () => {
    setFormLocal({ ...contrato });
    onCancel?.();
  };

  const isMensal = !formLocal.porVida && !formLocal.recorrente;
  const isRecorrente = formLocal.recorrente && !formLocal.porVida;
  const isPorVida = formLocal.porVida;

  return (
    <form onSubmit={handleSave} className="space-y-4">
      {/* Toggle Por Vida / Recorrente / e-Social / Laudos */}
      <div className="flex items-center justify-end gap-4">
        <div className="flex items-center gap-1">
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

        <div className="flex items-center gap-1">
          <span className="text-sm font-medium text-gray-700">Recorrente</span>
          <button
            type="button"
            onClick={() => {
              if (!formLocal.porVida) {
                atualizar("recorrente", !formLocal.recorrente);
              }
            }}
            disabled={formLocal.porVida}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formLocal.recorrente ? "bg-green-500" : "bg-gray-300"} ${formLocal.porVida ? "opacity-50 cursor-not-allowed" : ""
              }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formLocal.recorrente ? "translate-x-6" : "translate-x-1"}`}
            />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-sm font-medium text-gray-700">e-Social</span>
          <button
            type="button"
            onClick={() => atualizar("esocial", !formLocal.esocial)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formLocal.esocial ? "bg-green-500" : "bg-gray-300"
              }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formLocal.esocial ? "translate-x-6" : "translate-x-1"
                }`}
            />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-sm font-medium text-gray-700">Laudos</span>
          <button
            type="button"
            onClick={() => atualizar("laudos", !formLocal.laudos)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formLocal.laudos ? "bg-green-500" : "bg-gray-300"
              }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formLocal.laudos ? "translate-x-6" : "translate-x-1"
                }`}
            />
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-4 gap-4">
        <Input
          type="date"
          name="dataInicio"
          label="Data Início"
          value={formatarDataInput(formLocal.dataInicio)}
          onChange={(e) => atualizar("dataInicio", e.target.value)}
        />

        <Input
          type="date"
          name="dataFim"
          label="Data Fim"
          value={formatarDataInput(formLocal.dataFim) || ""}
          onChange={(e) => atualizar("dataFim", e.target.value)}
        />

        {isMensal && (
          <>
            <Input
              name="parcelas"
              label="Parcelas"
              type="number"
              min={1}
              value={formLocal.parcelas || 0}
              onChange={(e) => atualizar("parcelas", Number(e.target.value))}
            />
            <Input
              name="valorBase"
              label="Valor Total do Contrato"
              type="text"
              value={formLocal.valorBase || ""}
              onChange={(e) => atualizar("valorBase", e.target.value)}
            />
          </>
        )}

        {isRecorrente && (
          <div className="col-span-2">
            <Input
              name="valorBase"
              label="Valor Mensal Recorrente"
              type="text"
              value={formLocal.valorBase || ""}
              onChange={(e) => atualizar("valorBase", e.target.value)}
            />
          </div>
        )}

        {isPorVida && (
          <>
            <Input
              name="valorBase"
              label="Valor por Vida"
              type="text"
              value={formLocal.valorBase || ""}
              onChange={(e) => atualizar("valorBase", e.target.value)}
            />
            <Input
              name="vidasTemp"
              label="Vidas Ativas"
              type="number"
              value={formLocal.vidas ?? ""}
              onChange={(e) => atualizar("vidas", Number(e.target.value))}
              required={isPorVida}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Input
          name="diaVencimento"
          label="Dia Vencimento"
          type="number"
          value={formLocal.diaVencimento ?? ""}
          onChange={(e) => atualizar("diaVencimento", e.target.value)}
        />
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
            type="submit"
            className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
          >
            Salvar
          </button>
        </div>
      )}
    </form>
  );
}