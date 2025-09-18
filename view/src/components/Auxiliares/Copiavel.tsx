import { Copy, CopyCheck } from "lucide-react";
import { useState } from "react";

interface CopiavelProps {
  valor: string;
  texto?: string;
}

export default function Copiavel({ valor, texto }: CopiavelProps) {
  const [copiado, setCopiado] = useState(false);

  const handleCopiar = () => {
    navigator.clipboard.writeText(valor);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1500);
  };

  return (
    <div className="flex items-center gap-2 group">
      <span className="truncate">{texto ?? valor}</span>
      <button
        onClick={handleCopiar}
        className="text-gray-400 hover:text-gray-600 transition"
        title="Copiar"
      >
        {copiado ? (
          <CopyCheck size={16} className="text-green-500" />
        ) : (
          <Copy size={16} />
        )}
      </button>
    </div>
  );
}