import { Router } from "express";
import { login, logout, verifyToken } from '../controllers/authController';
import { authorize } from '../middlewares/authorize';

const authRoutes = Router();

authRoutes.post('/login', login);
authRoutes.post('/logout', authorize(), logout);
authRoutes.get("/auth/verify", authorize(), verifyToken);

export default authRoutes;