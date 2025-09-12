
interface MesValor {
  mes: string;
  valor: number;
}

interface ProjecaoUnidade {
  unidade: string;
  meses: MesValor[];
}

interface Props {
  dados: ProjecaoUnidade[];
}

export default function TabelaProjecaoPorUnidade({ dados }: Props) {
  const formatar = (valor?: number) =>
    (valor ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  // pegar header de meses a partir da primeira unidade
  const mesesHeader = dados[0]?.meses.map((m) => m.mes) ?? [];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Unidade</th>
            {mesesHeader.map((mes) => (
              <th key={mes} className="p-2 border text-center">
                {mes}
              </th>
            ))}
            <th className="p-2 border">Total Ano</th>
          </tr>
        </thead>
      </table>
    </div>
  );
}
