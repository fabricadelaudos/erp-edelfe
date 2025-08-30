import { useState, useEffect } from "react";
import type { Unidade } from "../../types/EstruturaEmpresa";
import { Input, SelectInput, TextArea } from "../Inputs";
import ListaContato from "../Listas/ListaContato";
import ListaContratos from "../Listas/ListaContrato";
import { buscarCep } from "../../services/apiEmpresa";

interface Props {
  unidade: Unidade;
  onChange: (novaUnidade: Unidade) => void;
}

export default function FormUnidade({ unidade, onChange }: Props) {
  const [aba, setAba] = useState<'dados' | 'contato' | 'contrato'>('dados');
  const [formLocal, setFormLocal] = useState<Unidade>({ ...unidade });

  useEffect(() => {
    setFormLocal({ ...unidade });
  }, [unidade]);

  const atualizarCampo = (campo: keyof Unidade, valor: any) => {
    setFormLocal((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleSalvar = () => {
    onChange(formLocal);
  };

  const handleCancelar = () => {
    onChange(unidade);
    setFormLocal({ ...unidade });
  };

  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      <div className="w-48 border-r border-gray-300 pr-4">
        <ul className="space-y-2">
          {["dados", "contato", "contrato"].map((abaKey) => (
            <li key={abaKey}>
              <button
                onClick={() => setAba(abaKey as any)}
                className={`w-full text-left px-3 py-2 rounded-md ${aba === abaKey
                  ? "bg-orange-100 text-orange-600 font-semibold"
                  : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                {abaKey.charAt(0).toUpperCase() + abaKey.slice(1)}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Conteúdo da aba */}
      <div className="flex-1 space-y-4">
        {aba === "dados" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input name="nomeFantasia" label="Nome Fantasia" value={formLocal.nomeFantasia} onChange={(e) => atualizarCampo("nomeFantasia", e.target.value)} required />
              <Input name="razaoSocial" label="Razão Social" value={formLocal.razaoSocial} onChange={(e) => atualizarCampo("razaoSocial", e.target.value)} required />
              <SelectInput
                name="tipoDocumento"
                label="Tipo Documento"
                value={formLocal.tipoDocumento}
                onChange={(e) => atualizarCampo("tipoDocumento", e.target.value)}
                options={[
                  { value: "CNPJ", label: "CNPJ" },
                  { value: "CAEPF", label: "CAEPF" },
                ]}
                required
              />
              <Input name="documento" label="Documento" value={formLocal.documento} onChange={(e) => atualizarCampo("documento", e.target.value)} required />
              <Input name="inscricaoEstadual" label="Insc. Estadual" value={formLocal.inscricaoEstadual || ""} onChange={(e) => atualizarCampo("inscricaoEstadual", e.target.value)} required={false} />
              <Input name="cep" label="CEP" value={formLocal.cep} onChange={(e) => atualizarCampo("cep", e.target.value)} required onBlur={async (e) => {
                const dados = await buscarCep(e.target.value);
                if (dados) {
                  atualizarCampo("endereco", dados.logradouro);
                  atualizarCampo("bairro", dados.bairro);
                  atualizarCampo("cidade", dados.localidade);
                  atualizarCampo("uf", dados.uf);
                }
              }} />
              <Input name="endereco" label="Endereço" value={formLocal.endereco} onChange={(e) => atualizarCampo("endereco", e.target.value)} required />
              <Input name="numero" label="Número" value={formLocal.numero} onChange={(e) => atualizarCampo("numero", e.target.value)} required />
              <Input name="complemento" label="Complemento" value={formLocal.complemento || ""} onChange={(e) => atualizarCampo("complemento", e.target.value)} required={false} />
              <Input name="bairro" label="Bairro" value={formLocal.bairro} onChange={(e) => atualizarCampo("bairro", e.target.value)} required />
              <Input name="cidade" label="Cidade" value={formLocal.cidade} onChange={(e) => atualizarCampo("cidade", e.target.value)} required />
              <Input name="uf" label="UF" value={formLocal.uf} onChange={(e) => atualizarCampo("uf", e.target.value)} required />
              <SelectInput
                name="ativo"
                label="Status"
                value={formLocal.ativo ? "ativo" : "inativo"}
                onChange={(e) => atualizarCampo("ativo", e.target.value === "ativo")}
                options={[
                  { value: "ativo", label: "Ativo" },
                  { value: "inativo", label: "Inativo" },
                ]}
              />
            </div>
            <TextArea
              name="observacao"
              label="Observação"
              value={formLocal.observacao || ""}
              onChange={(e) => atualizarCampo("observacao", e.target.value)}
              required={false}
            />
          </div>
        )}

        {aba === "contato" && (
          <ListaContato
            contatos={formLocal.contato ?? []}
            onChange={(novosContatos) => atualizarCampo("contato", novosContatos)}
          />
        )}

        {aba === "contrato" && (
          <ListaContratos
            contratos={formLocal.contratos ?? []}
            onChange={(novosContratos) => atualizarCampo("contratos", novosContratos)}
          />
        )}

        <div className="flex justify-end gap-2 mt-6">
          <button onClick={handleCancelar} className="px-4 py-2 rounded border border-gray-400 text-gray-600 hover:bg-gray-100">
            Cancelar
          </button>
          <button onClick={handleSalvar} className="px-4 py-2 rounded bg-orange-500 hover:bg-orange-600 text-white font-semibold">
            Salvar Unidade
          </button>
        </div>
      </div>
    </div>
  );
}