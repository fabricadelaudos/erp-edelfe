import { Router } from 'express';
import { authorize } from '../../middlewares/authorize';
import { buscarFornecedorController, buscarFornecedoresController, criarFornecedorController, editarFornecedorController } from '../../controllers/despesas/fornecedorController';

const fornecedorRoutes = Router();

fornecedorRoutes.get('/:id', authorize(), buscarFornecedorController);
fornecedorRoutes.get('/', authorize(), buscarFornecedoresController);
fornecedorRoutes.post('/', authorize(), criarFornecedorController);
fornecedorRoutes.put('/:id', authorize(), editarFornecedorController);

export default fornecedorRoutes;