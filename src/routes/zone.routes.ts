import { Router } from 'express';
import ZoneController from '../controllers/ZoneController';
import { authenticate, adminOnly } from '../middleware/auth';

const router = Router();

router.get('/', authenticate as any, adminOnly as any, ZoneController.getZones);
router.post('/', authenticate as any, adminOnly as any, ZoneController.createZone);
router.put('/:id', authenticate as any, adminOnly as any, ZoneController.updateZone);
router.delete('/:id', authenticate as any, adminOnly as any, ZoneController.deleteZone);

export default router;
