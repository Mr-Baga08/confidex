import { Request, Response } from 'express';
import logger from '../utils/logger';
import ActivityLog from '../models/activityLog.model';

export const createLog = async (req: Request, res: Response) => {
  try {
    const { eventType, roomId, data } = req.body;
    const userId = req.user.id;
    
    // Create log entry
    await ActivityLog.create({
      userId,
      eventType,
      roomId,
      data,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    return res.status(201).json({
      success: true,
      message: 'Log created successfully'
    });
  } catch (error) {
    logger.error('Error creating log:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create log'
    });
  }
};

export const getLogs = async (req: Request, res: Response) => {
  try {
    const { roomId, startDate, endDate } = req.query;
    
    // Check if user has permission to access logs
    if (!req.user.roles.includes('admin') && !req.user.roles.includes('compliance-officer')) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to access logs'
      });
    }
    
    // Build query conditions
    const whereConditions: any = {};
    
    if (roomId) {
      whereConditions.roomId = roomId;
    }
    
    if (startDate && endDate) {
      whereConditions.createdAt = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
      };
    }
    
    // Fetch logs
    const logs = await ActivityLog.findAll({
      where: whereConditions,
      order: [['createdAt', 'DESC']],
      limit: 1000
    });
    
    return res.status(200).json({
      success: true,
      logs
    });
  } catch (error) {
    logger.error('Error fetching logs:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch logs'
    });
  }
};