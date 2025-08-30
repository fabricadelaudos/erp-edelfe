import { useEffect, useState } from "react";
import type { Empresa, Unidade } from "../../types/EstruturaEmpresa";
import { editarEmpresa, salvarEmpresa } from "../../services/apiEmpresa";
import FormUnidade from "./FormUnidades";
import { Input, SelectInput } from "../Inputs";
import toast from "react-hot-toast";
import ListaUnidade from "../Listas/ListaUnidade";

interface Props {
  aoSalvar: () => void;
  initialData?: Empresa;
  empresaSelecionada?: Empresa;
}

export default function FormEmpresa({ aoSalvar, empresaSelecionada }: Props) {
  const [aba, setAba] = useState<"dados" | "unidades">("dados");
  const [form, setForm] = useState<Empresa>(
    empresaSelecionada ?? {
      idEmpresa: 0,
      nome: "",
      ativo: true,
      unidades: [],
    });
  const [salvando, setSalvando] = useState(false);
  const [modoEdicaoUnidade, setModoEdicaoUnidade] = useState<null | number>(null);

  useEffect(() => {
    if (empresaSelecionada) {
      setForm(empresaSelecionada);
    }
  }, [empresaSelecionada]);

  const salvar = async () => {
    if (!form.nome.trim()) {
      console.error("O nome da empresa é obrigatório.");
      return;
    }

    setSalvando(true);
    try {
      if (empresaSelecionada?.idEmpresa) {
        await editarEmpresa(empresaSelecionada.idEmpresa, form);
      } else {
        await salvarEmpresa(form);
      }
      aoSalvar();
    } catch (e) {
      toast.error("Erro ao salvar empresa.");
      console.error("Erro ao salvar empresa.");
    } finally {
      setSalvando(false);
    }
  };

  const handleUnidadeChange = (index: number, novaUnidade: Unidade) => {
    const unidadesAtualizadas = [...(form.unidades || [])];
    unidadesAtualizadas[index] = novaUnidade;
    setForm({ ...form, unidades: unidadesAtualizadas });
  };

  const salvarUnidade = (index: number, unidadeAtualizada: Unidade) => {
    const novasUnidades = [...(form.unidades || [])];
    novasUnidades[index] = unidadeAtualizada;
    setForm({ ...form, unidades: novasUnidades });
    setModoEdicaoUnidade(null); // volta para lista
  };

  const cancelarUnidade = () => {
    // Se era nova e cancelou, remove
    if (modoEdicaoUnidade !== null && form.unidades?.[modoEdicaoUnidade]?.idUnidade === 0) {
      const novasUnidades = [...form.unidades];
      novasUnidades.splice(modoEdicaoUnidade, 1);
      setForm({ ...form, unidades: novasUnidades });
    }
    setModoEdicaoUnidade(null); // volta para lista
  };


  const adicionarUnidade = () => {
    const novaUnidade: Unidade = {
      idUnidade: 0,
      fkEmpresaId: form.idEmpresa || 0,
      nomeFantasia: "",
      razaoSocial: "",
      tipoDocumento: "CNPJ",
      documento: "",
      inscricaoEstadual: "",
      endereco: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      uf: "",
      cep: "",
      ativo: true,
      observacao: "",
      contato: [],
      contratos: [],
    };

    setForm({
      ...form,
      unidades: [...(form.unidades || []), novaUnidade],
    });

    setModoEdicaoUnidade((form.unidades?.length ?? 0));
  };

  return (
    <div>
      <div className="flex border-b border-gray-300 mb-4">
        <button
          onClick={() => setAba("dados")}
          disabled={modoEdicaoUnidade !== null}
          className={`px-4 py-2 disabled:cursor-not-allowed ${aba === "dados" ? "border-b-2 border-orange-400 text-orange-400 font-bold" : "text-gray-500 hover:text-gray-800"}`}
        >
          Dados
        </button>
        <button
          onClick={() => setAba("unidades")}
          className={`px-4 py-2 ${aba === "unidades" ? "border-b-2 border-orange-400 text-orange-400 font-bold" : "text-gray-500 hover:text-gray-800"}`}
        >
          Unidades ({form.unidades?.length || 0})
        </button>
      </div>

      {aba === "dados" && (
        <div className="flex items-end gap-4">
          <div className="w-full">
            <Input
              label="Nome da Empresa"
              name="nome"
              placeholder="Nome da empresa"
              type="text"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              required
            />
          </div>

          <div className="w-[200px]">
            <SelectInput
              name="status"
              label="Status"
              value={form.ativo ? "ativo" : "inativo"}
              onChange={(e) => setForm({ ...form, ativo: e.target.value === "ativo" })}
              options={[
                { value: "ativo", label: "Ativo" },
                { value: "inativo", label: "Inativo" },
              ]}
              required
            />
          </div>
        </div>

      )}

      {aba === "unidades" && (
        <div className="space-y-4">
          {modoEdicaoUnidade !== null && form.unidades?.[modoEdicaoUnidade] ? (
            <div>
              <FormUnidade
                unidade={form.unidades?.[modoEdicaoUnidade]}
                onChange={(novaUnidade) => salvarUnidade(modoEdicaoUnidade, novaUnidade)}
              />
            </div>
          ) : (
            <>
              <div className="mt-4 w-full flex justify-end">
                <button
                  onClick={adicionarUnidade}
                  className="text-sm bg-orange-400 px-4 py-2 rounded hover:bg-orange-500 text-white"
                >
                  + Adicionar Unidade
                </button>
              </div>

              {form.unidades?.length === 0 && (
                <p className="text-sm text-gray-500">Nenhuma unidade cadastrada.</p>
              )}

              <ListaUnidade
                unidades={form.unidades || []}
                onEditar={(index) => setModoEdicaoUnidade(index)}
              />
            </>
          )}
        </div>
      )}

      {modoEdicaoUnidade === null && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={salvar}
            disabled={salvando}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      )}
    </div>
  );
}