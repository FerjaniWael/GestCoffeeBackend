import { Router } from 'express';
import KitchenController from '../controllers/KitchenController';
import { authenticate, chefOnly } from '../middleware/auth';

const router = Router();

// All kitchen routes require authentication and chef role
router.get('/tickets', authenticate as any, chefOnly as any, KitchenController.getMyTickets as any);
router.patch('/tickets/:id/status', authenticate as any, chefOnly as any, KitchenController.updateTicketStatus as any);

export default router;
