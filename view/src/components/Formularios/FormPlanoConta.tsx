import { useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { Input, ToggleInput } from "../Inputs";
import type { PlanoContaCategoria, PlanoContaSubCategoria } from "../../types/EstruturaDespesa";

interface Props {
  dados: PlanoContaCategoria;
  onSalvar: (plano: PlanoContaCategoria) => void;
  onCancelar: () => void;
}

export default function FormPlanoConta({ dados, onSalvar, onCancelar }: Props) {
  const [form, setForm] = useState<PlanoContaCategoria>({ ...dados });

  const handleChange = (campo: keyof PlanoContaCategoria, valor: any) => {
    setForm({ ...form, [campo]: valor });
  };

  const adicionarSubcategoria = () => {
    setForm({
      ...form,
      subcategorias: [
        ...form.subcategorias,
        {
          idPlanoContaSubCategoria: 0,
          nome: "",
          ativo: true,
          categoria: form,
        },
      ],
    });
  };

  const atualizarSubcategoria = (
    i: number,
    campo: keyof PlanoContaSubCategoria,
    valor: any
  ) => {
    const subs = [...form.subcategorias];
    if (campo === "nome") {
      subs[i].nome = valor;
    } else if (campo === "categoria") {
      subs[i].categoria = valor;
    }
    setForm({ ...form, subcategorias: subs });
  };

  const removerSubcategoria = (i: number) => {
    setForm({
      ...form,
      subcategorias: form.subcategorias.filter((_, idx) => idx !== i),
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSalvar(form);
      }}
      className="space-y-6"
    >
      <div className="flex items-center gap-6">
        {/* Campo Nome */}
        <Input
          label="Nome da Categoria"
          name="nome"
          value={form.nome}
          onChange={(e) => handleChange("nome", e.target.value)}
          required
        />

        {/* Campo Ativo */}
        <ToggleInput
          label="Ativo"
          value={dados.ativo}
          onChange={(val) => setForm({ ...dados, ativo: val })}
        />
      </div>

      {/* Subcategorias */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm text-gray-800">Subcategorias</h3>
          <button
            type="button"
            onClick={adicionarSubcategoria}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
          >
            <Plus size={16} /> Adicionar Subcategoria
          </button>
        </div>

        {form.subcategorias.length === 0 && (
          <p className="text-sm text-gray-500 italic">Nenhuma subcategoria adicionada.</p>
        )}

        <div className="space-y-2">
          {form.subcategorias.map((sub, i) => (
            <div
              key={i}
              className="flex items-center gap-2 bg-gray-50 border border-gray-300 rounded p-2"
            >
              <span className="text-sm text-gray-500">{i + 1}.</span>
              <Input
                label="Nome da Subcategoria"
                name={`sub-${i}`}
                value={sub.nome}
                placeholder="Nome da Subcategoria"
                onChange={(e) => atualizarSubcategoria(i, "nome", e.target.value)}
              />
              {!sub.idPlanoContaSubCategoria && (
                <button
                  type="button"
                  onClick={() => removerSubcategoria(i)}
                  className="p-1 text-red-600 hover:text-red-800"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Ações */}
      <div className="flex justify-end gap-2 mt-4">
        <button
          type="button"
          onClick={onCancelar}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
        >
          Salvar
        </button>
      </div>
    </form>
  );
}