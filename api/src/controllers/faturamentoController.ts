import { Request, Response } from "express";
import { buscarFaturamentoCompetencia, buscarFaturamentosEProjecoes, buscarFaturamentosPorContrato, criarFaturamento, editarFaturamento, gerarFaturamento } from "../useCases/faturamento";

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
    const resultado = await gerarFaturamento.execute(id);
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
