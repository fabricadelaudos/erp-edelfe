// src/components/Formularios/FormFornecedor.tsx
import { useState } from "react";
import { Input, SelectInput, TextArea, ToggleInput } from "../Inputs";
import type { Fornecedor } from "../../types/EstruturaDespesa";
import { formatarDocumento, limparFormatacao } from "../Auxiliares/formatter";

interface Props {
  dados: Fornecedor;
  onSalvar: (fornecedor: Fornecedor) => void;
  onCancelar: () => void;
}

export default function FormFornecedor({ dados, onSalvar, onCancelar }: Props) {
  const [form, setForm] = useState<Fornecedor>({ ...dados });

  const handleChange = (campo: keyof Fornecedor, valor: any) => {
    setForm({ ...form, [campo]: valor });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSalvar(form);
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-12 items-center gap-4">
        <div className="col-span-8">
          <Input
            label="Nome"
            name="nome"
            value={form.nome}
            onChange={(e) => handleChange("nome", e.target.value)}
            required
          />
        </div>

        <div className="col-span-3">
          <SelectInput
            label="Tipo de Pessoa"
            name="tipoPessoa"
            value={form.tipoPessoa}
            onChange={(e) =>
              handleChange("tipoPessoa", e.target.value as Fornecedor["tipoPessoa"])
            }
            options={[
              { label: "Cliente", value: "CLIENTE" },
              { label: "Fornecedor", value: "FORNECEDOR" },
              { label: "Cliente e Fornecedor", value: "CLIENTE_FORNECEDOR" },
            ]}
          />
        </div>

        <div className="col-span-1">
          <ToggleInput
            label="Ativo"
            value={form.ativo}
            onChange={(v) => handleChange("ativo", v)}
          />
        </div>
      </div>

      <div className="flex gap-4">
        <SelectInput
          label="Tipo de Documento"
          name="tipoDocumento"
          value={form.tipoDocumento}
          onChange={(e) =>
            handleChange("tipoDocumento", e.target.value as Fornecedor["tipoDocumento"])
          }
          options={[
            { label: "CNPJ", value: "CNPJ" },
            { label: "CAEPF", value: "CAEPF" },
            { label: "CPF", value: "CPF" },
          ]}
        />

        <Input
          label="Documento"
          name="documento"
          value={formatarDocumento(form.documento, form.tipoDocumento)}
          onChange={(e) => handleChange("documento", limparFormatacao(e.target.value))}
          required
        />
      </div>

      <TextArea
        label="Observação"
        name="observacao"
        value={form.observacao || ""}
        onChange={(e) => handleChange("observacao", e.target.value)}
        required={false}
      />

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancelar}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Salvar
        </button>
      </div>
    </form>
  );
}