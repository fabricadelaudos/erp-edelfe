import { Router } from 'express';
import { authorize } from '../../middlewares/authorize';
import { buscarPlanoContaCategoriaController, buscarPlanoContaCategoriasController, buscarSubcategoriasController, salvarPlanoContaCategoriaController } from '../../controllers/despesas/planoContaController';

const planoContasRoutes = Router();

// Categorias
planoContasRoutes.get('/:id', authorize(), buscarPlanoContaCategoriaController);
planoContasRoutes.get('/', authorize(), buscarPlanoContaCategoriasController);
planoContasRoutes.post('/salvar', authorize(), salvarPlanoContaCategoriaController);
// Subcategorias
planoContasRoutes.get('/subcategoria/:idCategoria', authorize(), buscarSubcategoriasController);

export default planoContasRoutes;