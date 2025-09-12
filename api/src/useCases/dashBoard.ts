import { prisma } from "../config/prisma-client";

export const getKpis = {
  async execute(filtros: { periodo: "mensal" | "anual"; competencia?: string; ano?: number }) {
    const { periodo, competencia, ano } = filtros;

    if (periodo === "mensal" && competencia) {
      const receitaPaga = await prisma.faturamento.aggregate({
        _sum: { valorTotal: true },
        where: { competencia, status: "PAGA" },
      });

      const despesaPaga = await prisma.parcelaContaPagar.aggregate({
        _sum: { valor: true },
        where: {
          status: "PAGA",
          vencimento: {
            gte: new Date(`${competencia.split("/")[1]}-${competencia.split("/")[0]}-01`), // ano-mes-01
            lte: new Date(`${competencia.split("/")[1]}-${competencia.split("/")[0]}-31`), // até fim do mês
          },
        },
      });

      const receita = Number(receitaPaga._sum.valorTotal ?? 0);
      const despesa = Number(despesaPaga._sum.valor ?? 0);

      return {
        receitaPaga: receita,
        despesaPaga: despesa,
        resultadoLiquido: receita - despesa,
      };
    }

    if (periodo === "anual" && ano) {
      // 🔹 KPIs do ano inteiro
      const receitaPaga = await prisma.faturamento.aggregate({
        _sum: { valorTotal: true },
        where: {
          competencia: { endsWith: `/${ano}` },
          status: "PAGA",
        },
      });

      const despesaPaga = await prisma.parcelaContaPagar.aggregate({
        _sum: { valor: true },
        where: {
          status: "PAGA",
          vencimento: {
            gte: new Date(`${ano}-01-01`),
            lte: new Date(`${ano}-12-31`),
          },
        },
      });

      const receita = Number(receitaPaga._sum.valorTotal ?? 0);
      const despesa = Number(despesaPaga._sum.valor ?? 0);

      return {
        receitaPaga: receita,
        despesaPaga: despesa,
        resultadoLiquido: receita - despesa,
      };
    }

    return { receitaPaga: 0, despesaPaga: 0, resultadoLiquido: 0 };
  },
};

export const getReceitaVsDespesa = {
  async execute(filtros: { periodo: "mensal" | "anual"; competencia?: string; ano?: number }) {
    const { periodo, competencia, ano } = filtros;

    if (periodo === "mensal" && competencia) {
      // 🔹 Receita e despesa do mês
      const receita = await prisma.faturamento.aggregate({
        _sum: { valorTotal: true },
        where: { competencia, status: "PAGA" },
      });

      const despesa = await prisma.parcelaContaPagar.aggregate({
        _sum: { valor: true },
        where: {
          status: "PAGA",
          vencimento: {
            gte: new Date(`${competencia.split("/")[1]}-${competencia.split("/")[0]}-01`),
            lte: new Date(`${competencia.split("/")[1]}-${competencia.split("/")[0]}-31`),
          },
        },
      });

      return {
        competencia,
        receita: Number(receita._sum.valorTotal ?? 0),
        despesa: Number(despesa._sum.valor ?? 0),
      };
    }

    if (periodo === "anual" && ano) {
      // 🔹 Receita e despesa agrupada por mês
      const faturamentos = await prisma.faturamento.findMany({
        where: { competencia: { endsWith: `/${ano}` }, status: "PAGA" },
        select: { competencia: true, valorTotal: true },
      });

      const despesas = await prisma.parcelaContaPagar.findMany({
        where: {
          status: "PAGA",
          vencimento: { gte: new Date(`${ano}-01-01`), lte: new Date(`${ano}-12-31`) },
        },
        select: { vencimento: true, valor: true },
      });

      // Agrupar manualmente por mês
      const resultado: { competencia: string; receita: number; despesa: number }[] = [];

      for (let mes = 1; mes <= 12; mes++) {
        const mm = mes.toString().padStart(2, "0");
        const comp = `${mm}/${ano}`;

        const receitaMes = faturamentos
          .filter((f) => f.competencia === comp)
          .reduce((acc, f) => acc + Number(f.valorTotal), 0);

        const despesaMes = despesas
          .filter((d) => d.vencimento.getMonth() + 1 === mes)
          .reduce((acc, d) => acc + Number(d.valor), 0);

        resultado.push({ competencia: comp, receita: receitaMes, despesa: despesaMes });
      }

      return resultado;
    }

    return [];
  },
};

export const getDespesasCategoria = {
  async execute(filtros: { periodo: "mensal" | "anual"; competencia?: string; ano?: number }) {
    const { periodo, competencia, ano } = filtros;

    if (periodo === "mensal" && competencia) {
      return prisma.planoContaCategoria.findMany({
        select: {
          idPlanoContaCategoria: true,
          nome: true,
          subcategorias: {
            select: {
              nome: true,
              contasPagar: {
                select: { valorTotal: true, vencimento: true },
                where: {
                  parcelasConta: { some: { status: "PAGA" } },
                  vencimento: {
                    gte: new Date(`${competencia.split("/")[1]}-${competencia.split("/")[0]}-01`),
                    lte: new Date(`${competencia.split("/")[1]}-${competencia.split("/")[0]}-31`),
                  },
                },
              },
            },
          },
        },
      });
    }

    if (periodo === "anual" && ano) {
      return prisma.planoContaCategoria.findMany({
        select: {
          idPlanoContaCategoria: true,
          nome: true,
          subcategorias: {
            select: {
              nome: true,
              contasPagar: {
                select: { valorTotal: true, vencimento: true },
                where: {
                  parcelasConta: { some: { status: "PAGA" } },
                  vencimento: {
                    gte: new Date(`${ano}-01-01`),
                    lte: new Date(`${ano}-12-31`),
                  },
                },
              },
            },
          },
        },
      });
    }

    return [];
  },
};

export const getFaturamentosRecentes = {
  async execute(limit = 10) {
    const faturamentos = await prisma.faturamento.findMany({
      take: limit,
      orderBy: { idFaturamento: "desc" },
      include: {
        contrato: { include: { unidade: true } },
      },
    });

    return faturamentos.map((f) => ({
      id: f.idFaturamento,
      competencia: f.competencia,
      valor: Number(f.valorTotal),
      status: f.status,
      contrato: f.contrato?.idContrato,
      unidade: f.contrato?.unidade?.nomeFantasia,
    }));
  },
};

export const getDespesasRecentes = {
  async execute(limit = 10) {
    const despesas = await prisma.parcelaContaPagar.findMany({
      take: limit,
      orderBy: { vencimento: "desc" },
      include: {
        contaPagar: {
          include: {
            fornecedor: true,
            planoConta: { include: { categoria: true } },
          },
        },
      },
    });

    return despesas.map((d) => ({
      id: d.idParcela,
      vencimento: d.vencimento,
      valor: Number(d.valor),
      status: d.status,
      fornecedor: d.contaPagar.fornecedor.nome,
      categoria: d.contaPagar.planoConta.categoria.nome,
      subcategoria: d.contaPagar.planoConta.nome,
    }));
  },
};