import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import ZoneService from '../services/ZoneService';

export class ZoneController {
  async getZones(req: Request, res: Response, next: NextFunction) {
    try {
      const zones = await ZoneService.getZones();
      sendSuccess(res, zones, 'Zones retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async createZone(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description } = req.body;
      if (!name || !name.trim()) {
        return sendError(res, 'Zone name is required', 400);
      }
      const zone = await ZoneService.createZone(name.trim(), description?.trim());
      sendSuccess(res, zone, 'Zone created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateZone(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name, description, tableIds, waiterIds } = req.body;

      if (!name || !name.trim()) {
        return sendError(res, 'Zone name is required', 400);
      }

      const zone = await ZoneService.updateZone(
        parseInt(id),
        name.trim(),
        description?.trim() || null,
        Array.isArray(tableIds) ? tableIds.map(Number) : [],
        Array.isArray(waiterIds) ? waiterIds.map(Number) : []
      );
      sendSuccess(res, zone, 'Zone updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteZone(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await ZoneService.deleteZone(parseInt(id));
      sendSuccess(res, null, 'Zone deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new ZoneController();
