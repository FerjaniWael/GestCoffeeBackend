import User from './User';
import Category from './Category';
import Article from './Article';
import Table from './Table';
import Order from './Order';
import OrderItem from './OrderItem';
import Notification from './Notification';

// Zone must be imported (and init()'d) BEFORE ZoneTable/ZoneWaiter so that
// Sequelize syncs the `zones` table first — MySQL enforces FK constraints at
// CREATE TABLE time and zone_tables/zone_waiters have FKs to zones.
import Zone from './Zone';
import ZoneTable from './ZoneTable';
import ZoneWaiter from './ZoneWaiter';
import KitchenTicket from './KitchenTicket';

// Zone ↔ Table (each table can be in at most one zone — enforced by unique index on tableId in zone_tables)
Zone.belongsToMany(Table, { through: ZoneTable, foreignKey: 'zoneId', otherKey: 'tableId', as: 'Tables' });
Table.belongsToMany(Zone, { through: ZoneTable, foreignKey: 'tableId', otherKey: 'zoneId', as: 'Zones' });

// Zone ↔ User/Waiter (a waiter can cover multiple zones)
Zone.belongsToMany(User, { through: ZoneWaiter, foreignKey: 'zoneId', otherKey: 'waiterId', as: 'Waiters' });
User.belongsToMany(Zone, { through: ZoneWaiter, foreignKey: 'waiterId', otherKey: 'zoneId', as: 'WaiterZones' });

export { User, Category, Article, Table, Order, OrderItem, Notification, Zone, ZoneTable, ZoneWaiter, KitchenTicket };
