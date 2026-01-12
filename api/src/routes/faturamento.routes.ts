import { Router } from "express";
import { buscarFaturamentoPorCompetenciaController, buscarFaturamentosEProjecoesController, buscarFaturamentosPorContratoController, criarFaturamentoController, editarFaturamentoController, editarFaturamentosEmMassaController, editarProjecaoController, gerarFaturamentoController, toggleBoletoEmitidoController, toggleEmailEnviadoController, toggleNotaEmitidaController } from "../controllers/faturamentoController";
import { authorize } from "../middlewares/authorize";

const faturamentoRoutes = Router();

faturamentoRoutes.get("/contrato/:idContrato", authorize(), buscarFaturamentosPorContratoController);
faturamentoRoutes.post("/", authorize(), criarFaturamentoController);
faturamentoRoutes.put("/projecao", authorize(), editarProjecaoController);
faturamentoRoutes.put("/editarMassa", authorize(), editarFaturamentosEmMassaController);
faturamentoRoutes.put("/:id", authorize(), editarFaturamentoController);

faturamentoRoutes.get("/competencia/:competencia", authorize(), buscarFaturamentoPorCompetenciaController);
faturamentoRoutes.post("/gerar", authorize(), gerarFaturamentoController);

faturamentoRoutes.get("/completo", authorize(), buscarFaturamentosEProjecoesController);

// Boleto/Email
faturamentoRoutes.patch("/:id/boleto", authorize(), toggleBoletoEmitidoController);
faturamentoRoutes.patch("/:id/email", authorize(), toggleEmailEnviadoController);
faturamentoRoutes.patch("/:id/nota", authorize(), toggleNotaEmitidaController);

export default faturamentoRoutes;
