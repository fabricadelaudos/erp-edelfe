import { Request, Response } from "express";
import { getContratosProximos, getDespesasCategoria, getDespesasRecentes, getEvolucaoFaturamento, getFaturamentosRecentes, getKpis, getProjecoes, getReceitaVsDespesa } from "../useCases/dashBoard";

export const getKpisController = async (req: Request, res: Response) => {
  try {
    const { periodo, competencia, ano } = req.query;
    const dados = await getKpis.execute({
      periodo: periodo as "mensal" | "anual",
      competencia: competencia as string,
      ano: ano ? parseInt(ano as string) : undefined,
    });

    return res.json(dados);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

export const getReceitaVsDespesaController = async (req: Request, res: Response) => {
  try {
    const { periodo, competencia, ano } = req.query;
    const dados = await getReceitaVsDespesa.execute({
      periodo: periodo as "mensal" | "anual",
      competencia: competencia as string,
      ano: ano ? parseInt(ano as string) : undefined,
    });

    return res.json(dados);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

export const getDespesasCategoriaController = async (req: Request, res: Response) => {
  try {
    const { periodo, competencia, ano } = req.query;

    const dados = await getDespesasCategoria.execute({
      periodo: periodo as "mensal" | "anual",
      competencia: competencia as string,
      ano: ano ? parseInt(ano as string) : undefined,
    });

    return res.json(dados);
  } catch (err: any) {
    console.error("Erro em getDespesasCategoriaController:", err);
    return res.status(500).json({ error: err.message });
  }
};

export const getFaturamentosRecentesController = async (req: Request, res: Response) => {
  try {
    const { limit } = req.query;

    const dados = await getFaturamentosRecentes.execute(
      limit ? parseInt(limit as string) : 10
    );

    return res.json(dados);
  } catch (err: any) {
    console.error("Erro em getFaturamentosRecentesController:", err);
    return res.status(500).json({ error: err.message });
  }
};

export const getDespesasRecentesController = async (req: Request, res: Response) => {
  try {
    const { limit } = req.query;

    const dados = await getDespesasRecentes.execute(
      limit ? parseInt(limit as string) : 10
    );

    return res.json(dados);
  } catch (err: any) {
    console.error("Erro em getDespesasRecentesController:", err);
    return res.status(500).json({ error: err.message });
  }
};

export const getEvolucaoFaturamentoController = async (req: Request, res: Response) => {
  try {
    const { ano, periodo } = req.body;
    if (!periodo) return res.status(400).json({ error: "Período é obrigatório" });

    const dados = await getEvolucaoFaturamento.execute({
      ano: ano ? String(ano) : undefined,
      periodo,
    });

    return res.json(dados);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

export const getProjecoesController = async (req: Request, res: Response) => {
  try {
    const dados = await getProjecoes.execute(req.body);
    res.json(dados);
  } catch (err: any) {
    console.error("Erro em getProjecoes:", err);
    res.status(500).json({ error: "Erro ao carregar projeções" });
  }
};

export const getContratosProximosController = async (req: Request, res: Response) => {
  try {
    const dados = await getContratosProximos.execute();
    res.json(dados);
  } catch (err: any) {
    console.error("Erro em getContratosProximos:", err);
    res.status(500).json({ error: "Erro ao carregar contratos próximos" });
  }
};