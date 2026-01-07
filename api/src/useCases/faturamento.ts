import { Prisma } from "@prisma/client";
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
  boletoEmitido?: boolean;
  emailEnviado?: boolean;
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
        numeroNota: data.numeroNota,
        boletoEmitido: data.boletoEmitido ?? false,
        emailEnviado: data.emailEnviado ?? false,
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
        boletoEmitido: dados.boletoEmitido ?? false,
        emailEnviado: dados.emailEnviado ?? false,
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

export const editarFaturamentosEmMassa = {
  async execute(lista: { id: number; dados: any }[], user: any) {
    if (!Array.isArray(lista) || lista.length === 0) {
      throw new Error("Nenhum faturamento informado para edição");
    }

    return await prisma.$transaction(async (tx) => {
      const resultados: any[] = [];

      for (const item of lista) {
        const existente = await tx.faturamento.findUnique({
          where: { idFaturamento: item.id },
        });

        if (!existente) {
          throw new Error(`Faturamento ${item.id} não encontrado`);
        }

        let pagoEm: Date | null = existente.pagoEm;
        let competenciaPagamento: string | null = existente.competenciaPagamento;

        if (item.dados.status === "PAGA") {
          const agora = new Date();
          pagoEm = agora;
          competenciaPagamento = `${String(agora.getMonth() + 1).padStart(2, "0")}/${agora.getFullYear()}`;
        } else {
          pagoEm = null;
          competenciaPagamento = null;
        }

        const atualizado = await tx.faturamento.update({
          where: { idFaturamento: item.id },
          data: {
            numeroNota: item.dados.numeroNota ?? existente.numeroNota,
            valorBase: item.dados.valorBase ?? existente.valorBase,
            impostoPorcentagem: item.dados.impostoPorcentagem ?? existente.impostoPorcentagem,
            impostoValor: item.dados.impostoValor ?? existente.impostoValor,
            valorTotal: item.dados.valorTotal ?? existente.valorTotal,
            vidas: item.dados.vidas ?? existente.vidas,
            status: item.dados.status ?? existente.status,
            pagoEm,
            competenciaPagamento,
            boletoEmitido: item.dados.boletoEmitido ?? false,
            emailEnviado: item.dados.emailEnviado ?? false,
          },
        });

        await registrarEvento({
          idUsuario: user?.idUsuario,
          tipo: "EDICAO",
          descricao: `Editou o faturamento ${item.id}`,
          entidade: "faturamento",
          entidadeId: item.id,
          dadosAntes: existente,
          dadosDepois: atualizado,
        });

        resultados.push(atualizado);
      }

      return resultados;
    }, { timeout: 60000, maxWait: 60000 });
  },
};

export const editarProjecao = {
  async execute(lista: { id: number; dados: any }[], user: any) {
    if (!Array.isArray(lista) || lista.length === 0) {
      throw new Error("Nenhuma projeção informada para edição");
    }

    return await prisma.$transaction(async (tx) => {
      const resultados: any[] = [];

      for (const item of lista) {
        const existente = await tx.projecao.findUnique({
          where: { idProjecao: item.id },
        });

        if (!existente) {
          throw new Error(`Projeção ${item.id} não encontrada`);
        }

        let resultado;

        if (item.dados.status === "FATURADO") {
          resultado = await gerarFaturamentoDeProjecao.execute(item.id, user, tx);
        } else {
          // 🔹 Apenas edita a projeção
          resultado = await tx.projecao.update({
            where: { idProjecao: item.id },
            data: {
              valorPrevisto: item.dados.valorPrevisto ?? existente.valorPrevisto,
              vidas: item.dados.vidas ?? existente.vidas,
              status: item.dados.status ?? existente.status,
            },
          });
        }

        await registrarEvento({
          idUsuario: user?.idUsuario,
          tipo: "EDICAO",
          descricao: `Editou a projeção ${item.id}`,
          entidade: "projecao",
          entidadeId: item.id,
          dadosAntes: existente,
          dadosDepois: resultado,
        });

        resultados.push(resultado);
      }

      return resultados;
    }, { timeout: 60000, maxWait: 60000 });
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
                unidadecontato: true,
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
    const competenciaFinanceira = await prisma.competenciafinanceira.findUnique({
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
                unidadecontato: true,
              },
            },
          },
        },
      },
    });

    if (pendentes.length === 0) {
      const faturamentosExistentes = await buscarFaturamentoCompetencia.execute(competencia);
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
                unidadecontato: true
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

export const buscarFaturamentosEProjecoes = {
  async execute() {
    const empresaAtivaWhere = {
      contrato: {
        unidade: {
          empresa: {
            ativo: true,
          },
        },
      },
    };

    const projecoes = await prisma.projecao.findMany({
      where: empresaAtivaWhere,
      orderBy: { competencia: "asc" },
      include: {
        contrato: {
          include: {
            unidade: {
              include: {
                empresa: true,
                unidadecontato: {
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
                unidadecontato: {
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
            valorPrevisto: Number(fat.valorTotal),
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
            endereco: fat.contrato?.unidade?.endereco,
            numero: fat.contrato?.unidade?.numero,
            bairro: fat.contrato?.unidade?.bairro,
            cidade: fat.contrato?.unidade?.cidade,
            uf: fat.contrato?.unidade?.uf,
            cep: fat.contrato?.unidade?.cep,
            faturadoPor: fat.contrato?.faturadoPor,
            esocial: fat.contrato?.esocial ?? undefined,
            laudos: fat.contrato?.laudos ?? undefined,
            pagoEm: fat.pagoEm?.toISOString() ?? undefined,
            vencimento: p.contrato.diaVencimento ?? undefined,
            boletoEmitido: fat.boletoEmitido ?? false,
            emailEnviado: fat.emailEnviado ?? false,
            contatos: fat.contrato?.unidade?.unidadecontato.map((uc) => ({
              id: uc.contato.idContato,
              nome: uc.contato.nome,
              email: uc.contato.email,
              emailSecundario: uc.contato.emailSecundario,
              telefoneWpp: uc.contato.telefoneWpp,
              telefoneFixo: uc.contato.telefoneFixo,
            })) ?? [],
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
        valorPrevisto: Number(p.valorPrevisto),
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
        contatos: p.contrato?.unidade?.unidadecontato.map((uc) => ({
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

export const gerarFaturamentoDeProjecao = {
  async execute(idProjecao: number, user: any, tx: Prisma.TransactionClient = prisma) {
    const projecao = await tx.projecao.findUnique({
      where: { idProjecao },
      include: {
        contrato: {
          include: {
            unidade: true,
          },
        },
      },
    });

    if (!projecao) throw new Error("Projeção não encontrada");
    if (!projecao.contrato) throw new Error("Contrato não vinculado à projeção");

    // 🔹 Verifica se existe competência financeira
    const competenciaFinanceira = await tx.competenciafinanceira.findUnique({
      where: { competencia: projecao.competencia },
    });

    if (!competenciaFinanceira) {
      throw new Error(
        `Nenhuma competência financeira cadastrada!`
      );
    }

    // 🔹 Regra de imposto: ISS ou normal
    const valorBase = Number(projecao.valorPrevisto ?? 0);
    const retemIss = projecao.contrato.unidade.retemIss;

    const impostoPorcentagem = Number(
      retemIss ? competenciaFinanceira.iss : competenciaFinanceira.imposto
    );

    const impostoValor = valorBase * (impostoPorcentagem / 100);
    const valorTotal = valorBase - impostoValor;

    // 🔹 Cria faturamento
    const faturamento = await tx.faturamento.create({
      data: {
        fkContratoId: projecao.fkContratoId,
        fkProjecaoId: projecao.idProjecao,
        fkCompetenciaFinanceiraId: competenciaFinanceira.idCompetenciaFinanceira,
        competencia: projecao.competencia,
        valorBase,
        impostoPorcentagem,
        impostoValor,
        valorTotal,
        status: "ABERTA",
        vidas: projecao.vidas ?? 0,
        numeroNota: "",
        boletoEmitido: false,
        emailEnviado: false,
      },
    });

    // 🔹 Marca projeção como faturada
    await tx.projecao.update({
      where: { idProjecao },
      data: { status: "FATURADO" },
    });

    // 🔹 Evento
    await registrarEvento({
      idUsuario: user?.idUsuario,
      tipo: "GERACAO",
      descricao: `Gerou faturamento da projeção ${idProjecao}`,
      entidade: "faturamento",
      entidadeId: faturamento.idFaturamento,
      dadosAntes: projecao,
      dadosDepois: faturamento,
    });

    return faturamento;
  },
};

export const emitirBoleto = {
  async execute(
    idFaturamento: number,
    boletoEmitido: boolean,
    user: any,
    tx: Prisma.TransactionClient = prisma
  ) {
    const faturamentoAntes = await tx.faturamento.findUnique({
      where: { idFaturamento },
    });

    if (!faturamentoAntes) {
      throw new Error("Faturamento não encontrado");
    }

    const faturamentoDepois = await tx.faturamento.update({
      where: { idFaturamento },
      data: { boletoEmitido },
    });

    await registrarEvento({
      idUsuario: user?.idUsuario,
      tipo: "EMISSAO",
      descricao: boletoEmitido
        ? `Marcou boleto como emitido no faturamento ${idFaturamento}`
        : `Desmarcou boleto como emitido no faturamento ${idFaturamento}`,
      entidade: "faturamento",
      entidadeId: idFaturamento,
      dadosAntes: faturamentoAntes,
      dadosDepois: faturamentoDepois,
    });
  },
};

export const enviarEmailFaturamento = {
  async execute(
    idFaturamento: number,
    emailEnviado: boolean,
    user: any,
    tx: Prisma.TransactionClient = prisma
  ) {
    const faturamentoAntes = await tx.faturamento.findUnique({
      where: { idFaturamento },
    });

    if (!faturamentoAntes) {
      throw new Error("Faturamento não encontrado");
    }

    const faturamentoDepois = await tx.faturamento.update({
      where: { idFaturamento },
      data: { emailEnviado },
    });

    await registrarEvento({
      idUsuario: user?.idUsuario,
      tipo: "ENVIO_EMAIL",
      descricao: emailEnviado
        ? `Marcou e-mail como enviado no faturamento ${idFaturamento}`
        : `Desmarcou e-mail como enviado no faturamento ${idFaturamento}`,
      entidade: "faturamento",
      entidadeId: idFaturamento,
      dadosAntes: faturamentoAntes,
      dadosDepois: faturamentoDepois,
    });
  },
};