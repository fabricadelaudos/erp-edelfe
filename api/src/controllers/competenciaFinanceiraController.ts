import { Request, Response } from "express";
import { buscarCompetenciaAtual, buscarCompetenciasFinanceirasUseCase, criarCompetenciaFinanceiraUseCase, editarCompetenciaFinanceiraUseCase, excluirCompetenciaFinanceiraUseCase } from "../useCases/competenciaFinanceira";

export const buscarCompetenciaAtualController = async (_req: Request, res: Response) => {
  try {
    const competencia = await buscarCompetenciaAtual.execute();
    if (!competencia) {
      return res.status(404).json({ error: "Nenhuma competência encontrada." });
    }
    return res.json(competencia);
  } catch (error) {
    console.error("Erro ao buscar competência atual:", error);
    return res.status(500).json({ error: "Erro ao buscar competência atual." });
  }
};

export const buscarCompetenciasFinanceiras = async (req: Request, res: Response) => {
  const dados = await buscarCompetenciasFinanceirasUseCase.execute();
  res.json(dados);
};

export const criarCompetenciaFinanceira = async (req: Request, res: Response) => {
  try {
    const nova = await criarCompetenciaFinanceiraUseCase.execute(req.body, req.user);
    res.status(201).json(nova);
  } catch (error: any) {
    console.error("Erro ao criar competência financeira:", error.message);
    res.status(400).json({ error: error.message || "Erro ao criar competência" });
  }
};

export const editarCompetenciaFinanceira = async (req: Request, res: Response) => {
  try {
    const atualizada = await editarCompetenciaFinanceiraUseCase.execute(Number(req.params.id), req.body, req.user);
    res.json(atualizada);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Erro ao editar competência" });
  }
};

export const excluirCompetenciaFinanceira = async (req: Request, res: Response) => {
  try {
    await excluirCompetenciaFinanceiraUseCase.execute(Number(req.params.id), req.user);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Erro ao excluir competência" });
  }
};