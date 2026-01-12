import { Request, Response } from "express";
import { buscarFaturamentoCompetencia, buscarFaturamentosEProjecoes, buscarFaturamentosPorContrato, criarFaturamento, editarFaturamento, editarFaturamentosEmMassa, editarProjecao, emitirBoleto, emitirNota, enviarEmailFaturamento, gerarFaturamento } from "../useCases/faturamento";

export const buscarFaturamentosPorContratoController = async (req: Request, res: Response) => {
  try {
    const idContrato = Number(req.params.idContrato);
    const faturamentos = await buscarFaturamentosPorContrato.execute(idContrato);
    return res.json(faturamentos);
  } catch (e) {
    console.error("Erro ao buscar faturamentos:", e);
    return res.status(500).json({ error: "Erro ao buscar faturamentos." });
  }
};

export const criarFaturamentoController = async (req: Request, res: Response) => {
  try {
    const faturamento = await criarFaturamento.execute(req.body);
    return res.status(201).json(faturamento);
  } catch (e) {
    console.error("Erro ao criar faturamento:", e);
    return res.status(500).json({ error: "Erro ao criar faturamento." });
  }
};

export const editarFaturamentoController = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const dados = req.body;
  const user = req.user;

  try {
    const faturamento = await editarFaturamento.execute(id, dados, user);
    res.json(faturamento);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const editarFaturamentosEmMassaController = async (req: Request, res: Response) => {
  const user = req.user;

  try {
    const lista = req.body;
    if (!Array.isArray(lista)) {
      throw new Error("O corpo da requisição deve ser uma lista de faturamentos");
    }

    const resultado = await editarFaturamentosEmMassa.execute(lista, user);
    res.json(resultado);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const editarProjecaoController = async (req: Request, res: Response) => {
  const user = req.user;

  try {
    let resultado;

    // Caso venha apenas 1 id pela rota (modo antigo)
    if (req.params.id) {
      const id = Number(req.params.id);
      const dados = req.body;

      resultado = await editarProjecao.execute([{ id, dados }], user);
    } else {
      // Caso venha lista no body (modo em massa)
      const lista = req.body; // deve ser [{ id, dados: {...} }, { id, dados: {...} }]
      if (!Array.isArray(lista)) {
        throw new Error("O corpo da requisição deve ser uma lista de projeções");
      }

      resultado = await editarProjecao.execute(lista, user);
    }

    res.json(resultado);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const buscarFaturamentoPorCompetenciaController = async (req: Request, res: Response) => {
  const { competencia } = req.params;

  try {
    const lista = await buscarFaturamentoCompetencia.execute(competencia);

    if (lista.length === 0) {
      return res.status(404).json({
        error: `Nenhum faturamento encontrado para a competência ${competencia}.`,
      });
    }

    return res.json(lista);
  } catch (error: any) {
    console.error("Erro ao buscar faturamentos:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const gerarFaturamentoController = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  try {
    const resultado = await gerarFaturamento.execute("");
    res.status(201).json(resultado);
  } catch (error) {
    console.error("Erro ao gerar faturamento da projeção:", error);
    res.status(500).json({ error: "Erro ao gerar faturamento da projeção" });
  }
};

export const buscarFaturamentosEProjecoesController = async (req: Request, res: Response) => {
  try {
    const lista = await buscarFaturamentosEProjecoes.execute();
    return res.json(lista);
  } catch (e) {
    console.error("Erro ao buscar faturamentos e projeções:", e);
    return res.status(500).json({ error: "Erro ao buscar faturamentos e projeções." });
  }
};

export const toggleBoletoEmitidoController = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const user = req.user;
  const { boletoEmitido } = req.body;

  try {
    await emitirBoleto.execute(id, boletoEmitido, user);
    return res.status(204).send();
  } catch (e) {
    console.error("Erro ao emitir boleto:", e);
    return res.status(500).json({ error: "Erro ao emitir boleto." });
  }
};

export const toggleEmailEnviadoController = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const user = req.user;
  const { emailEnviado } = req.body; // boolean

  try {
    await enviarEmailFaturamento.execute(id, emailEnviado, user);
    return res.status(204).send();
  } catch (e) {
    console.error("Erro ao marcar envio de e-mail:", e);
    return res.status(500).json({ error: "Erro ao marcar envio de e-mail." });
  }
};

export const toggleNotaEmitidaController = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const user = req.user;
  const { notaEmitida } = req.body; // boolean

  try {
    await emitirNota.execute(id, notaEmitida, user);
    return res.status(204).send();
  } catch (e) {
    console.error("Erro ao marcar envio de e-mail:", e);
    return res.status(500).json({ error: "Erro ao marcar envio de e-mail." });
  }
};
