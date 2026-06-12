import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class ZoneTable extends Model {
  public zoneId!: number;
  public tableId!: number;
}

ZoneTable.init(
  {
    zoneId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tableId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'ZoneTable',
    tableName: 'zone_tables',
    timestamps: false,
    indexes: [
      // Each table belongs to at most one zone
      { unique: true, fields: ['tableId'] },
    ],
  }
);

export default ZoneTable;
