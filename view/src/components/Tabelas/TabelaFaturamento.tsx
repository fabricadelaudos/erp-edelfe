import type { Faturamento } from "../../types/EstruturaFaturamento";

interface Props {
  faturamentos: Faturamento[];
  atualizarCampo: (index: number, campo: keyof Faturamento, valor: any) => void;
}

export default function TabelaFaturamento({ faturamentos, atualizarCampo }: Props) {
  return (
    <div className="mt-4 w-full">
      <table className="w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-100 text-sm border-b border-gray-300">
            <th className="p-2">Contrato</th>
            <th className="p-2">Valor Base</th>
            <th className="p-2">Imposto</th>
            <th className="p-2">Valor Total</th>
            <th className="p-2">Vidas</th>
            <th className="p-2">NF</th>
            <th className="p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {faturamentos.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center text-gray-500 italic py-6">
                Nenhum faturamento encontrado para a competência selecionada.
              </td>
            </tr>
          ) : (
            faturamentos.map((f, idx) => (
              <tr key={idx} className="text-sm">
                <td>{f.fkContratoId}</td>
                <td>
                  {Number(f.valorBase).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </td>
                <td>
                  {Number(f.impostoValor).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </td>
                <td>
                  <input
                    type="text"
                    value={f.valorTotal}
                    onChange={(e) => atualizarCampo(idx, "valorTotal", e.target.value)}
                    className="border p-1 w-full"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={f.vidas ?? ""}
                    onChange={(e) => atualizarCampo(idx, "vidas", Number(e.target.value))}
                    className="border p-1 w-full"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={f.numeroNF ?? ""}
                    onChange={(e) => atualizarCampo(idx, "numeroNF", e.target.value)}
                    className="border p-1 w-full"
                  />
                </td>
                <td>
                  <select
                    value={f.status}
                    onChange={(e) => atualizarCampo(idx, "status", e.target.value)}
                    className="border p-1"
                  >
                    <option value="ABERTA">ABERTA</option>
                    <option value="PAGA">PAGA</option>
                  </select>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}