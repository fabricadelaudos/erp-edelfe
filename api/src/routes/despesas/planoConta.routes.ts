import { Router } from 'express';
import { authorize } from '../../middlewares/authorize';
import { buscarPlanoContaCategoriaController, buscarPlanoContaCategoriasController, buscarSubcategoriasController, salvarPlanoContaCategoriaController } from '../../controllers/despesas/planoContaController';

const router = Router();

// Categorias
router.get('/:id', authorize(), buscarPlanoContaCategoriaController);
router.get('/', authorize(), buscarPlanoContaCategoriasController);
router.post('/salvar', authorize(), salvarPlanoContaCategoriaController);
// Subcategorias
router.get('/subcategoria/:idCategoria', authorize(), buscarSubcategoriasController);

export default router;