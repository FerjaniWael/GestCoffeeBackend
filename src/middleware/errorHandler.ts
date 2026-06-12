import { Request, Response, NextFunction } from 'express';
import { sendError, ApiError } from '../utils/response';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);

  if (err instanceof ApiError) {
    return sendError(res, err.message, err.statusCode);
  }

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors || {}).map((e: any) => e.message);
    return sendError(res, 'Validation error', 400, errors);
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.fields ? Object.keys(err.fields)[0] : 'field';
    return sendError(res, `${field} already exists`, 400);
  }

  return sendError(res, 'Internal server error', 500);
};

export const notFoundHandler = (req: Request, res: Response) => {
  sendError(res, 'Route not found', 404);
};
