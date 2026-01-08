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