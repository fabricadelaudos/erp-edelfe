import { Router } from 'express';
import { authorize } from '../../middlewares/authorize';
import { buscarContatosController, buscarEmpresaController, buscarEmpresasController, criarEmpresaController, editarEmpresaController } from '../../controllers/empresa/empresaController';

const empresaRoutes = Router();

empresaRoutes.get('/:id/contatos', authorize(), buscarContatosController);
empresaRoutes.get('/:id', authorize(), buscarEmpresaController);
empresaRoutes.get('/', authorize(), buscarEmpresasController);
empresaRoutes.post('/', authorize(), criarEmpresaController);
empresaRoutes.put('/:id', authorize(), editarEmpresaController);

export default empresaRoutes;