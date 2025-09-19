import { Router } from "express";
import { authorize } from "../middlewares/authorize";
import { getContratosProximosController, getDespesasCategoriaController, getDespesasRecentesController, getEvolucaoFaturamentoController, getFaturamentoAnualController, getFaturamentosRecentesController, getKpisController, getProjecoesController, getReceitaVsDespesaController } from "../controllers/dashBoardController";

const dashboardRoutes = Router();

// KPIs do topo (cards)
dashboardRoutes.get("/kpis", authorize(), getKpisController);

// Receita vs Despesa (gráfico)
dashboardRoutes.get("/receita-vs-despesa", authorize(), getReceitaVsDespesaController);

// Distribuição de despesas por categoria
dashboardRoutes.get("/despesas-categoria", authorize(), getDespesasCategoriaController);

// Últimos faturamentos
dashboardRoutes.get("/faturamentos-recentes", authorize(), getFaturamentosRecentesController);

// Últimas despesas
dashboardRoutes.get("/despesas-recentes", authorize(), getDespesasRecentesController);

// Evolução do faturamento
dashboardRoutes.post("/evolucao-faturamento", authorize(), getFaturamentoAnualController);

// Projeções
dashboardRoutes.post("/projecoes", authorize(), getProjecoesController);

// Contratos próximos do vencimento
dashboardRoutes.post("/contratos-proximos", authorize(), getContratosProximosController);

export default dashboardRoutes;
