import { Router } from 'express';
import { authorize } from '../../middlewares/authorize';
import { buscarContatosController, buscarEmpresaController, buscarEmpresasController, criarEmpresaController, editarEmpresaController } from '../../controllers/empresa/empresaController';

const router = Router();

router.get('/:id', authorize(), buscarEmpresaController);
router.get('/', authorize(), buscarEmpresasController);
router.get('/:id/contatos', authorize(), buscarContatosController);
router.post('/', authorize(), criarEmpresaController);
router.put('/:id', authorize(), editarEmpresaController);

export default router;