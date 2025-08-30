import { FileText, Pencil, Trash2 } from "lucide-react";
import { formatarEndereco } from "../Auxiliares/formatter";

interface ListaUnidadesProps {
  unidades: any[];
  onEditar?: (index: number) => void;
  onRemover?: (index: number) => void;
}

export default function ListaUnidade({ unidades, onEditar, onRemover }: ListaUnidadesProps) {
  if (!unidades || unidades.length === 0) {
    return <p className="text-sm text-gray-500">Nenhuma unidade cadastrada.</p>;
  }

  return (
    <div className="space-y-2">
      {unidades.map((unidade, index) => (
        <div key={index} className="border border-gray-300 rounded p-3">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-gray-800 text-lg">{unidade.nomeFantasia || "Unidade sem nome"}</p>
              <div className="flex gap-1 items-center">
                {/* Quantitade de contratos */}
                {unidade.contratos?.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-green-100 text-green-800 border border-green-300">
                    <FileText className="w-4 h-4" />
                    {unidade.contratos.length}
                  </span>
                )}
                {/* Status da unidade */}
                <span
                  className={`px-3 py-1 rounded-full text-xs border ${unidade.ativo
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                    : "bg-gray-200 text-gray-600 border-gray-400"
                    }`}
                >
                  {unidade.ativo ? "Ativa" : "Inativa"}
                </span>
              </div>
              <p className="text-sm text-gray-600">{unidade.tipoDocumento}: {unidade.documento || "—"}</p>
              <p className="text-xs text-gray-500">{formatarEndereco({
                endereco: unidade.endereco,
                numero: unidade.numero,
                complemento: unidade.complemento,
                bairro: unidade.bairro,
                cidade: unidade.cidade,
                uf: unidade.uf,
                cep: unidade.cep,
              })}</p>
              <p className="text-xs text-gray-500">{unidade.observacao}</p>
            </div>
            <div className="flex gap-2">
              {onEditar && (
                <button onClick={() => onEditar(index)} title="Editar">
                  <Pencil className="w-4 h-4 text-blue-600 hover:text-blue-800" />
                </button>
              )}
              {onRemover && (
                <button onClick={() => onRemover(index)} title="Remover">
                  <Trash2 className="w-4 h-4 text-red-600 hover:text-red-800" />
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}