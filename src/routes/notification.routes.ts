import { Router } from 'express';
import NotificationController from '../controllers/NotificationController';
import { authenticate, adminOnly } from '../middleware/auth';

const router = Router();

// Public — customer calls from menu page
router.post('/call-waiter', NotificationController.callWaiter);

// Admin only — dispatch a specific waiter to a table
router.post('/dispatch-waiter', authenticate as any, adminOnly as any, NotificationController.dispatchWaiter as any);

// Authenticated routes
router.get('/', authenticate as any, NotificationController.getNotifications as any);
router.get('/unread-count', authenticate as any, NotificationController.getUnreadCount as any);
router.patch('/:id/read', authenticate as any, NotificationController.markAsRead as any);
router.patch('/read-all', authenticate as any, NotificationController.markAllAsRead as any);
router.delete('/:id', authenticate as any, NotificationController.deleteNotification as any);

export default router;
