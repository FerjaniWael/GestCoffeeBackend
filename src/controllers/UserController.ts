import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import UserService from '../services/UserService';

export class UserController {
  async getWaiters(req: Request, res: Response, next: NextFunction) {
    try {
      const waiters = await UserService.getAllWaiters();
      sendSuccess(res, waiters, 'Waiters retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async createWaiter(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return sendError(res, 'Name, email, and password are required', 400);
      }

      const waiter = await UserService.createWaiter(name, email, password);
      sendSuccess(res, waiter, 'Waiter created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateWaiter(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name, email } = req.body;

      if (!name || !email) {
        return sendError(res, 'Name and email are required', 400);
      }

      const waiter = await UserService.updateWaiter(parseInt(id), name, email);
      sendSuccess(res, waiter, 'Waiter updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async toggleWaiter(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await UserService.getUserById(parseInt(id));
      
      if (user.isActive) {
        const waiter = await UserService.disableWaiter(parseInt(id));
        sendSuccess(res, waiter, 'Waiter disabled successfully');
      } else {
        // Re-enable
        const { User: UserModel } = require('../models');
        const waiter = await UserModel.findByPk(parseInt(id));
        waiter.isActive = true;
        await waiter.save();
        const result = waiter.toJSON();
        delete result.password;
        sendSuccess(res, result, 'Waiter enabled successfully');
      }
    } catch (error) {
      next(error);
    }
  }

  async getChefs(req: Request, res: Response, next: NextFunction) {
    try {
      const chefs = await UserService.getAllChefs();
      sendSuccess(res, chefs, 'Chefs retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async createChef(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password, role } = req.body;
      if (!name || !email || !password || !role) {
        return sendError(res, 'Name, email, password, and role are required', 400);
      }
      if (!['head_chef', 'pastry_chef'].includes(role)) {
        return sendError(res, 'Role must be head_chef or pastry_chef', 400);
      }
      const chef = await UserService.createChef(name, email, password, role);
      sendSuccess(res, chef, 'Chef account created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateChef(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name, email } = req.body;
      if (!name || !email) return sendError(res, 'Name and email are required', 400);
      const chef = await UserService.updateStaff(parseInt(id), name, email);
      sendSuccess(res, chef, 'Chef account updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async toggleChef(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const chef = await UserService.toggleActive(parseInt(id));
      sendSuccess(res, chef, `Chef ${chef.isActive ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { password } = req.body;

      if (!password) {
        return sendError(res, 'New password is required', 400);
      }

      await UserService.resetPassword(parseInt(id), password);
      sendSuccess(res, null, 'Password reset successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
