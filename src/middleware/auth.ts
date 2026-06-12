import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth';
import { sendError } from '../utils/response';
import { AuthRequest, JWTPayload } from '../types';

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return sendError(res, 'No token provided', 401);
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return sendError(res, 'Invalid token', 401);
  }
};

export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    if (!roles.includes(req.user.role)) {
      return sendError(res, 'Forbidden - Insufficient permissions', 403);
    }

    next();
  };
};

export const adminOnly = authorize(['admin']);
export const waiterOnly = authorize(['waiter']);
export const customerOnly = authorize(['customer']);
export const adminOrWaiter = authorize(['admin', 'waiter']);
export const chefOnly = authorize(['head_chef', 'pastry_chef']);
export const adminOrChef = authorize(['admin', 'head_chef', 'pastry_chef']);
