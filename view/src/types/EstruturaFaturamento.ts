export interface Faturamento {
  idFaturamento: number;
  fkContratoId: number;
  contrato?: {
    idContrato: number;
    unidade?: {
      idUnidade: number;
      nomeFantasia: string;
      empresa?: {
        idEmpresa: number;
        nome: string;
      };
    };
  };
  valorBase: string;
  impostoPorcentagem: string;
  impostoValor: string;
  valorTotal: string;
  vidas?: number;
  numeroNF?: string;
  status: "ABERTA" | "PAGA" | "ATRASADA";
  competencia: string;
}

export interface Projecao {
  idProjecao: number;
  fkContratoId: number;
  valorBase: string;
  impostoPorcentagem: string;
  impostoValor: string;
  valorTotal: string;
}