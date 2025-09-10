import { Router } from 'express';
import { authorize } from '../../middlewares/authorize';
import {
  buscarContaPagarController,
  buscarContasPagarController,
  criarContaPagarController,
  editarContaPagarController,
  buscarParcelaController,
  atualizarParcelaController,
} from '../../controllers/despesas/contaPagarController';

const router = Router();

router.get('/:id', authorize(), buscarContaPagarController);
router.get('/', authorize(), buscarContasPagarController);
router.post('/', authorize(), criarContaPagarController);
router.put('/:id', authorize(), editarContaPagarController);

// Parcela
router.get('/:id', authorize(), buscarParcelaController);
router.put('/:id', authorize(), atualizarParcelaController);

export default router;