import { Router } from 'express';
import UserController from '../controllers/UserController';
import { authenticate, adminOnly } from '../middleware/auth';

const router = Router();

// Waiter management (admin only)
router.get('/waiters', authenticate as any, adminOnly as any, UserController.getWaiters);
router.post('/waiters', authenticate as any, adminOnly as any, UserController.createWaiter);
router.put('/waiters/:id', authenticate as any, adminOnly as any, UserController.updateWaiter);
router.patch('/waiters/:id/toggle', authenticate as any, adminOnly as any, UserController.toggleWaiter);
router.patch('/waiters/:id/reset-password', authenticate as any, adminOnly as any, UserController.resetPassword);

// Chef management (admin only)
router.get('/chefs', authenticate as any, adminOnly as any, UserController.getChefs);
router.post('/chefs', authenticate as any, adminOnly as any, UserController.createChef);
router.put('/chefs/:id', authenticate as any, adminOnly as any, UserController.updateChef);
router.patch('/chefs/:id/toggle', authenticate as any, adminOnly as any, UserController.toggleChef);
router.patch('/chefs/:id/reset-password', authenticate as any, adminOnly as any, UserController.resetPassword);

export default router;
