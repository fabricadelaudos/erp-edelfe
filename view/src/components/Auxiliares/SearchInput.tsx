import { useState } from "react";
import { Search } from "lucide-react";

interface Props {
  onBusca: (valor: string) => void;
  placeholder?: string;
  larguraMinima?: string; // Ex: "300px"
  valorInicial?: string;
}

export default function SearchInput({
  onBusca,
  placeholder = "Buscar...",
  larguraMinima = "250px",
  valorInicial = "",
}: Props) {
  const [valor, setValor] = useState(valorInicial);

  const buscar = () => {
    onBusca(valor.trim());
  };

  return (
    <div className="flex items-center gap-2 mb-4" style={{ minWidth: larguraMinima }}>
      <input
        type="text"
        placeholder={placeholder}
        className="border border-gray-300 rounded px-3 py-2 w-full"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") buscar();
        }}
      />
      <button
        onClick={buscar}
        className="bg-gray-200 px-3 py-2 rounded hover:bg-gray-300"
        title="Buscar"
      >
        <Search size={18} />
      </button>
    </div>
  );
}
