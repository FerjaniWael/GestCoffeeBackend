import { Router } from 'express';
import OrderController from '../controllers/OrderController';
import { authenticate, adminOnly, adminOrWaiter } from '../middleware/auth';

const router = Router();

// Customer route (no auth required)
router.post('/', OrderController.createOrder);

// Admin/Waiter routes
router.get('/', authenticate as any, adminOrWaiter as any, OrderController.getOrders);
router.get('/my-orders', authenticate as any, OrderController.getWaiterOrders as any);
router.get('/:id', authenticate as any, adminOrWaiter as any, OrderController.getOrderById);
router.patch('/:id/status', authenticate as any, adminOrWaiter as any, OrderController.updateOrderStatus);
router.patch('/:id/assign', authenticate as any, adminOnly as any, OrderController.assignOrder);
router.patch('/:id/complete', authenticate as any, adminOrWaiter as any, OrderController.completeOrder);
router.delete('/:id', authenticate as any, adminOnly as any, OrderController.deleteOrder);

export default router;
