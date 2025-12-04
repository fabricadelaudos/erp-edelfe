import { useEffect, useState } from "react";
import type { FaturamentoOuProjecao } from "../../types/EstruturaFaturamento";
import ModalBase from "../Modais/ModalBase";
import { formatarDocumento, formatarReais, formatarTelefone } from "../Auxiliares/formatter";
import Copiavel from "../Auxiliares/Copiavel";
import { Input, SelectInput } from "../Inputs";

interface Props {
  aberto: boolean;
  onClose: () => void;
  faturamento: FaturamentoOuProjecao | null;
  onSalvar: (f: FaturamentoOuProjecao) => void;
  editavel?: boolean;
}

export default function ModalEditarFaturamento({
  aberto,
  onClose,
  faturamento,
  onSalvar,
  editavel = true,
}: Props) {
  const [dados, setDados] = useState<FaturamentoOuProjecao | null>(null);

  useEffect(() => {
    if (!faturamento) return;

    const isProjecao = faturamento.tipo === "PROJECAO";
    const valorBase = Number(faturamento?.contrato?.valorBase ?? 0);
    const vidas = Number(faturamento.vidas ?? faturamento.vidas ?? 0);

    const valorCalculado = isProjecao && faturamento.contrato?.porVida ? valorBase * vidas : faturamento.valorPrevisto;

    setDados({
      ...faturamento,
      valorPrevisto: valorCalculado,
      vidas: vidas,
    });
  }, [faturamento]);

  if (!dados) return null;

  const handleChange = (campo: keyof FaturamentoOuProjecao, valor: any) => {
    setDados((prev) => {
      if (!prev) return null;

      const atualizado = { ...prev, [campo]: valor };

      // Se for projeção e vidas forem alteradas
      if (prev.tipo === "PROJECAO" && campo === "vidas") {
        const base = Number(prev.contrato?.valorBase ?? 0);
        const vidas = Number(valor);
        const calculado = base * vidas;

        atualizado.valorPrevisto = calculado;
      }

      // Se for faturamento e vidas forem alteradas
      if (prev.tipo === "FATURAMENTO" && campo === "vidas" && prev.contrato?.porVida) {

        const valorPorVida = Number(prev.contrato?.valorBase ?? 0);
        const vidas = Number(valor);

        // novo valor base calculado
        const novoValorBase = valorPorVida * vidas;

        // imposto existente no registro
        const impostoPercent = Number(prev.impostoPorcentagem ?? 0);

        // calcular imposto em R$
        const novoImpostoValor = (novoValorBase * impostoPercent) / 100;

        // calcular valor total
        const novoValorTotal = novoValorBase + novoImpostoValor;

        atualizado.valorBase = novoValorBase;
        atualizado.impostoValor = novoImpostoValor;
        atualizado.valorTotal = novoValorTotal;
      }

      return atualizado;
    });
  };

  const salvar = () => {
    if (dados) {
      onSalvar(dados);
      onClose();
    }
  };

  const isProjecao = dados.tipo === "PROJECAO";
  const isFaturamento = dados.tipo === "FATURAMENTO";

  const opcoesStatus = isProjecao
    ? [
      { label: "PENDENTE", value: "PENDENTE" },
      { label: "FATURADO", value: "FATURADO" },
    ]
    : [
      { label: "ABERTA", value: "ABERTA" },
      { label: "PAGA", value: "PAGA" },
      { label: "ATRASADA", value: "ATRASADA" },
    ];

  return (
    <ModalBase
      isOpen={aberto}
      onClose={onClose}
      titulo={isProjecao ? "Detalhes da Projeção" : "Detalhes do Faturamento"}
    >
      <div className="flex flex-col gap-6 p-4 text-sm">
        {isProjecao && (
          <>
            <div className="grid grid-cols-4 gap-4">
              {/* Empresa */}
              <div>
                <label className="font-medium text-gray-600 mb-1 block">Empresa</label>
                <Copiavel valor={dados.empresa ?? "—"} />
              </div>

              {/* Unidade */}
              <div>
                <label className="font-medium text-gray-600 mb-1 block">Unidade</label>
                <Copiavel valor={dados.unidade ?? "—"} />
              </div>

              {/* CNPJ */}
              <div>
                <label className="font-medium text-gray-600 mb-1 block">CNPJ</label>
                <Copiavel valor={formatarDocumento(dados.cnpj ?? "", "CNPJ")} />
              </div>

              {/* e-Social/Laudos */}
              <div className="space-y-1">
                <label className="font-medium text-gray-600">eSocial / Laudos</label>
                <div className="flex flex-wrap gap-2 text-xs">
                  {dados.esocial && <span>📑 eSocial</span>}
                  {dados.laudos && <span>📋 Laudos</span>}
                  {!dados.esocial && !dados.laudos && <span>—</span>}
                </div>
              </div>

              <SelectInput
                name="status"
                label="Status"
                value={dados.status}
                onChange={(e) => handleChange("status", e.target.value)}
                options={opcoesStatus}
                disable={!editavel}
                className={`border border-gray-300 text-sm rounded-md block w-full p-2.5 focus:border-2 focus:border-blue-500 focus:outline-none bg-white 
              ${dados.status === "PAGA"
                    ? "text-green-600 font-semibold"
                    : dados.status === "ATRASADA"
                      ? "text-red-600 font-semibold"
                      : dados.status === "ABERTA"
                        ? "text-yellow-600 font-semibold"
                        : "text-gray-600"
                  }`}
              />

              {/* Vidas */}
              {dados.contrato?.porVida && (
                <>
                  <div>
                    <Input
                      name="vidas"
                      label="Vidas Ativas"
                      type="number"
                      value={dados.vidas ?? ""}
                      onChange={(e) =>
                        handleChange("vidas", Number(e.target.value))
                      }
                      disable={!editavel}
                    />
                  </div>
                </>
              )}

              <div>
                <label className="font-medium text-gray-600 mb-1 block">Valor Previsto</label>
                <Copiavel valor={formatarReais(dados.valorPrevisto?.toString()) ?? "—"} />
              </div>

            </div>
          </>
        )}

        {isFaturamento && (
          <>
            {/* Linha 1 */}
            <div className="grid grid-cols-5 gap-4">
              {/* Fatrurado por */}
              <div className="space-y-1">
                <label className="font-medium text-gray-600">Faturado por</label>
                <div>{dados.faturadoPor ?? "—"}</div>
              </div>

              {/* Modalidade */}
              <div className="space-y-1">
                <label className="font-medium text-gray-600">Modalidade</label>
                <div className="flex flex-wrap gap-2 text-xs">
                  {!dados.contrato?.porVida && dados.contrato?.recorrente && <span>🔁 Recorrente</span>}
                  {dados.contrato?.porVida && <span>🧍‍♂️ Por Vida</span>}
                  {!dados.contrato?.porVida && dados.contrato?.parcelas && <span>📅 {dados.contrato.parcelas} Parcelas</span>}
                </div>
              </div>

              {/* Empresa */}
              <div>
                <label className="font-medium text-gray-600 mb-1 block">Empresa</label>
                <Copiavel valor={dados.empresa ?? "—"} />
              </div>

              {/* Unidade */}
              <div>
                <label className="font-medium text-gray-600 mb-1 block">Unidade</label>
                <Copiavel valor={dados.unidade ?? "—"} />
              </div>

              {/* CNPJ */}
              <div>
                <label className="font-medium text-gray-600 mb-1 block">CNPJ</label>
                <Copiavel valor={formatarDocumento(dados.cnpj ?? "", "CNPJ")} />
              </div>
            </div>

            {/* Linha 2 */}
            <div className={`grid gap-4 ${dados.contrato?.porVida ? 'grid-cols-7' : 'grid-cols-6'}`}>
              <SelectInput
                name="status"
                label="Status"
                value={dados.status}
                onChange={(e) => handleChange("status", e.target.value)}
                options={opcoesStatus}
                disable={!editavel}
                className={`border border-gray-300 text-sm rounded-md block w-full p-2.5 focus:border-2 focus:border-blue-500 focus:outline-none bg-white 
              ${dados.status === "PAGA"
                    ? "text-green-600 font-semibold"
                    : dados.status === "ATRASADA"
                      ? "text-red-600 font-semibold"
                      : dados.status === "ABERTA"
                        ? "text-yellow-600 font-semibold"
                        : "text-gray-600"
                  }`}
              />

              <Input
                name="numeroNota"
                label="Número da Nota"
                value={dados.numeroNota?.toString() ?? ""}
                onChange={(e) => handleChange("numeroNota", e.target.value)}
                disable={!editavel}
              />

              {dados.contrato?.porVida && (
                <>
                  <Input
                    name="vidas"
                    label="Vidas"
                    type="number"
                    value={dados.vidas?.toString() ?? ""}
                    onChange={(e) => handleChange("vidas", Number(e.target.value))}
                    disable={!editavel}
                  />

                  <div>
                    <label className="font-medium text-gray-600 mb-1 block">Valor Vida</label>
                    <p>{formatarReais(dados.contrato?.valorBase?.toString())}</p>
                  </div>
                </>
              )}

              <div>
                <label className="font-medium text-gray-600 mb-1 block">Valor Base</label>
                <Copiavel valor={formatarReais(dados.valorBase?.toString()) ?? "—"} />
              </div>

              <div>
                <label className="font-medium text-gray-600 mb-1 block">Imposto (%)</label>
                <Copiavel
                  valor={`${dados.impostoPorcentagem?.toString() ?? "—"}%`}
                />
              </div>

              <div>
                <label className="font-medium text-gray-600 mb-1 block">Imposto (R$)</label>
                <Copiavel valor={formatarReais(dados.impostoValor?.toString()) ?? "—"} />
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="font-medium text-gray-600 mb-1 block">Contato</label>
                <div className="space-y-2">
                  {(dados.contatos ?? []).map((contato, i) => (
                    <div key={i} className="border border-orange-300 rounded p-2 bg-orange-50 space-y-1">
                      {contato.nome && <Copiavel valor={contato.nome} />}
                      <div className="flex items-center gap-1 justify-between">
                        {contato.email && (
                          <div className="flex items-center gap-1">
                            <span className="text-gray-400 text-xs">Email: </span>
                            <Copiavel valor={contato.email} />
                          </div>
                        )}
                        {contato.emailSecundario && (
                          <div className="flex items-center gap-1">
                            <span className="text-gray-400 text-xs">Email Secundário: </span>
                            <Copiavel valor={contato.emailSecundario} />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 justify-between">
                        {contato.telefoneWpp && (
                          <div className="flex items-center gap-1">
                            <span className="text-gray-400 text-xs">WhatsApp: </span>
                            <Copiavel valor={formatarTelefone(contato.telefoneWpp, "WPP")} />
                          </div>
                        )}
                        {contato.telefoneFixo && (
                          <div className="flex items-center gap-1">
                            <span className="text-gray-400 text-xs">Fixo: </span>
                            <Copiavel valor={formatarTelefone(contato.telefoneFixo, "FIXO")} />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-medium text-gray-600 mb-1 block">Endereço</label>
                <div className="bg-blue-50 border border-blue-400 p-2 rounded">
                  <Copiavel
                    valor={`${dados.endereco}, ${dados.numero} - ${dados.bairro}, ${dados.cidade}/${dados.uf} - CEP: ${dados.cep}`}
                  />
                </div>
              </div>

            </div>
          </>
        )}
      </div>

      {editavel && (
        <div className="mt-6 flex justify-end gap-3 px-4">
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
      )
      }
    </ModalBase >
  );
}
