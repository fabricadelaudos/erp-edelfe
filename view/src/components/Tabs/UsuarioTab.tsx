import { useEffect, useState } from "react";
import { getUsuario, criarUsuario, editarUsuario, excluirUsuario, recuperarSenha } from "../../services/apiUsuario";
import type { Usuario } from "../../types/EstruturaUsuario";

import { Plus, RotateCcwKey } from "lucide-react";
import TabelaBase from "../Tabelas/TabelaBase";
import ModalBase from "../Modais/ModalBase";
import FormUsuario from "../Formularios/FormUsuario";
import toast from "react-hot-toast";
import ToolTip from "../Auxiliares/ToolTip";

export default function UsuarioTab() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [usuarioEdicao, setUsuarioEdicao] = useState<Usuario | null>(null);

  const carregarUsuarios = async () => {
    try {
      const data = await getUsuario();
      setUsuarios(Array.isArray(data) ? data : [data]);
    } catch (err) {
      console.error("Erro ao carregar usuários", err);
    }
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const abrirModal = (usuario?: Usuario) => {
    setUsuarioEdicao(usuario ?? null);
    setModalAberto(true);
  };

  const salvarUsuario = async (dados: Partial<Usuario>) => {
    try {
      if (usuarioEdicao) {
        await editarUsuario({ ...usuarioEdicao, ...dados });
      } else {
        await criarUsuario(dados);
      }
      setModalAberto(false);
      carregarUsuarios();
    } catch (err: any) {
      console.error("Erro ao salvar usuário", err);
      const msg = err?.response?.data?.error || "Erro ao salvar usuário.";
      toast.error(msg);
    }
  };


  const deletarUsuario = async (usuario: Usuario) => {
    if (!confirm(`Deseja realmente excluir o usuário ${usuario.nome}?`)) return;
    try {
      await excluirUsuario();
      carregarUsuarios();
    } catch (err) {
      console.error("Erro ao excluir usuário", err);
    }
  };

  const handleRecuperarSenha = async (email: string) => {
    if (!email) return;

    try {
      const link = await recuperarSenha(email);

      await navigator.clipboard.writeText(link);

      toast.success("Link de recuperação de senha gerado e copiado!");
    } catch (err: any) {
      console.error("Erro ao gerar link de senha:", err);
      toast.error(err.message || "Erro ao gerar link de senha.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Usuários</h2>
        <button
          onClick={() => setModalAberto(true)}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
        >
          <Plus size={16} /> Adicionar
        </button>
      </div>

      <TabelaBase<Usuario>
        data={usuarios}
        columns={[
          { header: "Nome", accessor: "nome" },
          { header: "Email", accessor: "email" },
          {
            header: "Ativo",
            accessor: "ativo",
            render: (v) => (v ? "Sim" : "Não"),
          },
        ]}
        onEdit={(row) => abrirModal(row)}
        onDelete={(row) => deletarUsuario(row)}
        acoesExtras={(row) => (
          <ToolTip text="Recuperar Senha">
            <button
              onClick={() => handleRecuperarSenha(row.email)}
              className="text-teal-600 hover:text-teal-800 cursor-pointer text-xs underline"
            >
              <RotateCcwKey size={16} />
            </button>
          </ToolTip>
        )}
      />

      <ModalBase
        isOpen={modalAberto}
        onClose={() => { setModalAberto(false); setUsuarioEdicao(null); }}
        titulo={usuarioEdicao ? "Editar Usuário" : "Novo Usuário"}
      >
        <FormUsuario
          usuario={usuarioEdicao}
          onSalvar={salvarUsuario}
          onCancelar={() => setModalAberto(false)}
        />
      </ModalBase>
    </div>
  );
}
