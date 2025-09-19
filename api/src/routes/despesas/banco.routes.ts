import { Router } from 'express';
import { authorize } from '../../middlewares/authorize';
import {
  buscarBancoController,
  buscarBancosController,
  criarBancoController,
  editarBancoController
} from '../../controllers/despesas/bancoController';

const bancoRoutes = Router();

bancoRoutes.get('/:id', authorize(), buscarBancoController);
bancoRoutes.get('/', authorize(), buscarBancosController);
bancoRoutes.post('/', authorize(), criarBancoController);
bancoRoutes.put('/:id', authorize(), editarBancoController);

export default bancoRoutes;