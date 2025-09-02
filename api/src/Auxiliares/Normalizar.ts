export function normalizarCompetencia(entrada: string): string {
  if (/^\d{2}\/\d{4}$/.test(entrada)) {
    const [mes, ano] = entrada.split("/");
    return `${ano}-${mes}`;
  }
  return entrada;
}