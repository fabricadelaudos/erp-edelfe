import { Router } from 'express';
import { authorize } from '../../middlewares/authorize';
import { buscarFornecedorController, buscarFornecedoresController, criarFornecedorController, editarFornecedorController } from '../../controllers/despesas/fornecedorController';

const router = Router();

router.get('/:id', authorize(), buscarFornecedorController);
router.get('/', authorize(), buscarFornecedoresController);
router.post('/', authorize(), criarFornecedorController);
router.put('/:id', authorize(), editarFornecedorController);

export default router;