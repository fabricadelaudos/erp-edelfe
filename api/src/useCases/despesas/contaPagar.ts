import { prisma } from '../../config/prisma-client';
import { registrarEvento } from '../../shared/utils/registrarEvento';

function adicionarDias(data: Date, dias: number) {
  const nova = new Date(data);
  nova.setDate(nova.getDate() + dias);
  return nova;
}

export const buscarContaPagar = {
  async execute(id: number) {
    return await prisma.contapagar.findUnique({
      where: { idContaPagar: id },
      include: { parcelasconta: true }
    });
  }
};

export const buscarContasPagar = {
  async execute() {
    return await prisma.contapagar.findMany({
      orderBy: [{ vencimento: 'asc' }, { status: 'asc' }],
      include: { parcelasconta: true, fornecedor: true, planoConta: { include: { categoria: true } }, banco: true }
    });
  }
};

export const criarContaPagar = {
  async execute(data: any) {
    const { idUsuario, idContaPagar, ...dados } = data;

    if (dados.dataEmissao) dados.dataEmissao = new Date(dados.dataEmissao);
    if (dados.vencimento) dados.vencimento = new Date(dados.vencimento);

    const conta = await prisma.contapagar.create({ data: dados });

    const parcelas = [];
    const valorTotal = parseFloat(dados.valorTotal);
    const primeiraParcela = new Date(dados.vencimento);

    for (let i = 0; i < dados.parcelas; i++) {
      const vencimento = adicionarDias(primeiraParcela, dados.intervalo * i);
      const valor = dados.recorrente
        ? valorTotal
        : parseFloat((valorTotal / dados.parcelas).toFixed(2));

      parcelas.push({
        fkContaPagarId: conta.idContaPagar,
        numero: i + 1,
        vencimento,
        valor
      });
    }

    await prisma.parcelacontapagar.createMany({ data: parcelas });

    await registrarEvento({
      idUsuario,
      tipo: 'criar',
      entidade: 'contaPagar',
      entidadeId: conta.idContaPagar,
      descricao: `Conta a pagar criada no valor de R$ ${valorTotal.toFixed(2)}`,
      dadosDepois: conta
    });

    return await prisma.contapagar.findUnique({
      where: { idContaPagar: conta.idContaPagar },
      include: { parcelasconta: true }
    });
  }
};

export const editarContaPagar = {
  async execute(id: number, data: { idUsuario: number; descricao?: string }) {
    const { idUsuario, descricao } = data;

    const contaAntes = await prisma.contapagar.findUnique({
      where: { idContaPagar: id },
      include: { parcelasconta: true }
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
      include: { parcelasconta: true }
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