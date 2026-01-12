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
  excluirParcelaContaPagarController,
  excluirContaPagarController,
} from '../../controllers/despesas/contaPagarController';

const contasPagarRoutes = Router();

// Parcela
contasPagarRoutes.get('/parcela/:id', authorize(), buscarParcelaController);
contasPagarRoutes.put('/parcela/:id', authorize(), atualizarParcelaController);
contasPagarRoutes.put('/parcela/:id/pagar', authorize(), confirmarPagamentoController);

contasPagarRoutes.get('/:id', authorize(), buscarContaPagarController);
contasPagarRoutes.get('/', authorize(), buscarContasPagarController);
contasPagarRoutes.post('/', authorize(), criarContaPagarController);
contasPagarRoutes.put('/:id', authorize(), editarContaPagarController);

contasPagarRoutes.delete('/parcela/:id', authorize(), excluirParcelaContaPagarController);
contasPagarRoutes.delete('/:id', authorize(), excluirContaPagarController);

export default contasPagarRoutes;