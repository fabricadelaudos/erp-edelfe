import { Router } from 'express';
import { authorize } from '../middlewares/authorize';
import { buscarUsuarioController, buscarUsuariosController, criarUsuarioController, editarUsuarioController, enviarLinkRecuperacaoSenhaController } from '../controllers/usuarioController';

const router = Router();

router.get('/:id', authorize(), buscarUsuarioController);
router.get('/', authorize(), buscarUsuariosController);
router.post('/', authorize(), criarUsuarioController);
router.put('/:id', authorize(), editarUsuarioController);

router.post('/recuperarSenha', authorize(), enviarLinkRecuperacaoSenhaController);

export default router;