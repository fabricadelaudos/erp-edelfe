import { Router } from 'express';
import { authorize } from '../../middlewares/authorize';
import {
  buscarBancoController,
  buscarBancosController,
  criarBancoController,
  editarBancoController
} from '../../controllers/despesas/bancoController';

const router = Router();

router.get('/:id', authorize(), buscarBancoController);
router.get('/', authorize(), buscarBancosController);
router.post('/', authorize(), criarBancoController);
router.put('/:id', authorize(), editarBancoController);

export default router;