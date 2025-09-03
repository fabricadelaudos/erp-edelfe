import { Router } from "express";
import { buscarFaturamentoPorCompetenciaController, buscarFaturamentosPorContratoController, criarFaturamentoController, editarFaturamentoController, gerarFaturamentoController } from "../controllers/faturamentoController";

const router = Router();

router.get("/contrato/:idContrato", buscarFaturamentosPorContratoController);
router.post("/", criarFaturamentoController);
router.put("/:id", editarFaturamentoController);

router.get("/competencia/:competencia", buscarFaturamentoPorCompetenciaController);
router.post("/gerar", gerarFaturamentoController);

export default router;
