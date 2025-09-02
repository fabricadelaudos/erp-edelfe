import { useEffect, useState } from "react";
import { Input } from "../Inputs";
import type { Contato } from "../../types/EstruturaEmpresa";
import { formatarTelefone, limparFormatacao } from "../Auxiliares/formatter";

interface Props {
  contato: Contato;
  onChange?: (novoContato: Contato) => void;
  onSave?: (novoContato: Contato) => void;
  onCancel?: () => void;
  showActions?: boolean;
}

export default function FormContato({
  contato,
  onChange,
  onSave,
  onCancel,
  showActions = true,
}: Props) {
  const [formLocal, setFormLocal] = useState<Contato>({ ...contato });

  useEffect(() => {
    setFormLocal({ ...contato });
  }, [contato]);

  const atualizar = <K extends keyof Contato>(campo: K, valor: Contato[K]) => {
    const atualizado = { ...formLocal, [campo]: valor };
    setFormLocal(atualizado);
    onChange?.(atualizado);
  };

  const handleSave = () => onSave?.(formLocal);
  const handleCancel = () => {
    setFormLocal({ ...contato });
    onCancel?.();
  };

  return (
    <div className="space-y-4 p-4">
      <Input
        name="nome"
        label="Nome"
        value={formLocal.nome}
        onChange={(e) => atualizar("nome", e.target.value)}
      />
      <Input
        name="email"
        label="Email"
        value={formLocal.email}
        onChange={(e) => atualizar("email", e.target.value)}
      />
      <Input
        name="emailSecundario"
        label="Email Secundário"
        value={formLocal.emailSecundario || ""}
        onChange={(e) => atualizar("emailSecundario", e.target.value)}
        required={false}
      />
      <Input
        name="telefoneFixo"
        label="Telefone Fixo"
        value={formatarTelefone(formLocal.telefoneFixo ?? "", "FIXO") || ""}
        onChange={(e) => atualizar("telefoneFixo", limparFormatacao(e.target.value))}
        required={false}
      />
      <Input
        name="telefoneWpp"
        label="WhatsApp"
        value={formatarTelefone(formLocal.telefoneWpp ?? "", "WPP") || ""}
        onChange={(e) => atualizar("telefoneWpp", limparFormatacao(e.target.value))}
        required={false}
      />

      {showActions && (
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
          >
            Salvar
          </button>
        </div>
      )}
    </div>
  );
}