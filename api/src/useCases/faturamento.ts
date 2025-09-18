import { prisma } from "../config/prisma-client";
import { FaturamentoOuProjecao } from "../dto/FaturamentoDto";
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

    let pagoEm: Date | null = existente.pagoEm;
    let competenciaPagamento: string | null = existente.competenciaPagamento;

    if (dados.status === "PAGA") {
      const agora = new Date();
      pagoEm = agora;
      competenciaPagamento = `${String(agora.getMonth() + 1).padStart(2, "0")}/${agora.getFullYear()}`;
    } else {
      pagoEm = null;
      competenciaPagamento = null;
    }

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
        pagoEm,
        competenciaPagamento,
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
  },
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
                contatos: true,
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
  async execute(idProjecao: number) {
    return await prisma.$transaction(async (tx) => {
      const projecao = await tx.faturamento.findUnique({
        where: { idFaturamento: idProjecao },
        include: { contrato: true },
      });

      if (!projecao) throw new Error("Projeção não encontrada");
      if (!projecao.contrato) throw new Error("Contrato não vinculado à projeção");

      const { contrato } = projecao;

      const valorBase = Number(projecao.valorBase ?? projecao.valor ?? 0); // fallback se precisar
      const vidas = Number(projecao.vidas ?? 0);

      const impostoPorcentagem = 0.2;
      const impostoValor = valorBase * impostoPorcentagem;
      const valorTotal = valorBase + impostoValor;

      const novoFaturamento = await tx.faturamento.create({
        data: {
          competencia: projecao.competencia,
          valorBase,
          impostoPorcentagem,
          impostoValor,
          valorTotal,
          status: "ABERTA",
          vidas: vidas,
          numeroNota: null,
          pagoEm: null,
          fkProjecaoId: projecao.idFaturamento,
          fkContratoId: contrato.idContrato,
        },
      });

      await tx.faturamento.update({
        where: { idFaturamento: idProjecao },
        data: {
          status: "FATURADO",
        },
      });

      return novoFaturamento;
    });
  },
};

export const buscarFaturamentosEProjecoes = {
  async execute() {
    const projecoes = await prisma.projecao.findMany({
      orderBy: { competencia: "asc" },
      include: {
        contrato: {
          include: {
            unidade: {
              include: {
                empresa: true,
                contatos: {
                  include: {
                    contato: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const faturamentos = await prisma.faturamento.findMany({
      include: {
        contrato: {
          include: {
            unidade: {
              include: {
                empresa: true,
                contatos: {
                  include: {
                    contato: true,
                  },
                },
              },
            },
          },
        },
        projecao: true,
        competenciaFinanceira: true,
      },
    });

    const resultado: FaturamentoOuProjecao[] = projecoes.map((p) => {
      if (p.status === "FATURADO") {
        const fat = faturamentos.find((f) => f.fkProjecaoId === p.idProjecao);
        if (fat) {
          return {
            id: fat.idFaturamento,
            tipo: "FATURAMENTO",
            competencia: fat.competencia,
            valor: Number(fat.valorTotal),
            valorBase: Number(fat.valorBase),
            valorTotal: Number(fat.valorTotal),
            impostoPorcentagem: Number(fat.impostoPorcentagem),
            impostoValor: Number(fat.impostoValor),
            vidas: fat.vidas ?? undefined,
            status: fat.status,
            numeroNota: fat.numeroNota ?? "",
            empresa: fat.contrato?.unidade?.empresa?.nome,
            unidade: fat.contrato?.unidade?.nomeFantasia,
            cnpj: fat.contrato?.unidade?.documento,
            cidade: fat.contrato?.unidade?.cidade,
            uf: fat.contrato?.unidade?.uf,
            faturadoPor: fat.contrato?.faturadoPor,
            esocial: fat.contrato?.esocial ?? undefined,
            laudos: fat.contrato?.laudos ?? undefined,
            pagoEm: fat.pagoEm?.toISOString() ?? undefined,
            contatos: fat.contrato?.unidade?.contatos ?? [],
            // ✅ Aqui adiciona o contrato inteiro (ou só os campos que você precisa)
            contrato: {
              id: fat.contrato?.idContrato,
              observacao: fat.contrato?.observacao,
              dataInicio: fat.contrato?.dataInicio?.toISOString(),
              dataFim: fat.contrato?.dataFim?.toISOString(),
              parcelas: fat.contrato?.parcelas,
              valorBase: fat.contrato?.valorBase,
              porVida: fat.contrato?.porVida,
              recorrente: fat.contrato?.recorrente,
              status: fat.contrato?.status,
              faturadoPor: fat.contrato?.faturadoPor,
              esocial: fat.contrato?.esocial,
              laudos: fat.contrato?.laudos,
            },
          };
        }
      }

      return {
        id: p.idProjecao,
        tipo: "PROJECAO",
        competencia: p.competencia,
        valor: Number(p.valorPrevisto),
        vidas: p.vidas ?? undefined,
        status: p.status,
        empresa: p.contrato?.unidade?.empresa?.nome,
        unidade: p.contrato?.unidade?.nomeFantasia,
        cnpj: p.contrato?.unidade?.documento,
        cidade: p.contrato?.unidade?.cidade,
        uf: p.contrato?.unidade?.uf,
        faturadoPor: p.contrato?.faturadoPor,
        esocial: p.contrato?.esocial ?? undefined,
        laudos: p.contrato?.laudos ?? undefined,
        vencimento: p.contrato.diaVencimento ?? undefined,
        contatos: p.contrato?.unidade?.contatos.map((uc) => ({
          id: uc.contato.idContato,
          nome: uc.contato.nome,
          email: uc.contato.email,
          emailSecundario: uc.contato.emailSecundario,
          telefoneWpp: uc.contato.telefoneWpp,
          telefoneFixo: uc.contato.telefoneFixo,
        })) ?? [],
        contrato: {
          id: p.contrato?.idContrato,
          observacao: p.contrato?.observacao,
          dataInicio: p.contrato?.dataInicio?.toISOString(),
          dataFim: p.contrato?.dataFim?.toISOString(),
          parcelas: p.contrato?.parcelas,
          valorBase: p.contrato?.valorBase,
          porVida: p.contrato?.porVida,
          recorrente: p.contrato?.recorrente,
          status: p.contrato?.status,
          faturadoPor: p.contrato?.faturadoPor,
          esocial: p.contrato?.esocial,
          laudos: p.contrato?.laudos,
        },
      };
    });

    return resultado;
  },
};
