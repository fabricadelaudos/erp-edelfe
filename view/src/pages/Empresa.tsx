import { useEffect, useState } from "react";
import { getEmpresas } from "../services/apiEmpresa";
import type { Empresa } from "../types/EstruturaEmpresa";

import ModalBase from "../components/Modais/ModalBase";
import FormEmpresa from "../components/Formularios/FormEmpresa";
import SearchInput from "../components/Auxiliares/SearchInput";
import { Plus, ChevronDown, ChevronRight, Pencil } from "lucide-react";
import ToolTip from "../components/Auxiliares/ToolTip";
import { formatarDocumento } from "../components/Auxiliares/formatter";

export default function EmpresaPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [empresaSelecionada, setEmpresaSelecionada] = useState<Empresa | null>(null);
  const [busca, setBusca] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [empresasAbertas, setEmpresasAbertas] = useState<number[]>([]);

  useEffect(() => {
    const carregarEmpresas = async () => {
      const data = await getEmpresas();
      console.log(data);

      setEmpresas(data);
    };

    carregarEmpresas();
  }, []);

  const handleEditar = (empresa: Empresa) => {
    setEmpresaSelecionada(empresa);
    setModalAberto(true);
  };

  const handleNovaEmpresa = () => {
    setEmpresaSelecionada(null);
    setModalAberto(true);
  };

  const toggleEmpresaAberta = (id: number) => {
    setEmpresasAbertas((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const empresasFiltradas = empresas.filter((empresa) => {
    const termo = busca.toLowerCase();

    const nomeEmpresaMatch = empresa.nome.toLowerCase().includes(termo);

    const unidadeMatch = (empresa.unidades ?? []).some((unidade) =>
      unidade.nomeFantasia.toLowerCase().includes(termo) ||
      unidade.cidade.toLowerCase().includes(termo) ||
      unidade.uf.toLowerCase().includes(termo) ||
      unidade.documento.toString().toLowerCase().includes(termo)
    );

    return nomeEmpresaMatch || unidadeMatch;
  });

  useEffect(() => {
    if (busca.trim() === "") return;

    const idsAbertos = empresasFiltradas.map((empresa) => empresa.idEmpresa);
    setEmpresasAbertas(idsAbertos);
  }, [busca, empresasFiltradas]);


  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Empresas</h2>
        <button
          onClick={handleNovaEmpresa}
          className="flex items-center gap-2 bg-orange-400 text-white px-4 py-2 rounded hover:bg-orange-500"
        >
          <Plus size={18} />
          Empresa
        </button>
      </div>


      <div className="mt-4 space-y-2 bg-white p-4 rounded-md border border-gray-200">
        <SearchInput onBusca={setBusca} placeholder="Buscar empresa..." />

        {empresasFiltradas.length === 0 ? (
          <>
            <div>
              <p className="text-gray-400 text-center font-medium">Nenhuma empresa encontrada!</p>
            </div>
          </>
        ) : empresasFiltradas.map((empresa) => (
          <div
            key={empresa.idEmpresa}
            className="border border-gray-300 rounded-md overflow-hidden"
          >
            {/* Linha da empresa */}
            <div className="bg-gray-100 flex items-center justify-between px-4 py-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleEmpresaAberta(empresa.idEmpresa)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  {empresasAbertas.includes(empresa.idEmpresa) ? (
                    <ChevronDown size={18} />
                  ) : (
                    <ChevronRight size={18} />
                  )}
                </button>
                <span className="font-medium">#{empresa.idEmpresa} - {empresa.nome}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <ToolTip text={empresa.ativo ? "Ativo" : "Inativo"} position="left">
                    <div
                      className={`w-3 h-3 rounded-full ${empresa.ativo ? "bg-green-500" : "bg-gray-300"
                        }`}
                    />
                  </ToolTip>
                </div>

                <button
                  onClick={() => handleEditar(empresa)}
                  className="text-blue-600 hover:underline"
                >
                  <Pencil size={14} />
                </button>
              </div>
            </div>

            {/* Subtabela de unidades */}
            {empresasAbertas.includes(empresa.idEmpresa) && (
              <div className="px-4 pb-4 pt-2 bg-white text-sm">
                <div className="mb-1 font-semibold text-gray-600">Unidades</div>
                <div className="border border-gray-300 rounded overflow-hidden">
                  <table className="w-full text-center text-sm border-separate border-spacing-0">
                    <thead className="bg-gray-100 text-gray-700 border-b border-gray-300">
                      <tr>
                        <th className="p-2">Unidade</th>
                        <th className="p-2">Documento</th>
                        <th className="p-2">Cidade</th>
                        <th className="p-2">UF</th>
                        <th className="p-2">Status</th>
                        <th className="p-2">Retém ISS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {empresa.unidades?.map((unidade, index) => (
                        <tr
                          key={unidade.idUnidade}
                          className={`border-t border-gray-300 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"
                            }`}
                        >
                          <td className="p-2">{unidade.nomeFantasia}</td>
                          <td className="p-2">{formatarDocumento(unidade.documento, unidade.tipoDocumento)}</td>
                          <td className="p-2">{unidade.cidade}</td>
                          <td className="p-2">{unidade.uf}</td>
                          <td className="p-2">
                            <ToolTip text={unidade.ativo ? "Ativo" : "Inativo"}>
                              <div
                                className={`w-3 h-3 rounded-full ${unidade.ativo ? "bg-green-500" : "bg-gray-300"
                                  }`}
                              />
                            </ToolTip>
                          </td>
                          <td className="p-2">
                            <ToolTip text={unidade.retemIss ? "Sim" : "Não"}>
                              <div
                                className={`w-3 h-3 rounded-full ${unidade.retemIss ? "bg-green-500" : "bg-gray-300"
                                  }`}
                              />
                            </ToolTip>
                          </td>
                        </tr>
                      ))}
                      {empresa.unidades?.length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-2 text-center text-gray-500">
                            Nenhuma unidade cadastrada.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <ModalBase
        titulo={empresaSelecionada ? "Editar Empresa" : "Nova Empresa"}
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
      >
        <FormEmpresa
          empresaSelecionada={empresaSelecionada ?? undefined}
          onSalvar={async () => {
            setModalAberto(false);
            const data = await getEmpresas();
            setEmpresas(data);
          }}
        />
      </ModalBase>
    </div>
  );
}