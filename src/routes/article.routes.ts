import { Router } from 'express';
import ArticleController from '../controllers/ArticleController';
import { authenticate, adminOnly } from '../middleware/auth';
import upload from '../middleware/upload';

const router = Router();

// Public routes
router.get('/', ArticleController.getArticles);
router.get('/:id', ArticleController.getArticleById);

// Admin routes
router.post('/', authenticate as any, adminOnly as any, upload.single('image'), ArticleController.createArticle);
router.put('/:id', authenticate as any, adminOnly as any, upload.single('image'), ArticleController.updateArticle);
router.patch('/:id/toggle', authenticate as any, adminOnly as any, ArticleController.toggleArticle);
router.delete('/:id', authenticate as any, adminOnly as any, ArticleController.deleteArticle);

export default router;
