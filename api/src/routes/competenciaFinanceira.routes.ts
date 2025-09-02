import { Router } from "express";
import { authorize } from "../middlewares/authorize";
import { buscarCompetenciaAtualController, buscarCompetenciasFinanceiras, criarCompetenciaFinanceira, editarCompetenciaFinanceira, excluirCompetenciaFinanceira } from "../controllers/competenciaFinanceiraController";

const router = Router();

router.get("/", authorize(), buscarCompetenciasFinanceiras);
router.get("/atual", authorize(), buscarCompetenciaAtualController);
router.post("/", authorize(), criarCompetenciaFinanceira);
router.put("/:id", authorize(), editarCompetenciaFinanceira);
router.delete("/:id", authorize(), excluirCompetenciaFinanceira);

export default router;
