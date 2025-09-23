import { normalizarCompetencia } from "../Auxiliares/Normalizar";
import { prisma } from "../config/prisma-client";
import { registrarEvento } from "../shared/utils/registrarEvento";

export const buscarCompetenciaAtual = {
  async execute() {
    const dataAtual = new Date();
    const mes = String(dataAtual.getMonth() + 1).padStart(2, "0");
    const ano = dataAtual.getFullYear();
    const competenciaAtual = `${ano}-${mes}`;

    const competencia = await prisma.competenciaFinanceira.findFirst({
      where: {
        competencia: competenciaAtual,
      },
    });

    return competencia;
  },
};

export const buscarCompetenciasFinanceirasUseCase = {
  async execute() {
    return await prisma.competenciaFinanceira.findMany({
      orderBy: { competencia: "desc" }
    });
  }
};

export const criarCompetenciaFinanceiraUseCase = {
  async execute(dados: any, user: any) {
    const competenciaNormalizada = normalizarCompetencia(dados.competencia);

    const existente = await prisma.competenciaFinanceira.findUnique({
      where: { competencia: competenciaNormalizada }
    });

    if (existente) throw new Error("Competência já existe");

    const nova = await prisma.competenciaFinanceira.create({
      data: { ...dados, competencia: competenciaNormalizada },
    });

    await registrarEvento({
      idUsuario: user.idUsuario,
      tipo: "CRIACAO",
      descricao: `Criou competência financeira ${nova.competencia}`,
      entidade: "competenciaFinanceira",
      entidadeId: nova.idCompetenciaFinanceira,
      dadosDepois: nova,
    });

    return nova;
  }
};

export const editarCompetenciaFinanceiraUseCase = {
  async execute(id: number, dados: any, user: any) {
    const antes = await prisma.competenciaFinanceira.findUnique({
      where: { idCompetenciaFinanceira: id },
    });

    if (!antes) throw new Error("Competência não encontrada");

    const competenciaNormalizada = normalizarCompetencia(dados.competencia);

    // 1. Atualizar a competência
    const atualizada = await prisma.competenciaFinanceira.update({
      where: { idCompetenciaFinanceira: id },
      data: {
        ...dados,
        competencia: competenciaNormalizada,
      },
    });

    // 2. Buscar todos os faturamentos dessa competência
    const faturamentos = await prisma.faturamento.findMany({
      where: { competencia: competenciaNormalizada },
      include: {
        contrato: {
          include: {
            unidade: true,
          },
        },
      },
    });

    // 3. Atualizar os faturamentos em massa
    if (faturamentos.length > 0) {
      await prisma.$transaction(async (tx) => {
        for (const f of faturamentos) {
          // regra: ou imposto ou iss
          const percentual = f.contrato?.unidade?.retemIss
            ? Number(atualizada.iss)
            : Number(atualizada.imposto);

          const impostoPorcentagem = percentual;
          const valorBase = Number(f.valorBase);
          const impostoValor = (valorBase * impostoPorcentagem) / 100;
          const valorTotal = valorBase - impostoValor;

          const atualizadoFaturamento = await tx.faturamento.update({
            where: { idFaturamento: f.idFaturamento },
            data: {
              impostoPorcentagem,
              impostoValor,
              valorTotal,
            },
          });

          await registrarEvento({
            idUsuario: user.idUsuario,
            tipo: "EDICAO",
            descricao: `Recalculou faturamento ${atualizadoFaturamento.idFaturamento} após edição da competência ${atualizada.competencia}`,
            entidade: "faturamento",
            entidadeId: atualizadoFaturamento.idFaturamento,
            dadosAntes: f,
            dadosDepois: atualizadoFaturamento,
          });
        }
      }, { timeout: 60000, maxWait: 60000 });
    }

    // 4. Registrar evento da competência
    await registrarEvento({
      idUsuario: user.idUsuario,
      tipo: "EDICAO",
      descricao: `Editou competência financeira ${atualizada.competencia}`,
      entidade: "competenciaFinanceira",
      entidadeId: id,
      dadosAntes: antes,
      dadosDepois: atualizada,
    });

    return atualizada;
  },
};

export const excluirCompetenciaFinanceiraUseCase = {
  async execute(id: number, user: any) {
    const existente = await prisma.competenciaFinanceira.findUnique({
      where: { idCompetenciaFinanceira: id }
    });

    if (!existente) throw new Error("Competência não encontrada");

    await prisma.competenciaFinanceira.delete({
      where: { idCompetenciaFinanceira: id }
    });

    await registrarEvento({
      idUsuario: user.idUsuario,
      tipo: "EXCLUSAO",
      descricao: `Excluiu competência financeira ${existente.competencia}`,
      entidade: "competenciaFinanceira",
      entidadeId: id,
      dadosAntes: existente,
    });
  }
};