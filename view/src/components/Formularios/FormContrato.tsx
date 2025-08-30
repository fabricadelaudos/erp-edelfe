import { useEffect, useState } from "react";
import { Input, TextArea, SelectInput } from "../Inputs";
import type { Contrato } from "../../types/EstruturaEmpresa";

interface Props {
  contrato: Contrato;                        // valor inicial
  onChange?: (contrato: Contrato) => void;   // (opcional) emitir mudanças live
  onSave?: (contrato: Contrato) => void;     // chama ao clicar em Salvar
  onCancel?: () => void;                     // chama ao clicar em Cancelar
  showActions?: boolean;                     // se true, mostra os botões (default: true)
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
    // se quiser emitir live pro pai (ex.: pré-visualização), mantém esse onChange
    onChange?.(atualizado);
  };

  const handleSave = () => onSave?.(formLocal);
  const handleCancel = () => {
    setFormLocal({ ...contrato }); // desfaz alterações
    onCancel?.();
  };

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
          value={formLocal.dataFim}
          onChange={(e) => atualizar("dataFim", e.target.value)}
        />
        <Input
          name="parcelas"
          label="Parcelas"
          type="number"
          value={formLocal.parcelas}
          onChange={(e) => atualizar("parcelas", Number(e.target.value))}
        />
        <Input
          name="valorBase"
          label="Valor Base"
          type="text"
          value={formLocal.valorBase}
          onChange={(e) => atualizar("valorBase", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formLocal.porVida}
            onChange={(e) => atualizar("porVida", e.target.checked)}
          />
          Por Vida
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formLocal.recorrente}
            onChange={(e) => atualizar("recorrente", e.target.checked)}
          />
          Recorrente
        </label>
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