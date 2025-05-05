import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import logger from '../services/logger';

interface UserRequest extends Request {
  user?: {
    id: string;
    role: string;
  }
}

export const authenticateToken = (req: UserRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    logger.warn('Tentative d\'accès sans token');
    return res.sendStatus(401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as { 
      id: string; 
      role: string 
    };
    req.user = {
      id: decoded.id,
      role: decoded.role
    };
    next();
  } catch (err) {
    logger.error('Token invalide');
    return res.sendStatus(403);
  }
};

export const requireAdmin = (req: UserRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') {
    logger.warn(`Accès non autorisé pour utilisateur ${req.user?.id}`);
    return res.status(403).json({ message: 'Accès réservé aux administrateurs' });
  }
  next();
};