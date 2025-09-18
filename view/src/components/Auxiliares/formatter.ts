export function formatarData(data?: string | Date): string {
  if (!data) return "";

  let ano, mes, dia;

  if (typeof data === "string") {
    const partes = data.split("T")[0].split("-");
    ano = partes[0];
    mes = partes[1];
    dia = partes[2];
  } else {
    ano = data.getFullYear().toString();
    mes = String(data.getMonth() + 1).padStart(2, "0");
    dia = String(data.getDate()).padStart(2, "0");
  }

  return `${dia}/${mes}/${ano}`;
}

export function formatarDataInput(data?: string | Date): string {
  if (!data) return "";

  let ano, mes, dia;

  if (typeof data === "string") {
    const partes = data.split("T")[0].split("-");
    ano = partes[0];
    mes = partes[1];
    dia = partes[2];
  } else {
    ano = data.getFullYear().toString();
    mes = String(data.getMonth() + 1).padStart(2, "0");
    dia = String(data.getDate()).padStart(2, "0");
  }

  return `${ano}-${mes}-${dia}`;
}

export function formatarCompetenciaParaExibicao(competencia: string): string {
  if (!competencia) return "";

  const [ano, mes] = competencia.split("-");
  if (ano && mes) {
    return `${mes}/${ano}`;
  }

  return competencia;
}

export function formatarCompetenciaParaEnvio(competencia: string): string {
  if (!competencia) return "";

  const [mes, ano] = competencia.split("/");
  if (mes && ano) {
    return `${ano}-${mes.padStart(2, "0")}`;
  }

  return competencia;
}

export function formatarCEP(cep: string): string {
  const clean = cep.replace(/\D/g, "");
  return clean.replace(/^(\d{5})(\d{3})$/, "$1-$2");
}

export function formatarCPF(cpf: string): string {
  const clean = cpf.replace(/\D/g, "");
  return clean.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
}

export function formatarCNPJ(cnpj: string): string {
  const clean = cnpj.replace(/\D/g, "");
  return clean.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}

export function formatarCAEPF(caepf: string): string {
  const clean = caepf.replace(/\D/g, "");
  return clean.replace(/^(\d{8})(\d{6})$/, "$1/$2");
}

export function formatarRG(rg: string): string {
  return rg.replace(/\D/g, "").replace(/^(\d{2})(\d{3})(\d{3})(\d?)$/, "$1.$2.$3-$4");
}

export function formatarCNH(cnh: string): string {
  return cnh.replace(/\D/g, "").replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1 $2 $3 $4");
}

export function formatarDocumento(doc: string, type: string): string {
  if (!doc || !type) {
    console.error("Dados ausentes");
    return "";
  };

  const clean = doc.replace(/\D/g, "");

  switch (type) {
    case 'RG': return formatarRG(clean);
    case 'CNH': return formatarCNH(clean);
    case 'CAEPF': return formatarCAEPF(clean);
    case 'CNPJ': return formatarCNPJ(clean);
    case 'CPF': return formatarCPF(clean);
    case 'CEP': return formatarCEP(clean);
    default: return doc;
  }
}

// exemplo: formatador
export function formatarMinutosEmHoras(min?: number): string {
  const minutes = Number.isFinite(min) && (min as number) >= 0 ? (min as number) : 0;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h && m) return `${h}h ${m}min`;
  if (h) return `${h}h`;
  return `${m}min`;
}

export function formatarTelefone(telefone: string, type: string): string {
  if (!telefone || !type) return "";

  const clean = telefone.replace(/\D/g, "");
  switch (type) {
    case 'WPP': return clean.replace(/^(\d{2})(\d{4,5})(\d{4})$/, "($1) $2-$3");
    case 'FIXO': return clean.replace(/^(\d{2})(\d{4,5})(\d{4})$/, "($1) $2-$3");
    default: return telefone;
  }
}

export function formatarEndereco({
  endereco,
  numero,
  complemento,
  bairro,
  cidade,
  uf,
  cep,
}: {
  endereco: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
}): string {
  const partes = [
    `${endereco}, ${numero}`,
    complemento?.trim() ? ` ${complemento}` : "",
    ` - ${bairro}`,
    ` - ${cidade}/${uf}`,
    ` - CEP: ${formatarCEP(cep)}`
  ];

  return partes.join("");
}

export function limparFormatacao(valor: string): string {
  return valor.replace(/\D/g, "");
}

export function formatarReais(valor: number | string | null | undefined) {
  const numero = Number(valor ?? 0);
  return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}