import { Router } from "express";
import { buscarFaturamentoPorCompetenciaController, buscarFaturamentosEProjecoesController, buscarFaturamentosPorContratoController, criarFaturamentoController, editarFaturamentoController, editarFaturamentosEmMassaController, editarProjecaoController, gerarFaturamentoController } from "../controllers/faturamentoController";
import { authorize } from "../middlewares/authorize";

const faturamentoRoutes = Router();

faturamentoRoutes.get("/contrato/:idContrato", authorize(), buscarFaturamentosPorContratoController);
faturamentoRoutes.post("/", authorize(), criarFaturamentoController);
faturamentoRoutes.put("/projecao", authorize(), editarProjecaoController);
faturamentoRoutes.put("/:id", authorize(), editarFaturamentoController);
faturamentoRoutes.put("/", authorize(), editarFaturamentosEmMassaController);

faturamentoRoutes.get("/competencia/:competencia", authorize(), buscarFaturamentoPorCompetenciaController);
faturamentoRoutes.post("/gerar", authorize(), gerarFaturamentoController);

faturamentoRoutes.get("/completo", authorize(), buscarFaturamentosEProjecoesController);

export default faturamentoRoutes;
