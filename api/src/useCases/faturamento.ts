import { prisma } from "../config/prisma-client";

interface FaturamentoInput {
  fkContratoId: number;
  fkProjecaoId?: number;
  fkCompetenciaFinanceiraId: number;
  competencia: string;
  valorBase: string;
  impostoPorcentagem: string;
  impostoValor: string;
  valorTotal: string;
  status: string;
  vidas?: number;
  pagoEm?: string;
  competenciaPagamento?: string;
}

export const buscarFaturamentosPorContrato = {
  async execute(idContrato: number) {
    const faturamentos = await prisma.faturamento.findMany({
      where: { fkContratoId: idContrato },
      orderBy: { competencia: "asc" },
    });

    return faturamentos;
  },
};

export const criarFaturamento = {
  async execute(data: FaturamentoInput) {
    const faturamento = await prisma.faturamento.create({
      data: {
        fkContratoId: data.fkContratoId,
        fkProjecaoId: data.fkProjecaoId,
        fkCompetenciaFinanceiraId: data.fkCompetenciaFinanceiraId,
        competencia: data.competencia,
        valorBase: data.valorBase,
        impostoPorcentagem: data.impostoPorcentagem,
        impostoValor: data.impostoValor,
        valorTotal: data.valorTotal,
        status: data.status as any,
        vidas: data.vidas,
        pagoEm: data.pagoEm ? new Date(data.pagoEm) : undefined,
        competenciaPagamento: data.competenciaPagamento,
      },
    });

    return faturamento;
  },
};

export const buscarFaturamentoCompetencia = {
  async execute(competencia: string) {
    const faturamentos = await prisma.faturamento.findMany({
      where: { competencia },
      orderBy: { fkContratoId: "asc" },
      include: {
        contrato: {
          include: {
            unidade: {
              include: {
                empresa: true,
              },
            },
          },
        },
        projecao: true,
        competenciaFinanceira: true,
      },
    });

    return faturamentos;
  },
};

export const gerarFaturamento = {
  async execute(competencia: string) {
    const competenciaFinanceira = await prisma.competenciaFinanceira.findUnique({
      where: { competencia },
    });

    if (!competenciaFinanceira) {
      throw new Error("Competência não encontrada.");
    }

    const pendentes = await prisma.projecao.findMany({
      where: {
        competencia,
        faturamentos: {
          none: {},
        },
      },
    });

    if (pendentes.length === 0) {
      return [];
    }

    const impostoPorcentagem = 10;

    await prisma.$transaction(
      pendentes.map((p) => {
        const valorBase = Number(p.valorPrevisto);
        const impostoValor = valorBase * (impostoPorcentagem / 100);
        const valorTotal = valorBase + impostoValor;

        return prisma.faturamento.create({
          data: {
            fkContratoId: p.fkContratoId,
            fkProjecaoId: p.idProjecao,
            fkCompetenciaFinanceiraId: competenciaFinanceira.idCompetenciaFinanceira,
            competencia,
            valorBase: valorBase.toFixed(2),
            impostoPorcentagem: impostoPorcentagem.toFixed(2),
            impostoValor: impostoValor.toFixed(2),
            valorTotal: valorTotal.toFixed(2),
            status: "ABERTA",
          },
        });
      })
    );

    // Buscar novamente com include completo
    const faturamentosCompletos = await prisma.faturamento.findMany({
      where: { competencia },
      include: {
        contrato: {
          include: {
            unidade: {
              include: {
                empresa: true,
              },
            },
          },
        },
        projecao: true,
        competenciaFinanceira: true,
      },
    });

    return faturamentosCompletos;
  },
};