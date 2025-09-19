import { Router } from "express";
import { authorize } from "../middlewares/authorize";
import { buscarCompetenciaAtualController, buscarCompetenciasFinanceiras, criarCompetenciaFinanceira, editarCompetenciaFinanceira, excluirCompetenciaFinanceira } from "../controllers/competenciaFinanceiraController";

const competenciaRoutes = Router();

competenciaRoutes.get("/", authorize(), buscarCompetenciasFinanceiras);
competenciaRoutes.get("/atual", authorize(), buscarCompetenciaAtualController);
competenciaRoutes.post("/", authorize(), criarCompetenciaFinanceira);
competenciaRoutes.put("/:id", authorize(), editarCompetenciaFinanceira);
competenciaRoutes.delete("/:id", authorize(), excluirCompetenciaFinanceira);

export default competenciaRoutes;
