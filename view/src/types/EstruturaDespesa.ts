export interface Fornecedor {
  idFornecedor: number;
  tipoPessoa: 'CLIENTE' | 'CLIENTE_FORNECEDOR' | 'FORNECEDOR';
  tipoDocumento: 'CNPJ' | 'CAEPF' | 'CPF';
  documento: string;
  nome: string;
  observacao?: string;
  ativo: boolean;
}

export interface Banco {
  idBanco: number;
  nome: string;
  ativo: boolean;
}

export interface PlanoContaCategoria {
  idPlanoContaCategoria: number;
  nome: string;
  ativo: boolean;
  planocontasubcategoria: PlanoContaSubCategoria[];
}

export interface PlanoContaSubCategoria {
  idPlanoContaSubCategoria?: number;
  nome: string;
  ativo: boolean;
  categoria?: PlanoContaCategoria;
  planocontacategoria?: PlanoContaCategoria;
}

export interface ParcelaContaPagar {
  idParcela: number;
  numero: number;
  vencimento: string;
  valor: string;
  status: 'ABERTA' | 'PAGA' | 'VENCIDA';
  pagoEm?: string;
}

export interface ContaPagar {
  idContaPagar: number;
  dataEmissao: string;
  numeroDocumento: string;
  tipoDocumentoConta: 'BOLETO' | 'DEBITO_AUTOMATICO' | 'FATURA' | 'NF' | 'PIX';
  descricao?: string;
  valorTotal: string;
  parcelas: number;
  vencimento: string;
  intervalo?: number;
  recorrente: boolean;
  status: 'ABERTA' | 'PAGA' | 'VENCIDA';

  fornecedor: Fornecedor;
  banco: Banco;

  planocontasubcategoria: PlanoContaSubCategoria;
  parcelacontapagar: ParcelaContaPagar[];
}

export type ParcelaComConta = ParcelaContaPagar & { contaPagar: ContaPagar };

export interface FiltroDespesa {
  status?: string;
  dataEmissaoInicio?: string;
  dataEmissaoFim?: string;
  dataPagamentoInicio?: string;
  dataPagamentoFim?: string;
  dataVencimentoInicio?: string;
  dataVencimentoFim?: string;
}