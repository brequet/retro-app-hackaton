import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';
import db from '../db/database';

export interface AuthRequest extends Request {
  userId?: string;
  isAdmin?: boolean;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authorization required' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }) as unknown as { userId: string };
    req.userId = decoded.userId;

    // Load admin status
    const user = db.prepare('SELECT is_admin FROM users WHERE id = ?').get(decoded.userId) as any;
    req.isAdmin = !!(user && user.is_admin);

    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Optional auth: sets userId/isAdmin if token present, but does not block
export function optionalAuthMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next();
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }) as unknown as { userId: string };
    req.userId = decoded.userId;
    const user = db.prepare('SELECT is_admin FROM users WHERE id = ?').get(decoded.userId) as any;
    req.isAdmin = !!(user && user.is_admin);
  } catch {
    // Token invalid, continue as unauthenticated
  }
  next();
}
