import { useEffect, useState } from "react";
import { buscarBancos, buscarFornecedores, buscarPlanoContas, criarContaPagar, editarContaPagar, editarParcelaContaPagar } from "../../services/apiDespesa";

import { GroupedSelect, Input, TextArea } from "../Inputs";
import { ToggleInput } from "../Inputs";
import { SearchableSelect } from "../Inputs";

import type { Fornecedor, Banco, PlanoContaCategoria, ContaPagar, ParcelaContaPagar, ParcelaComConta } from "../../types/EstruturaDespesa";
import { formatarDocumento } from "../Auxiliares/formatter";
import toast from "react-hot-toast";

interface FormDespesaProps {
  contaPagar?: ContaPagar | null;
  parcela?: ParcelaComConta | null;
  onClose: () => void;
}

export default function FormDespesa({ contaPagar, parcela, onClose }: FormDespesaProps) {
  const [form, setForm] = useState<Partial<ContaPagar & ParcelaContaPagar>>({});

  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [planos, setPlanos] = useState<PlanoContaCategoria[]>([]);
  const [bancos, setBancos] = useState<Banco[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    Promise.all([
      buscarFornecedores().then((res) => setFornecedores(res.filter(f => f.ativo))),
      buscarBancos().then((res) => setBancos(res.filter(b => b.ativo))),
      buscarPlanoContas().then((res) => setPlanos(res.filter(p => p.ativo))),
    ])
      .catch(() => {
        toast.error("Erro ao carregar dados iniciais");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (contaPagar && parcela) {
      setForm({
        ...contaPagar,
        dataEmissao: contaPagar.dataEmissao.split("T")[0],
        valor: parcela.valor.toString(),
        vencimento: parcela.vencimento.split("T")[0],
      });
    } else {
      setForm({
        dataEmissao: new Date().toISOString().split("T")[0],
        parcelas: 1,
        intervalo: 30,
        recorrente: false,
      });
    }
  }, [contaPagar, parcela]);

  const handleChange = (campo: string, valor: any) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (contaPagar && parcela) {
        await editarContaPagar(contaPagar.idContaPagar, {
          descricao: form.descricao,
        });

        await editarParcelaContaPagar(parcela.idParcela, {
          valor: parseFloat(form.valor as string),
          vencimento: new Date(form.vencimento as string),
        });

        toast.success("Despesa atualizada com sucesso!");
      } else {
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
          fkPlanoContaSubCategoriaId: form.planocontasubcategoria?.idPlanoContaSubCategoria,
          fkBancoId: form.banco?.idBanco,
        };

        await criarContaPagar(payload);
        toast.success("Despesa criada com sucesso!");
      }
      onClose();
    } catch (error) {
      toast.error("Erro ao salvar despesa");
      console.error(error);
    } finally {
      setLoading(false);
    }
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
          disable={!!parcela}
        />

        <Input
          name="numeroDocumento *"
          label="Número do Documento"
          value={form.numeroDocumento}
          onChange={(e) => handleChange("numeroDocumento", e.target.value)}
          disable={!!parcela}
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
          disabled={!!parcela}
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
          disabled={!!parcela}
        />

        <GroupedSelect
          label="Plano de Contas *"
          value={String(form.planocontasubcategoria?.idPlanoContaSubCategoria ?? "")}
          onChange={(v) => {
            const id = Number(v);

            const subSelecionada = planos
              .flatMap((c) => c.planocontasubcategoria ?? [])
              .find((s) => Number(s.idPlanoContaSubCategoria) === id);

            handleChange("planocontasubcategoria", subSelecionada || null);
          }}
          groups={planos.map((cat) => ({
            label: `${cat.idPlanoContaCategoria} - ${cat.nome}`,
            options: (cat.planocontasubcategoria ?? []).map((sub) => ({
              label: `${sub.idPlanoContaSubCategoria} - ${sub.nome}`,
              value: String(sub.idPlanoContaSubCategoria ?? ""),
            })),
          }))}
          loading={loading}
          disabled={!!parcela}
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
          disabled={!!parcela}
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
        {parcela ? (
          <>
            <Input
              name="valor"
              label="Valor da Parcela"
              type="number"
              value={form.valor ?? ""}
              onChange={(e) => handleChange("valor", e.target.value)}
              step={0.01}
            />

            <Input
              name="vencimento"
              label="Vencimento da Parcela"
              type="date"
              value={form.vencimento ?? ""}
              onChange={(e) => handleChange("vencimento", e.target.value)}
            />
          </>
        ) : (
          <>
            <Input
              name="valorTotal"
              label="Valor Total"
              type="number"
              value={form.valorTotal ?? ""}
              onChange={(e) => handleChange("valorTotal", e.target.value)}
              step={0.01}
            />

            <Input
              name="vencimento"
              label="Vencimento"
              type="date"
              value={form.vencimento ?? ""}
              onChange={(e) => handleChange("vencimento", e.target.value)}
            />
          </>
        )}

        <Input
          name="parcelas"
          label="Parcelas"
          type="number"
          value={form.parcelas}
          onChange={(e) => handleChange("parcelas", e.target.value)}
          disable={!!parcela}
        />

        <Input
          name="intervalo"
          label="Intervalo (dias entre parcelas)"
          type="number"
          value={form.intervalo}
          onChange={(e) => handleChange("intervalo", e.target.value)}
          disable={!!parcela}
        />

        <ToggleInput
          label="Recorrente"
          value={form.recorrente ?? false}
          onChange={(val) => handleChange("recorrente", val)}
          disabled={!!parcela}
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