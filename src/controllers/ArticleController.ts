import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import ArticleService from '../services/ArticleService';

export class ArticleController {
  async createArticle(req: Request, res: Response, next: NextFunction) {
    try {
      const { categoryId, name, description, price, chefRole } = req.body;

      if (!categoryId || !name || !price) {
        return sendError(res, 'Category, name, and price are required', 400);
      }

      let image: string | undefined;
      if (req.file) {
        image = `/uploads/${req.file.filename}`;
      }

      const article = await ArticleService.createArticle(
        parseInt(categoryId),
        name,
        description || '',
        parseFloat(price),
        image,
        chefRole || null
      );
      sendSuccess(res, article, 'Article created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getArticles(req: Request, res: Response, next: NextFunction) {
    try {
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      const active = req.query.active !== undefined ? req.query.active === 'true' : undefined;
      const articles = await ArticleService.getArticles(categoryId, active);
      sendSuccess(res, articles, 'Articles retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getArticleById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const article = await ArticleService.getArticleById(parseInt(id));
      sendSuccess(res, article, 'Article retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateArticle(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name, description, price, categoryId, chefRole } = req.body;

      let image: string | undefined;
      if (req.file) {
        image = `/uploads/${req.file.filename}`;
      }

      const article = await ArticleService.updateArticle(
        parseInt(id),
        name,
        description,
        price ? parseFloat(price) : undefined,
        image,
        categoryId ? parseInt(categoryId) : undefined,
        chefRole !== undefined ? (chefRole || null) : undefined
      );
      sendSuccess(res, article, 'Article updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async toggleArticle(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const article = await ArticleService.toggleArticle(parseInt(id));
      sendSuccess(res, article, 'Article status updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteArticle(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await ArticleService.deleteArticle(parseInt(id));
      sendSuccess(res, null, 'Article deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new ArticleController();
