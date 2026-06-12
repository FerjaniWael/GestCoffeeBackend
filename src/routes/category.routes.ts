import { Router } from 'express';
import CategoryController from '../controllers/CategoryController';
import { authenticate, adminOnly } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', CategoryController.getCategories);
router.get('/:id', CategoryController.getCategoryById);

// Admin routes
router.post('/', authenticate as any, adminOnly as any, CategoryController.createCategory);
router.put('/:id', authenticate as any, adminOnly as any, CategoryController.updateCategory);
router.patch('/:id/toggle', authenticate as any, adminOnly as any, CategoryController.toggleCategory);
router.delete('/:id', authenticate as any, adminOnly as any, CategoryController.deleteCategory);

export default router;
