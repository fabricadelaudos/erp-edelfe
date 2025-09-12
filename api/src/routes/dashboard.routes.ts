import { Router } from "express";
import { authorize } from "../middlewares/authorize";
import { getDespesasCategoriaController, getDespesasRecentesController, getFaturamentosRecentesController, getKpisController, getReceitaVsDespesaController } from "../controllers/dashBoardController";

const router = Router();

// 🔹 KPIs do topo (cards)
router.get("/kpis", authorize(), getKpisController);

// 🔹 Receita vs Despesa (gráfico)
router.get("/receita-vs-despesa", authorize(), getReceitaVsDespesaController);

// 🔹 Distribuição de despesas por categoria
router.get("/despesas-categoria", authorize(), getDespesasCategoriaController);

// 🔹 Últimos faturamentos
router.get("/faturamentos-recentes", authorize(), getFaturamentosRecentesController);

// 🔹 Últimas despesas
router.get("/despesas-recentes", authorize(), getDespesasRecentesController);

export default router;
