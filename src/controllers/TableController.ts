import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import TableService from '../services/TableService';

export class TableController {
  async createTable(req: Request, res: Response, next: NextFunction) {
    try {
      const { tableNumber } = req.body;

      if (!tableNumber) {
        return sendError(res, 'Table number is required', 400);
      }

      const table = await TableService.createTable(parseInt(tableNumber));
      sendSuccess(res, table, 'Table created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getTables(req: Request, res: Response, next: NextFunction) {
    try {
      const tables = await TableService.getTables();
      sendSuccess(res, tables, 'Tables retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getTableById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const table = await TableService.getTableById(parseInt(id));
      sendSuccess(res, table, 'Table retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateTable(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { tableNumber } = req.body;

      if (!tableNumber) {
        return sendError(res, 'Table number is required', 400);
      }

      const table = await TableService.updateTable(parseInt(id), parseInt(tableNumber));
      sendSuccess(res, table, 'Table updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteTable(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await TableService.deleteTable(parseInt(id));
      sendSuccess(res, null, 'Table deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async getQRCode(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const qrCode = await TableService.getQRCode(parseInt(id));
      sendSuccess(res, { qrCode }, 'QR code retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async downloadQRCode(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const buffer = await TableService.getQRCodeBuffer(parseInt(id));
      const table = await TableService.getTableById(parseInt(id));

      res.set({
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename=table-${table.tableNumber}-qr.png`,
      });
      res.send(buffer);
    } catch (error) {
      next(error);
    }
  }

  async getTableByNumber(req: Request, res: Response, next: NextFunction) {
    try {
      const { tableNumber } = req.params;
      const table = await TableService.getTableByNumber(parseInt(tableNumber));
      sendSuccess(res, table, 'Table retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new TableController();
