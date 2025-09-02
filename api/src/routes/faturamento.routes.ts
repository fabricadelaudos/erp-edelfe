import { Router } from "express";
import { buscarFaturamentoPorCompetenciaController, buscarFaturamentosPorContratoController, criarFaturamentoController, gerarFaturamentoController } from "../controllers/faturamentoController";

const router = Router();

router.get("/contrato/:idContrato", buscarFaturamentosPorContratoController);
router.post("/", criarFaturamentoController);

router.get("/competencia/:competencia", buscarFaturamentoPorCompetenciaController);
router.post("/gerar", gerarFaturamentoController);

export default router;
