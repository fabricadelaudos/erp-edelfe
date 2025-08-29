import { useState } from "react";
import type { Empresa } from "../../types/EstruturaEmpresa";
import { salvarEmpresa } from "../../services/apiEmpresa";

interface Props {
  aoSalvar: () => void;
  empresa?: Empresa;
}

export default function FormEmpresa({ aoSalvar, empresa }: Props) {
  const [aba, setAba] = useState<"dados" | "unidades">("dados");
  const [nome, setNome] = useState(empresa?.nome || "");

  const salvar = async () => {
    await salvarEmpresa({ nome });
    aoSalvar();
  };

  return (
    <div>
      <div className="flex border-b mb-4">
        <button
          onClick={() => setAba("dados")}
          className={`px-4 py-2 ${aba === "dados" ? "border-b-2 border-blue-500 font-bold" : "text-gray-500"}`}
        >
          Dados
        </button>
        <button
          onClick={() => setAba("unidades")}
          className={`px-4 py-2 ${aba === "unidades" ? "border-b-2 border-blue-500 font-bold" : "text-gray-500"}`}
        >
          Unidades
        </button>
      </div>

      {aba === "dados" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome da Empresa</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
        </div>
      )}

      {aba === "unidades" && (
        <div className="text-gray-500 italic">
          Módulo de Unidades em construção...
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={salvar}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Salvar
        </button>
      </div>
    </div>
  );
}