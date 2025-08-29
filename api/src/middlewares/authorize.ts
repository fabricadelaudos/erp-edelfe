import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

interface TokenPayload {
  idUsuario: number;
  email: string;
  iat?: number;
  exp?: number;
}

export function authorize() {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Token não fornecido" });
    }

    const [scheme, token] = authHeader.split(" ");
    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ error: "Formato de token inválido" });
    }

    try {
      const payload = jwt.verify(token, env.JWT_SECRET, {
        algorithms: ["HS256"],
      }) as TokenPayload;

      req.user = payload;
      next();
    } catch (err) {
      return res.status(401).json({ error: "Token inválido ou expirado" });
    }
  };
}