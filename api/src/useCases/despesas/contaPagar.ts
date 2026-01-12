import { prisma } from '../../config/prisma-client';
import { registrarEvento } from '../../shared/utils/registrarEvento';

function adicionarDias(data: Date, dias: number) {
  const nova = new Date(data);
  nova.setDate(nova.getDate() + dias);
  return nova;
}

function addMonthsKeepDay(date: Date, monthsToAdd: number) {
  const base = new Date(date);

  const targetYear = base.getFullYear();
  const targetMonth = base.getMonth() + monthsToAdd;

  const day = base.getDate();

  // vai pro dia 1 do mês alvo
  const d = new Date(targetYear, targetMonth, 1, 12, 0, 0);

  // último dia do mês alvo
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();

  // mantém o dia se existir, senão usa o último dia
  d.setDate(Math.min(day, lastDay));

  // mantém horário “limpo”
  d.setHours(0, 0, 0, 0);

  return d;
}


export const buscarContaPagar = {
  async execute(id: number) {
    return await prisma.contapagar.findUnique({
      where: { idContaPagar: id },
      include: { parcelacontapagar: true }
    });
  }
};

export const buscarContasPagar = {
  async execute() {
    return await prisma.contapagar.findMany({
      orderBy: [{ vencimento: 'asc' }, { status: 'asc' }],
      include: { parcelacontapagar: true, fornecedor: true, planocontasubcategoria: { include: { planocontacategoria: true } }, banco: true }
    });
  }
};

export const criarContaPagar = {
  async execute(data: any) {
    const { idUsuario, idContaPagar, ...dados } = data;

    if (dados.dataEmissao) dados.dataEmissao = new Date(dados.dataEmissao);
    if (dados.vencimento) dados.vencimento = new Date(dados.vencimento);

    const conta = await prisma.contapagar.create({ data: dados });

    const parcelas: any[] = [];
    const valorTotal = Number(dados.valorTotal ?? 0);
    const qtdParcelas = Number(dados.parcelas ?? 1);
    const primeiraParcela = new Date(dados.vencimento);

    // ✅ Divide mantendo soma correta (evita centavos sobrando)
    const valorBase = dados.recorrente
      ? valorTotal
      : Number((valorTotal / qtdParcelas).toFixed(2));

    let soma = 0;

    for (let i = 0; i < qtdParcelas; i++) {
      const vencimento = addMonthsKeepDay(primeiraParcela, i);

      let valor = valorBase;

      if (!dados.recorrente) {
        // última parcela ajusta diferença por arredondamento
        if (i === qtdParcelas - 1) {
          valor = Number((valorTotal - soma).toFixed(2));
        }
        soma = Number((soma + valor).toFixed(2));
      }

      parcelas.push({
        fkContaPagarId: conta.idContaPagar,
        numero: i + 1,
        vencimento,
        valor,
      });
    }

    await prisma.parcelacontapagar.createMany({ data: parcelas });

    await registrarEvento({
      idUsuario,
      tipo: "criar",
      entidade: "contaPagar",
      entidadeId: conta.idContaPagar,
      descricao: `Conta a pagar criada no valor de R$ ${valorTotal.toFixed(2)}`,
      dadosDepois: conta,
    });

    return await prisma.contapagar.findUnique({
      where: { idContaPagar: conta.idContaPagar },
      include: { parcelacontapagar: true },
    });
  },
};

export const editarContaPagar = {
  async execute(id: number, data: { idUsuario: number; descricao?: string }) {
    const { idUsuario, descricao } = data;

    const contaAntes = await prisma.contapagar.findUnique({
      where: { idContaPagar: id },
      include: { parcelacontapagar: true }
    });

    const conta = await prisma.contapagar.update({
      where: { idContaPagar: id },
      data: {
        ...(descricao !== undefined && { descricao })
      }
    });

    await registrarEvento({
      idUsuario,
      tipo: "editar",
      entidade: "contaPagar",
      entidadeId: id,
      descricao: `Conta a pagar editada (descricao).`,
      dadosAntes: contaAntes,
      dadosDepois: conta
    });

    return await prisma.contapagar.findUnique({
      where: { idContaPagar: id },
      include: { parcelacontapagar: true }
    });
  }
};

type InputContaPagar = {
  idContaPagar: number;
  idUsuario?: number | null;
};

export const excluirContaPagar = {
  async execute({ idContaPagar, idUsuario }: InputContaPagar) {
    if (!idContaPagar || Number.isNaN(idContaPagar)) {
      throw new Error("idContaPagar inválido");
    }

    const conta = await prisma.contapagar.findUnique({
      where: { idContaPagar },
      select: { idContaPagar: true },
    });

    if (!conta) {
      throw new Error("Conta a pagar não encontrada");
    }

    // Regra recomendada: impedir excluir conta se tem parcela paga
    const temPaga = await prisma.parcelacontapagar.count({
      where: { fkContaPagarId: idContaPagar, status: "PAGA" as any },
    });

    if (temPaga > 0) {
      throw new Error("Não é permitido excluir a conta: existem parcelas pagas");
      // Se você quiser permitir: remova esse throw
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1) deleta parcelas
      await tx.parcelacontapagar.deleteMany({
        where: { fkContaPagarId: idContaPagar },
      });

      // 2) deleta conta
      await tx.contapagar.delete({
        where: { idContaPagar },
      });

      // registrarEvento?.({
      //   idUsuario,
      //   acao: "EXCLUIR_CONTA_PAGAR",
      //   detalhes: `Conta ${idContaPagar} removida com todas as parcelas`,
      // });

      return {
        ok: true,
        deletedContaId: idContaPagar,
        message: "Conta excluída com todas as parcelas.",
      };
    });

    return result;
  }
};

// Parcelas
export const buscarParcela = {
  async execute(id: number) {
    return await prisma.parcelacontapagar.findUnique({
      where: { idParcela: id },
    });
  }
};

export const atualizarParcela = {
  async execute(id: number, data: { idUsuario: number; valor?: number; vencimento?: Date }) {
    const { idUsuario, valor, vencimento } = data;

    const antes = await prisma.parcelacontapagar.findUnique({
      where: { idParcela: id }
    });

    const atualizada = await prisma.parcelacontapagar.update({
      where: { idParcela: id },
      data: {
        ...(valor !== undefined && { valor }),
        ...(vencimento !== undefined && { vencimento })
      }
    });

    await registrarEvento({
      idUsuario,
      tipo: "editar",
      entidade: "parcelaContaPagar",
      entidadeId: id,
      descricao: `Parcela ${atualizada.numero} atualizada. Valor: ${atualizada.valor}, Vencimento: ${atualizada.vencimento.toISOString().split("T")[0]}`,
      dadosAntes: antes,
      dadosDepois: atualizada
    });

    return atualizada;
  }
};

export const confirmarPagamento = {
  async execute(id: number, user: any) {
    const parcelaAntes = await prisma.parcelacontapagar.findUnique({
      where: { idParcela: id },
      include: {
        contapagar: {
          include: {
            fornecedor: true
          }
        }
      }
    });

    const parcela = await prisma.parcelacontapagar.update({
      where: { idParcela: id },
      data: { status: 'PAGA', pagoEm: new Date() }
    });

    await registrarEvento({
      idUsuario: user.idUsuario,
      tipo: 'editar',
      entidade: 'parcelaContaPagar',
      entidadeId: id,
      descricao: `Pagamento confirmado para parcela ${id} da conta ${parcelaAntes?.contapagar?.numeroDocumento ?? ''} (${parcelaAntes?.contapagar?.fornecedor?.nome ?? ''})`,
      dadosAntes: parcelaAntes,
      dadosDepois: parcela
    });

    return parcela;
  }
};

type InputParcelaContaPagar = {
  idParcela: number;
  idUsuario?: number | null;
};

export const excluirParcelaContaPagar = {
  async execute({ idParcela, idUsuario }: InputParcelaContaPagar) {
    if (!idParcela || Number.isNaN(idParcela)) {
      throw new Error("idParcela inválido");
    }


    // Busca a parcela para saber conta e status
    const parcela = await prisma.parcelacontapagar.findUnique({
      where: { idParcela },
      select: {
        idParcela: true,
        status: true,
        fkContaPagarId: true,
        numero: true,
      },
    });

    if (!parcela) {
      throw new Error("Parcela não encontrada");
    }

    // Regra recomendada: não excluir parcela paga
    if (parcela.status === "PAGA") {
      throw new Error("Não é permitido excluir uma parcela paga");
    }

    const fkContaPagarId = parcela.fkContaPagarId;

    const result = await prisma.$transaction(async (tx) => {
      // 1) Exclui a parcela
      await tx.parcelacontapagar.delete({
        where: { idParcela },
      });

      // 2) Verifica quantas parcelas sobraram
      const restantes = await tx.parcelacontapagar.count({
        where: { fkContaPagarId },
      });

      // 3) Se não sobrou nenhuma, exclui a conta
      if (restantes === 0) {
        await tx.contapagar.delete({
          where: { idContaPagar: fkContaPagarId },
        });

        // registrarEvento?.({
        //   idUsuario,
        //   acao: "EXCLUIR_CONTA_PAGAR_AUTO",
        //   detalhes: `Conta ${fkContaPagarId} removida pois ficou sem parcelas`,
        // });

        return {
          ok: true,
          deletedParcelaId: idParcela,
          deletedContaId: fkContaPagarId,
          message: "Parcela excluída e conta removida (não havia mais parcelas).",
        };
      }

      // registrarEvento?.({
      //   idUsuario,
      //   acao: "EXCLUIR_PARCELA_CONTA_PAGAR",
      //   detalhes: `Parcela ${idParcela} (nº ${parcela.numero}) removida da conta ${fkContaPagarId}`,
      // });

      return {
        ok: true,
        deletedParcelaId: idParcela,
        deletedContaId: null,
        message: "Parcela excluída com sucesso.",
      };
    });

    return result;
  }
}