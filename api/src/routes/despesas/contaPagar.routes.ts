import { Router } from 'express';
import { authorize } from '../../middlewares/authorize';
import {
  buscarContaPagarController,
  buscarContasPagarController,
  criarContaPagarController,
  editarContaPagarController,
  buscarParcelaController,
  atualizarParcelaController,
  confirmarPagamentoController,
} from '../../controllers/despesas/contaPagarController';

const contasPagarRoutes = Router();

contasPagarRoutes.get('/:id', authorize(), buscarContaPagarController);
contasPagarRoutes.get('/', authorize(), buscarContasPagarController);
contasPagarRoutes.post('/', authorize(), criarContaPagarController);
contasPagarRoutes.put('/:id', authorize(), editarContaPagarController);

// Parcela
contasPagarRoutes.get('/:id', authorize(), buscarParcelaController);
contasPagarRoutes.put('/:id', authorize(), atualizarParcelaController);
contasPagarRoutes.put('/:id/pagar', authorize(), confirmarPagamentoController);

export default contasPagarRoutes;