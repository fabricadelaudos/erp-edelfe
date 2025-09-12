import { prisma } from "../config/prisma-client";
import { addDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const getKpis = {
  async execute(filtros: { periodo: "mensal" | "anual"; competencia?: string; ano?: number }) {
    const { periodo, competencia, ano } = filtros;

    if (periodo === "mensal" && competencia) {
      const [faturamentoAgg, impostoAgg, contasAgg] = await Promise.all([
        prisma.faturamento.aggregate({
          _sum: { valorBase: true, valorTotal: true },
          where: { competenciaPagamento: competencia, status: "PAGA" },
        }),
        prisma.faturamento.aggregate({
          _sum: { impostoValor: true },
          where: { competenciaPagamento: competencia, status: "PAGA" },
        }),
        prisma.parcelaContaPagar.aggregate({
          _sum: { valor: true },
          where: {
            status: "PAGA",
            pagoEm: {
              gte: new Date(`${competencia.split("/")[1]}-${competencia.split("/")[0]}-01`),
              lte: new Date(`${competencia.split("/")[1]}-${competencia.split("/")[0]}-31`),
            },
          },
        }),
      ]);

      const faturamento = Number(faturamentoAgg._sum.valorBase ?? 0);
      const imposto = Number(impostoAgg._sum.impostoValor ?? 0);
      const contasPagar = Number(contasAgg._sum.valor ?? 0);
      const lucro = Number(faturamentoAgg._sum.valorTotal ?? 0) - contasPagar;

      return { faturamento, contasPagar, imposto, lucro };
    }

    if (periodo === "anual" && ano) {
      const [faturamentoAgg, impostoAgg, contasAgg] = await Promise.all([
        prisma.faturamento.aggregate({
          _sum: { valorBase: true, valorTotal: true },
          where: {
            competenciaPagamento: { endsWith: `/${ano}` },
            status: "PAGA",
          },
        }),
        prisma.faturamento.aggregate({
          _sum: { impostoValor: true },
          where: {
            competenciaPagamento: { endsWith: `/${ano}` },
            status: "PAGA",
          },
        }),
        prisma.parcelaContaPagar.aggregate({
          _sum: { valor: true },
          where: {
            status: "PAGA",
            pagoEm: {
              gte: new Date(`${ano}-01-01`),
              lte: new Date(`${ano}-12-31`),
            },
          },
        }),
      ]);

      const faturamento = Number(faturamentoAgg._sum.valorBase ?? 0);
      const imposto = Number(impostoAgg._sum.impostoValor ?? 0);
      const contasPagar = Number(contasAgg._sum.valor ?? 0);
      const lucro = Number(faturamentoAgg._sum.valorTotal ?? 0) - contasPagar;

      return { faturamento, contasPagar, imposto, lucro };
    }

    return { faturamento: 0, contasPagar: 0, imposto: 0, lucro: 0 };
  },
};

export const getReceitaVsDespesa = {
  async execute(filtros: { periodo: "mensal" | "anual"; competencia?: string; ano?: number }) {
    const { periodo, competencia, ano } = filtros;

    if (periodo === "mensal" && competencia) {
      // 🔹 Receita e despesa do mês
      const receita = await prisma.faturamento.aggregate({
        _sum: { valorTotal: true },
        where: { competenciaPagamento: competencia, status: "PAGA" },
      });

      const despesa = await prisma.parcelaContaPagar.aggregate({
        _sum: { valor: true },
        where: {
          status: "PAGA",
          pagoEm: {
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
        where: { competenciaPagamento: { endsWith: `/${ano}` }, status: "PAGA" },
        select: { competenciaPagamento: true, valorTotal: true },
      });

      const despesas = await prisma.parcelaContaPagar.findMany({
        where: {
          status: "PAGA",
          pagoEm: { gte: new Date(`${ano}-01-01`), lte: new Date(`${ano}-12-31`) },
        },
        select: { vencimento: true, valor: true },
      });

      // Agrupar manualmente por mês
      const resultado: { competencia: string; receita: number; despesa: number }[] = [];

      for (let mes = 1; mes <= 12; mes++) {
        const mm = mes.toString().padStart(2, "0");
        const comp = `${mm}/${ano}`;

        const receitaMes = faturamentos
          .filter((f) => f.competenciaPagamento === comp)
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

    let dataInicio: Date;
    let dataFim: Date;

    if (periodo === "mensal" && competencia) {
      const [mes, anoStr] = competencia.split("/");
      dataInicio = new Date(`${anoStr}-${mes}-01`);
      dataFim = new Date(`${anoStr}-${mes}-31`);
    } else if (periodo === "anual" && ano) {
      dataInicio = new Date(`${ano}-01-01`);
      dataFim = new Date(`${ano}-12-31`);
    } else {
      return [];
    }

    // Buscar as parcelas pagas dentro do período
    const parcelas = await prisma.parcelaContaPagar.findMany({
      where: {
        status: "PAGA",
        pagoEm: {
          gte: dataInicio,
          lte: dataFim,
        },
      },
      select: {
        valor: true,
        contaPagar: {
          select: {
            planoConta: {
              select: {
                nome: true, // subcategoria
                categoria: {
                  select: {
                    idPlanoContaCategoria: true,
                    nome: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Agrupar por subcategoria
    const subcategoriasMap = new Map<string, number>();

    for (const parcela of parcelas) {
      const sub = parcela.contaPagar?.planoConta?.nome;
      const valor = Number(parcela.valor || 0);

      if (!sub) continue;

      if (!subcategoriasMap.has(sub)) {
        subcategoriasMap.set(sub, valor);
      } else {
        subcategoriasMap.set(sub, subcategoriasMap.get(sub)! + valor);
      }
    }

    // Retornar no formato esperado para o gráfico
    const resultado = Array.from(subcategoriasMap.entries()).map(([name, value]) => ({
      name,
      value,
    }));

    return resultado;
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

export const getEvolucaoFaturamento = {
  async execute({ ano, periodo }: { ano?: string; periodo: "mensal" | "anual" }) {
    // Se não veio ano, assume ano atual
    const anoUsado =
      periodo === "mensal"
        ? new Date().getFullYear().toString()
        : ano ?? new Date().getFullYear().toString();

    const faturamentos = await prisma.faturamento.findMany({
      where: {
        pagoEm: {
          gte: new Date(`${anoUsado}-01-01`),
          lte: new Date(`${anoUsado}-12-31`),
        },
      },
      select: {
        valorTotal: true,
        pagoEm: true,
      },
    });

    const dados = Array.from({ length: 12 }, (_, i) => {
      const mes = (i + 1).toString().padStart(2, "0") + "/" + anoUsado;
      const total = faturamentos
        .filter((f) => f.pagoEm?.getMonth() === i)
        .reduce((soma, f) => soma + Number(f.valorTotal), 0);

      return { mes, valor: total };
    });

    return dados;
  },
};

export const getProjecoes = {
  async execute({ ano }: { ano: string }) {
    const anoUsado = ano ? parseInt(ano, 10) : new Date().getFullYear();

    // Busca todas as projeções do ano com vínculo até a unidade
    const projecoes = await prisma.projecao.findMany({
      where: {
        competencia: {
          contains: anoUsado.toString(),
        },
      },
      select: {
        competencia: true,
        valorPrevisto: true,
        contrato: {
          select: {
            unidade: {
              select: {
                idUnidade: true,
                nomeFantasia: true,
                empresa: {
                  select: { idEmpresa: true, nome: true },
                },
              },
            },
          },
        },
        faturamentos: {
          select: { valorTotal: true },
        },
      },
    });

    // Agrupa por unidade
    const porUnidade: Record<string, any> = {};

    for (let p of projecoes) {
      const unidade = p.contrato.unidade;
      if (!unidade) continue;

      if (!porUnidade[unidade.idUnidade]) {
        porUnidade[unidade.idUnidade] = {
          unidade: unidade.nomeFantasia,
          empresa: unidade.empresa?.nome ?? "",
          meses: Array.from({ length: 12 }, (_, i) => ({
            mes:
              [
                "jan",
                "fev",
                "mar",
                "abr",
                "mai",
                "jun",
                "jul",
                "ago",
                "set",
                "out",
                "nov",
                "dez",
              ][i] +
              "/" +
              String(anoUsado).slice(-2),
            recebido: 0,
            aVencer: 0,
            atrasado: 0,
          })),
        };
      }

      const mesIndex = parseInt(p.competencia.split("-")[1], 10) - 1;
      const realizado = p.faturamentos.reduce((acc, f) => acc + Number(f.valorTotal), 0);
      const previsto = Number(p.valorPrevisto);

      if (realizado >= previsto) {
        porUnidade[unidade.idUnidade].meses[mesIndex].recebido += realizado;
      } else {
        const hoje = new Date();
        const mesRef = new Date(anoUsado, mesIndex, 1);

        if (mesRef < hoje) {
          porUnidade[unidade.idUnidade].meses[mesIndex].atrasado += previsto - realizado;
          porUnidade[unidade.idUnidade].meses[mesIndex].recebido += realizado;
        } else {
          porUnidade[unidade.idUnidade].meses[mesIndex].aVencer += previsto - realizado;
          porUnidade[unidade.idUnidade].meses[mesIndex].recebido += realizado;
        }
      }
    }

    return Object.values(porUnidade);
  },
};

export const getContratosProximos = {
  async execute() {
    const hoje = new Date();
    const limite = addDays(hoje, 30); // próximos 30 dias


    const contratos = await prisma.contrato.findMany({
      where: {
        dataFim: {
          gte: hoje,
          lte: limite,
        },
      },
      select: {
        idContrato: true,
        dataFim: true,
        valorBase: true,
      },
    });


    return contratos.map(c => ({
      vencimento: format(c.dataFim, "dd/MM/yyyy"),
      valor: Number(c.valorBase),
    }));
  },
};