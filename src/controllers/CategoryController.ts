import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import CategoryService from '../services/CategoryService';

export class CategoryController {
  async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { name } = req.body;

      if (!name) {
        return sendError(res, 'Category name is required', 400);
      }

      const category = await CategoryService.createCategory(name);
      sendSuccess(res, category, 'Category created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const active = req.query.active ? req.query.active === 'true' : undefined;
      const categories = await CategoryService.getCategories(active);
      sendSuccess(res, categories, 'Categories retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getCategoryById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const category = await CategoryService.getCategoryById(parseInt(id));
      sendSuccess(res, category, 'Category retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name } = req.body;

      if (!name) {
        return sendError(res, 'Category name is required', 400);
      }

      const category = await CategoryService.updateCategory(parseInt(id), name);
      sendSuccess(res, category, 'Category updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async toggleCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const category = await CategoryService.toggleCategory(parseInt(id));
      sendSuccess(res, category, 'Category status updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await CategoryService.deleteCategory(parseInt(id));
      sendSuccess(res, null, 'Category deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new CategoryController();
