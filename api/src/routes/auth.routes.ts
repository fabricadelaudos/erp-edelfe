import { Router } from "express";
import { login, logout, verifyToken } from '../controllers/authController';
import { authorize } from '../middlewares/authorize';

const router = Router();

router.post('/login', login);
router.post('/logout', authorize(), logout);
router.get("/auth/verify", authorize(), verifyToken);

export default router;