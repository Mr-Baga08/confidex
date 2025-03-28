// backend/src/models/meeting.model.ts
import { DataTypes, Model } from 'sequelize';
import sequelize from './index';

interface MeetingAttributes {
  id?: number;
  name: string;
  description: string;
  roomId: string;
  createdBy: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  startTime?: Date;
  endTime?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

class Meeting extends Model<MeetingAttributes> implements MeetingAttributes {
  public id!: number;
  public name!: string;
  public description!: string;
  public roomId!: string;
  public createdBy!: string;
  public status!: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  public startTime!: Date;
  public endTime!: Date;
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Meeting.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    roomId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('scheduled', 'in-progress', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'scheduled'
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'Meeting',
    tableName: 'meetings',
    timestamps: true
  }
);

export default Meeting;