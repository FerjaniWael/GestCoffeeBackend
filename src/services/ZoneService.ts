import { Zone, ZoneTable, ZoneWaiter, Table, User } from '../models';
import { ApiError } from '../utils/response';

export class ZoneService {
  async getZones(): Promise<any[]> {
    const zones = await Zone.findAll({
      include: [
        {
          model: Table,
          as: 'Tables',
          attributes: ['id', 'tableNumber'],
          through: { attributes: [] },
        },
        {
          model: User,
          as: 'Waiters',
          attributes: ['id', 'name', 'email'],
          through: { attributes: [] },
        },
      ],
      order: [['name', 'ASC']],
    });
    return zones.map(z => z.toJSON());
  }

  async getZoneById(id: number): Promise<any> {
    const zone = await Zone.findByPk(id, {
      include: [
        {
          model: Table,
          as: 'Tables',
          attributes: ['id', 'tableNumber'],
          through: { attributes: [] },
        },
        {
          model: User,
          as: 'Waiters',
          attributes: ['id', 'name', 'email'],
          through: { attributes: [] },
        },
      ],
    });
    if (!zone) throw new ApiError('Zone not found', 404);
    return zone.toJSON();
  }

  async createZone(name: string, description?: string): Promise<any> {
    const existing = await Zone.findOne({ where: { name } });
    if (existing) throw new ApiError('A zone with this name already exists', 409);

    const zone = await Zone.create({ name, description: description || null });
    return await this.getZoneById(zone.id);
  }

  async updateZone(
    id: number,
    name: string,
    description: string | null,
    tableIds: number[],
    waiterIds: number[]
  ): Promise<any> {
    const zone = await Zone.findByPk(id);
    if (!zone) throw new ApiError('Zone not found', 404);

    // Check name uniqueness (only if changed)
    if (name !== zone.name) {
      const existing = await Zone.findOne({ where: { name } });
      if (existing) throw new ApiError('A zone with this name already exists', 409);
    }

    zone.name = name;
    zone.description = description;
    await zone.save();

    // Tables: first remove selected tables from any other zone, then re-assign to this zone
    if (tableIds.length > 0) {
      await ZoneTable.destroy({ where: { tableId: tableIds } });
    }
    await ZoneTable.destroy({ where: { zoneId: id } });
    for (const tableId of tableIds) {
      await ZoneTable.create({ zoneId: id, tableId });
    }

    // Waiters: replace all current assignments for this zone
    await ZoneWaiter.destroy({ where: { zoneId: id } });
    for (const waiterId of waiterIds) {
      await ZoneWaiter.create({ zoneId: id, waiterId });
    }

    return await this.getZoneById(id);
  }

  async deleteZone(id: number): Promise<void> {
    const zone = await Zone.findByPk(id);
    if (!zone) throw new ApiError('Zone not found', 404);

    await ZoneTable.destroy({ where: { zoneId: id } });
    await ZoneWaiter.destroy({ where: { zoneId: id } });
    await zone.destroy();
  }

  // Used by OrderController when a new order is placed
  async getZoneWaitersForTable(tableId: number): Promise<{ zone: any | null; waiters: any[] }> {
    const zoneTableRow = await ZoneTable.findOne({ where: { tableId } });
    if (!zoneTableRow) return { zone: null, waiters: [] };

    const zoneId = (zoneTableRow as any).zoneId;
    const zone = await Zone.findByPk(zoneId);
    if (!zone) return { zone: null, waiters: [] };

    const zoneWaiterRows = await ZoneWaiter.findAll({ where: { zoneId } });
    const waiterIds = zoneWaiterRows.map(r => (r as any).waiterId);

    if (waiterIds.length === 0) return { zone: zone.toJSON(), waiters: [] };

    const waiters = await User.findAll({
      where: { id: waiterIds, role: 'waiter', isActive: true },
      attributes: ['id', 'name', 'email'],
    });

    return { zone: zone.toJSON(), waiters: waiters.map(w => w.toJSON()) };
  }
}

export default new ZoneService();
