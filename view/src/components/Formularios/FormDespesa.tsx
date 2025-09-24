import { useEffect, useState } from "react";
import { buscarBancos, buscarFornecedores, buscarPlanoContas, criarContaPagar } from "../../services/apiDespesa";

import { GroupedSelect, Input, TextArea } from "../Inputs";
import { ToggleInput } from "../Inputs";
import { SearchableSelect } from "../Inputs";

import type { Fornecedor, Banco, PlanoContaCategoria, ContaPagar } from "../../types/EstruturaDespesa";
import { formatarDocumento } from "../Auxiliares/formatter";
import toast from "react-hot-toast";

export default function FormDespesa({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState<Partial<ContaPagar>>({
    dataEmissao: new Date().toISOString().split("T")[0],
    parcelas: 1,
    intervalo: 30,
    recorrente: false,
  });

  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [planos, setPlanos] = useState<PlanoContaCategoria[]>([]);
  const [bancos, setBancos] = useState<Banco[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    Promise.all([
      buscarFornecedores().then(setFornecedores),
      buscarBancos().then(setBancos),
      buscarPlanoContas().then(setPlanos),
    ])
      .catch(() => {
        toast.error("Erro ao carregar dados iniciais");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleChange = (campo: string, valor: any) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    const payload = {
      numeroDocumento: form.numeroDocumento,
      descricao: form.descricao,
      tipoDocumentoConta: form.tipoDocumentoConta,
      valorTotal: Number(form.valorTotal),
      dataEmissao: new Date(form.dataEmissao ?? new Date().toISOString().split("T")[0]),
      vencimento: new Date(form.vencimento ?? ""),
      parcelas: Number(form.parcelas),
      intervalo: Number(form.intervalo),
      recorrente: Boolean(form.recorrente),
      fkFornecedorId: form.fornecedor?.idFornecedor,
      fkPlanoContaSubCategoriaId: form.planoConta?.idPlanoContaSubCategoria,
      fkBancoId: form.banco?.idBanco,
    };

    if (!form.dataEmissao || !form.numeroDocumento || !form.tipoDocumentoConta || !form.fornecedor || !form.planoConta || !form.banco || !form.valorTotal || !form.vencimento) {
      toast.error("Preencha todos os campos obrigatórios.");
    }

    await criarContaPagar(payload);
    setLoading(false);

    onClose();
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Grupo 1 */}
      <div className="grid grid-cols-3 gap-4">
        <Input
          name="dataEmissao"
          label="Data de Emissão"
          type="date"
          value={form.dataEmissao}
          onChange={(e) => handleChange("dataEmissao", e.target.value)}
        />

        <Input
          name="numeroDocumento *"
          label="Número do Documento"
          value={form.numeroDocumento}
          onChange={(e) => handleChange("numeroDocumento", e.target.value)}
        />

        <SearchableSelect
          label="Fornecedor *"
          value={form.fornecedor?.idFornecedor ?? ""}
          onChange={(v) => {
            const fornecedor = fornecedores.find((f) => f.idFornecedor === v);
            handleChange("fornecedor", fornecedor);
          }}
          options={fornecedores.map((f) => ({
            label: `${f.nome} - ${formatarDocumento(f.documento, f.tipoDocumento)}`,
            value: f.idFornecedor,
          }))}
          loading={loading}
        />
      </div>

      {/* Grupo 2 */}
      <div className="grid grid-cols-3 gap-4">
        <SearchableSelect
          label="Tipo Documento *"
          value={form.tipoDocumentoConta ?? ""}
          onChange={(v) => handleChange("tipoDocumentoConta", v)}
          options={[
            { label: "BOLETO", value: "BOLETO" },
            { label: "DÉBITO AUTOMÁTICO", value: "DEBITO" },
            { label: "FATURA", value: "FATURA" },
            { label: "NOTA FISCAL", value: "NF" },
            { label: "PIX", value: "PIX" },
          ]}
        />

        <GroupedSelect
          label="Plano de Contas *"
          value={form.planoConta?.idPlanoContaSubCategoria ?? ""}
          onChange={(v) => {
            const subSelecionada = planos
              .flatMap((c) => c.subcategorias ?? [])
              .find((s) => s.idPlanoContaSubCategoria === v);
            handleChange("planoConta", subSelecionada || null);
          }}
          groups={planos.map((cat) => ({
            // mostra id + nome da categoria
            label: `${cat.idPlanoContaCategoria} - ${cat.nome}`,
            options: (cat.subcategorias ?? []).map((sub) => ({
              // mostra id + nome da subcategoria
              label: `${sub.idPlanoContaSubCategoria} - ${sub.nome}`,
              value: sub.idPlanoContaSubCategoria,
            })),
          }))}
          loading={loading}
        />

        <SearchableSelect
          label="Banco *"
          value={form.banco?.idBanco ?? ""}
          onChange={(v) => {
            const bancoSelecionado = bancos.find(b => b.idBanco === v);
            handleChange("banco", bancoSelecionado || null);
          }}
          options={bancos.map((b) => ({
            label: b.nome,
            value: b.idBanco,
          }))}
          loading={loading}
        />
      </div>

      {/* Grupo 3 */}
      <div>
        <TextArea
          name="descricao"
          label="Descrição"
          value={form.descricao ?? ""}
          onChange={(e) => handleChange("descricao", e.target.value)}
          required={false}
        />
      </div>

      {/* Grupo 4 */}
      <div className="grid grid-cols-5 gap-4">
        <Input
          name="valorTotal"
          label="Valor Total"
          type="number"
          value={form.valorTotal}
          onChange={(e) => handleChange("valorTotal", e.target.value)}
          step={0.01}
        />

        <Input
          name="parcelas"
          label="Parcelas"
          type="number"
          value={form.parcelas}
          onChange={(e) => handleChange("parcelas", e.target.value)}
        />

        <Input
          name="vencimento"
          label="Vencimento"
          type="date"
          value={form.vencimento}
          onChange={(e) => handleChange("vencimento", e.target.value)}
        />

        <Input
          name="intervalo"
          label="Intervalo (dias entre parcelas)"
          type="number"
          value={form.intervalo}
          onChange={(e) => handleChange("intervalo", e.target.value)}
        />

        <ToggleInput
          label="Recorrente"
          value={form.recorrente ?? false}
          onChange={(val) => handleChange("recorrente", val)}
        />
      </div>

      {/* Botão de envio */}
      <div className="flex justify-end pt-4">
        <button
          disabled={loading}
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
}