// backend/src/models/activityLog.model.ts
import { DataTypes, Model } from 'sequelize';
import sequelize from './index';

interface ActivityLogAttributes {
  id?: number;
  userId: string;
  eventType: string;
  roomId: string;
  data?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt?: Date;
}

class ActivityLog extends Model<ActivityLogAttributes> implements ActivityLogAttributes {
  public id!: number;
  public userId!: string;
  public eventType!: string;
  public roomId!: string;
  public data!: any;
  public ipAddress!: string;
  public userAgent!: string;
  
  public readonly createdAt!: Date;
}

ActivityLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    eventType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    roomId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    data: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true
    },
    userAgent: {
      type: DataTypes.STRING,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'ActivityLog',
    tableName: 'activity_logs',
    timestamps: true,
    updatedAt: false
  }
);

export default ActivityLog;