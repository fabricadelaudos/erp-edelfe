interface MesValor {
  mes: string;
  valor: number;
}

interface LinhaStatus {
  status: string;
  valores: MesValor[];
}

interface Props {
  dados: LinhaStatus[];
}

export default function TabelaProjecao({ dados }: Props) {
  const formatar = (valor?: number) =>
    (valor ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const mesesHeader = dados[0]?.valores.map((v) => v.mes) ?? [];

  const bgPorStatus: Record<string, string> = {
    "Recebido": "text-green-500",
    "A Vencer": "text-yellow-500",
    "Atrasado": "text-red-500",
  };

  return (
    <div className="overflow-x-auto border border-gray-300 rounded">
      <table className="min-w-full text-xs text-center">
        <thead className="bg-gray-100 border-b border-gray-300 text-gray-700">
          <tr>
            <th className="p-2 font-medium">Status</th>
            {mesesHeader.map((mes) => (
              <th key={mes} className="p-2 font-medium">
                {mes}
              </th>
            ))}
            <th className="p-2 font-medium">Total Ano</th>
          </tr>
        </thead>
        <tbody>
          {dados.map((linha) => (
            <tr key={linha.status} className={``} >
              <td className={`p-2 border border-gray-200 font-semibold ${bgPorStatus[linha.status]}`}>
                {linha.status}
              </td>
              {linha.valores.map((v) => (
                <td
                  key={v.mes}
                  className="p-2 border border-gray-200 tabular-nums"
                  title={formatar(v.valor)}
                >
                  {formatar(v.valor)}
                </td>
              ))}
              <td className={`p-2 border border-gray-200 font-bold ${bgPorStatus[linha.status]}`}>
                {formatar(linha.valores.reduce((acc, m) => acc + m.valor, 0))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}