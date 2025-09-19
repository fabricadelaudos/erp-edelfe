import { Router } from 'express';
import { authorize } from '../middlewares/authorize';
import { buscarUsuarioController, buscarUsuariosController, criarUsuarioController, editarUsuarioController, enviarLinkRecuperacaoSenhaController } from '../controllers/usuarioController';

const usuarioRoutes = Router();

usuarioRoutes.get('/:id', authorize(), buscarUsuarioController);
usuarioRoutes.get('/', authorize(), buscarUsuariosController);
usuarioRoutes.post('/', authorize(), criarUsuarioController);
usuarioRoutes.put('/:id', authorize(), editarUsuarioController);

usuarioRoutes.post('/recuperarSenha', authorize(), enviarLinkRecuperacaoSenhaController);

export default usuarioRoutes;