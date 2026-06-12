import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class ZoneWaiter extends Model {
  public zoneId!: number;
  public waiterId!: number;
}

ZoneWaiter.init(
  {
    zoneId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    waiterId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'ZoneWaiter',
    tableName: 'zone_waiters',
    timestamps: false,
  }
);

export default ZoneWaiter;
