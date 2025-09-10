import { prisma } from '../../config/prisma-client';
import { registrarEvento } from '../../shared/utils/registrarEvento';

function adicionarDias(data: Date, dias: number) {
  const nova = new Date(data);
  nova.setDate(nova.getDate() + dias);
  return nova;
}

export const buscarContaPagar = {
  async execute(id: number) {
    return await prisma.contaPagar.findUnique({
      where: { idContaPagar: id },
      include: { parcelasConta: true }
    });
  }
};

export const buscarContasPagar = {
  async execute() {
    return await prisma.contaPagar.findMany({
      orderBy: { vencimento: 'desc' },
      include: { parcelasConta: true }
    });
  }
};

export const criarContaPagar = {
  async execute(data: any) {
    const { idUsuario, idContaPagar, ...dados } = data;

    const conta = await prisma.contaPagar.create({ data: dados });

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

    await prisma.parcelaContaPagar.createMany({ data: parcelas });

    await registrarEvento({
      idUsuario,
      tipo: 'criar',
      entidade: 'contaPagar',
      entidadeId: conta.idContaPagar,
      descricao: `Conta a pagar criada no valor de R$ ${valorTotal.toFixed(2)}`,
      dadosDepois: conta
    });

    return await prisma.contaPagar.findUnique({
      where: { idContaPagar: conta.idContaPagar },
      include: { parcelasConta: true }
    });
  }
};

export const editarContaPagar = {
  async execute(id: number, data: any) {
    const { idUsuario, ...dados } = data;
    const contaAntes = await prisma.contaPagar.findUnique({ where: { idContaPagar: id }, include: { parcelasConta: true } });

    const conta = await prisma.contaPagar.update({
      where: { idContaPagar: id },
      data: dados
    });

    await registrarEvento({
      idUsuario,
      tipo: 'editar',
      entidade: 'contaPagar',
      entidadeId: id,
      descricao: `Conta a pagar editada.`,
      dadosAntes: contaAntes,
      dadosDepois: conta
    });

    return await prisma.contaPagar.findUnique({
      where: { idContaPagar: id },
      include: { parcelasConta: true }
    });
  }
};

// Parcelas
export const buscarParcela = {
  async execute(id: number) {
    return await prisma.parcelaContaPagar.findUnique({
      where: { idParcela: id },
    });
  }
};

export const atualizarParcela = {
  async execute(id: number, data: any) {
    const { idUsuario, ...dados } = data;
    const antes = await prisma.parcelaContaPagar.findUnique({ where: { idParcela: id } });

    const atualizada = await prisma.parcelaContaPagar.update({
      where: { idParcela: id },
      data: dados
    });

    await registrarEvento({
      idUsuario,
      tipo: 'editar',
      entidade: 'parcelaContaPagar',
      entidadeId: id,
      descricao: `Parcela ${atualizada.numero} atualizada com status '${atualizada.status}'`,
      dadosAntes: antes,
      dadosDepois: atualizada
    });

    return atualizada;
  }
};