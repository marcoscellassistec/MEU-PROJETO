import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

export interface AuthPayload {
  userId: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token não fornecido' });
    return;
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthPayload;
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido ou expirado' });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (req.user?.role !== 'ADMIN') {
    res.status(403).json({ error: 'Acesso negado. Permissão de administrador necessária.' });
    return;
  }
  next();
}

export function generateToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function generateRefreshToken(payload: AuthPayload): string {
  const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret';
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: '30d' });
}
