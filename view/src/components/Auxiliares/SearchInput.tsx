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
    <div
      className="flex items-center mb-4 h-10 rounded-full border border-gray-300 shadow-sm bg-white overflow-hidden"
      style={{ minWidth: larguraMinima }}
    >
      <input
        type="text"
        placeholder={placeholder}
        className="px-5 h-full w-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") buscar();
        }}
      />
      <button
        onClick={buscar}
        className="flex items-center justify-center h-full px-5 bg-orange-400 text-white hover:bg-orange-500 transition-colors"
        title="Buscar"
      >
        <Search size={18} />
      </button>
    </div>

  );
}
