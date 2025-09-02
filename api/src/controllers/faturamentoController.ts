import { Request, Response } from "express";
import { buscarFaturamentoCompetencia, buscarFaturamentosPorContrato, criarFaturamento, gerarFaturamento } from "../useCases/faturamento";

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
  const { competencia } = req.body;

  if (!competencia) {
    return res.status(400).json({ error: "Competência é obrigatória." });
  }

  try {
    const faturamentos = await gerarFaturamento.execute(competencia);
    return res.json(faturamentos);
  } catch (error: any) {
    console.error("Erro ao gerar faturamento:", error);
    return res.status(500).json({ error: error.message || "Erro interno no servidor" });
  }
};