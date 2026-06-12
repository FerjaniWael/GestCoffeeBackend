import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendError, ApiError } from '../utils/response';
import UserService from '../services/UserService';
import { AuthRequest } from '../types';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return sendError(res, 'Missing required fields', 400);
      }

      const result = await UserService.register(name, email, password);
      sendSuccess(res, result, 'User registered successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return sendError(res, 'Missing required fields', 400);
      }

      const result = await UserService.login(email, password);
      sendSuccess(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', 401);
      }

      const user = await UserService.getUserById(req.user.id);
      sendSuccess(res, user, 'Profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
