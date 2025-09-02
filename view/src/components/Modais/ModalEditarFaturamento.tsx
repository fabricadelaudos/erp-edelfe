import { useState, useEffect } from "react";
import type { Faturamento } from "../../types/EstruturaFaturamento";
import ModalBase from "../Modais/ModalBase";

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

  const Input = ({
    campo,
    label,
    type = "text",
    disabled = false,
  }: {
    campo: keyof Faturamento;
    label: string;
    type?: string;
    disabled?: boolean;
  }) => (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        value={String(dados?.[campo] ?? "")}
        onChange={(e) =>
          handleChange(
            campo,
            type === "number" ? Number(e.target.value) : e.target.value
          )
        }
        disabled={!editavel || disabled}
        className={`border rounded px-3 py-2 ${!editavel || disabled ? "bg-gray-100 text-gray-600" : ""
          }`}
      />
    </div>
  );

  return (
    <ModalBase isOpen={aberto} onClose={onClose} titulo="Editar Faturamento">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2">
        <Input campo="idFaturamento" label="ID Faturamento" disabled />
        <Input campo="competencia" label="Competência" disabled />
        <Input campo="valorBase" label="Valor Base" />
        <Input campo="impostoValor" label="Imposto" />
        <Input campo="valorTotal" label="Valor Total" />
        <Input campo="vidas" label="Vidas" type="number" />
        <Input campo="numeroNF" label="Número da NF" />
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700">Status</label>
          <select
            value={dados.status}
            onChange={(e) => handleChange("status", e.target.value)}
            disabled={!editavel}
            className="border rounded px-3 py-2 bg-white"
          >
            <option value="ABERTA">ABERTA</option>
            <option value="PAGA">PAGA</option>
            <option value="ATRASADA">ATRASADA</option>
          </select>
        </div>
      </div>

      {editavel && (
        <div className="mt-6 flex justify-end gap-3 px-2">
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
