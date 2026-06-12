import { Router } from 'express';
import TableController from '../controllers/TableController';
import { authenticate, adminOnly } from '../middleware/auth';

const router = Router();

// Public route (for customer menu lookup)
router.get('/by-number/:tableNumber', TableController.getTableByNumber);

// Admin routes
router.get('/', authenticate as any, adminOnly as any, TableController.getTables);
router.get('/:id', authenticate as any, adminOnly as any, TableController.getTableById);
router.post('/', authenticate as any, adminOnly as any, TableController.createTable);
router.put('/:id', authenticate as any, adminOnly as any, TableController.updateTable);
router.delete('/:id', authenticate as any, adminOnly as any, TableController.deleteTable);
router.get('/:id/qrcode', authenticate as any, adminOnly as any, TableController.getQRCode);
router.get('/:id/qrcode/download', authenticate as any, adminOnly as any, TableController.downloadQRCode);
router.get('/:id/download', TableController.downloadQRCode);

export default router;
