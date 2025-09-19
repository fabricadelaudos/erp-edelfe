import { Router } from "express";
import { buscarFaturamentoPorCompetenciaController, buscarFaturamentosEProjecoesController, buscarFaturamentosPorContratoController, criarFaturamentoController, editarFaturamentoController, editarFaturamentosEmMassaController, editarProjecaoController, gerarFaturamentoController } from "../controllers/faturamentoController";
import { authorize } from "../middlewares/authorize";

const router = Router();

router.get("/contrato/:idContrato", authorize(), buscarFaturamentosPorContratoController);
router.post("/", authorize(), criarFaturamentoController);
router.put("/projecao", authorize(), editarProjecaoController);
router.put("/:id", authorize(), editarFaturamentoController);
router.put("/", authorize(), editarFaturamentosEmMassaController);

router.get("/competencia/:competencia", authorize(), buscarFaturamentoPorCompetenciaController);
router.post("/gerar", authorize(), gerarFaturamentoController);

router.get("/completo", authorize(), buscarFaturamentosEProjecoesController);

export default router;
