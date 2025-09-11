import { prisma } from "../config/prisma-client";
import { registrarEvento } from "../shared/utils/registrarEvento";

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
  numeroNota?: string;
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

export const editarFaturamento = {
  async execute(id: number, dados: any, user: any) {
    const existente = await prisma.faturamento.findUnique({
      where: { idFaturamento: id },
    });

    if (!existente) throw new Error("Faturamento não encontrado");

    const atualizado = await prisma.faturamento.update({
      where: { idFaturamento: id },
      data: {
        numeroNota: dados.numeroNota ?? null,
        valorBase: dados.valorBase,
        impostoPorcentagem: dados.impostoPorcentagem,
        impostoValor: dados.impostoValor,
        valorTotal: dados.valorTotal,
        vidas: dados.vidas ?? null,
        status: dados.status,
      },
    });

    await registrarEvento({
      idUsuario: user?.idUsuario,
      tipo: "EDICAO",
      descricao: `Editou o faturamento ${id}`,
      entidade: "faturamento",
      entidadeId: id,
      dadosAntes: existente,
      dadosDepois: atualizado,
    });

    return atualizado;
  }
};

export const buscarFaturamentoCompetencia = {
  async execute(competencia: string) {
    const faturamentos = await prisma.faturamento.findMany({
      where: { competencia },
      orderBy: [
        { status: "asc" },
        { fkContratoId: "asc" },
      ],
      include: {
        contrato: {
          include: {
            unidade: {
              include: {
                empresa: true,
                contato: true,
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
      throw new Error("Competência financeira não encontrada.");
    }

    // Busca as projeções da competência que ainda não têm faturamento
    const pendentes = await prisma.projecao.findMany({
      where: {
        competencia,
        status: "PENDENTE",
      },
      include: {
        contrato: {
          include: {
            unidade: {
              include: {
                empresa: true,
                contato: true,
              },
            },
          },
        },
      },
    });

    if (pendentes.length === 0) {
      const faturamentosExistentes = await prisma.faturamento.findMany({
        where: { competencia },
        include: {
          contrato: {
            include: {
              unidade: {
                include: { empresa: true },
              },
            },
          },
          projecao: true,
          competenciaFinanceira: true,
        },
      });

      return faturamentosExistentes;
    }

    const faturamentosData = pendentes.map((p) => {
      const valorBase = Number(p.valorPrevisto);
      const retemIss = p.contrato.unidade.retemIss;

      const impostoPorcentagem = Number(
        retemIss ? competenciaFinanceira.iss : competenciaFinanceira.imposto
      );

      const impostoValor = valorBase * (impostoPorcentagem / 100);
      const valorTotal = valorBase - impostoValor;

      return prisma.faturamento.create({
        data: {
          fkContratoId: p.fkContratoId,
          fkProjecaoId: p.idProjecao,
          fkCompetenciaFinanceiraId: competenciaFinanceira.idCompetenciaFinanceira,
          competencia,
          valorBase,
          impostoPorcentagem,
          impostoValor,
          valorTotal,
          status: "ABERTA",
          vidas: p.vidas ?? 0,
          numeroNota: "",
        },
      });
    });

    // Atualiza o status das projeções para FATURADA
    const atualizacoesProjecao = pendentes.map((p) =>
      prisma.projecao.update({
        where: { idProjecao: p.idProjecao },
        data: { status: "FATURADO" },
      })
    );

    // Executa tudo em transação
    await prisma.$transaction([...faturamentosData, ...atualizacoesProjecao]);

    // Busca e retorna os faturamentos gerados
    const faturamentosCompletos = await prisma.faturamento.findMany({
      where: { competencia },
      include: {
        contrato: {
          include: {
            unidade: {
              include: {
                empresa: true,
                contato: true
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