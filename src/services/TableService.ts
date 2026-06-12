import { Op } from 'sequelize';
import { Table } from '../models';
import { ApiError } from '../utils/response';
import { generateQRCode, generateQRCodePNG } from '../utils/qrcode';
import { ITable } from '../types';

export class TableService {
  async createTable(tableNumber: number): Promise<ITable> {
    try {
      const existingTable = await Table.findOne({ where: { tableNumber } });
      if (existingTable) {
        throw new ApiError('Table number already exists', 400);
      }

      const qrCode = await generateQRCode(tableNumber);

      const table = await Table.create({
        tableNumber,
        qrCode,
      });

      return table.toJSON() as ITable;
    } catch (error: any) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Failed to create table', 500);
    }
  }

  async getTables(): Promise<ITable[]> {
    const tables = await Table.findAll({
      order: [['tableNumber', 'ASC']],
    });
    return tables.map(t => t.toJSON() as ITable);
  }

  async getTableById(id: number): Promise<ITable> {
    const table = await Table.findByPk(id);
    if (!table) {
      throw new ApiError('Table not found', 404);
    }
    return table.toJSON() as ITable;
  }

  async getTableByNumber(tableNumber: number): Promise<ITable> {
    const table = await Table.findOne({ where: { tableNumber } });
    if (!table) {
      throw new ApiError('Table not found', 404);
    }
    return table.toJSON() as ITable;
  }

  async updateTable(id: number, tableNumber: number): Promise<ITable> {
    const table = await Table.findByPk(id);
    if (!table) {
      throw new ApiError('Table not found', 404);
    }

    const existingTable = await Table.findOne({ where: { tableNumber, id: { [Op.ne]: id } } });
    if (existingTable) {
      throw new ApiError('Table number already exists', 400);
    }

    table.tableNumber = tableNumber;
    const qrCode = await generateQRCode(tableNumber);
    table.qrCode = qrCode;
    await table.save();

    return table.toJSON() as ITable;
  }

  async deleteTable(id: number): Promise<void> {
    const table = await Table.findByPk(id);
    if (!table) {
      throw new ApiError('Table not found', 404);
    }

    await table.destroy();
  }

  async getQRCode(tableId: number): Promise<string> {
    const table = await Table.findByPk(tableId);
    if (!table) {
      throw new ApiError('Table not found', 404);
    }
    return table.qrCode;
  }

  async getQRCodeBuffer(tableId: number): Promise<Buffer> {
    const table = await Table.findByPk(tableId);
    if (!table) {
      throw new ApiError('Table not found', 404);
    }

    const tableNumber = table.tableNumber;
    return await generateQRCodePNG(tableNumber);
  }
}

export default new TableService();
