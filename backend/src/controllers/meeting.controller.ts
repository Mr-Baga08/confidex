// backend/src/controllers/meeting.controller.ts (expanded)
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import Meeting from '../models/meeting.model';
import logger from '../utils/logger';

// JWT secret for Jitsi
const JWT_APP_SECRET = process.env.JWT_APP_SECRET || 'your_jwt_app_secret';
const JWT_APP_ID = process.env.JITSI_APP_ID || 'secure_video_app';

export const createMeeting = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.sub;
    
    // Generate unique room ID
    const roomId = `${name.substring(0, 10).replace(/\s+/g, '-').toLowerCase()}-${uuidv4().substring(0, 8)}`;
    
    // Create meeting in database
    const meeting = await Meeting.create({
      name,
      description,
      roomId,
      createdBy: userId,
      status: 'scheduled'
    });
    
    logger.info(`Meeting created: ${meeting.id} by user ${userId}`);
    
    return res.status(201).json({
      success: true,
      meeting
    });
  } catch (error) {
    logger.error('Error creating meeting:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create meeting'
    });
  }
};

export const getMeetings = async (req: Request, res: Response) => {
  try {
    const userId = req.user.sub;
    const userRoles = req.user.realm_access?.roles || [];
    
    // Build query based on user role
    let whereCondition = {};
    
    if (userRoles.includes('financial-advisor')) {
      // Financial advisors see their created meetings
      whereCondition = { createdBy: userId };
    } else if (userRoles.includes('compliance-officer')) {
      // Compliance officers see all meetings
      whereCondition = {};
    } else {
      // Regular users don't see any meetings in list
      return res.status(200).json({
        success: true,
        meetings: []
      });
    }
    
    // Get meetings
    const meetings = await Meeting.findAll({
      where: whereCondition,
      order: [['createdAt', 'DESC']]
    });
    
    return res.status(200).json({
      success: true,
      meetings
    });
  } catch (error) {
    logger.error('Error fetching meetings:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch meetings'
    });
  }
};

export const getMeetingById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Find meeting
    const meeting = await Meeting.findByPk(id);
    
    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      meeting
    });
  } catch (error) {
    logger.error(`Error fetching meeting ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch meeting'
    });
  }
};

export const updateMeeting = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;
    const userId = req.user.sub;
    
    // Find meeting
    const meeting = await Meeting.findByPk(id);
    
    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }
    
    // Check if user is the creator
    if (meeting.createdBy !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this meeting'
      });
    }
    
    // Update meeting
    await meeting.update({
      name: name || meeting.name,
      description: description !== undefined ? description : meeting.description,
      status: status || meeting.status
    });
    
    return res.status(200).json({
      success: true,
      meeting
    });
  } catch (error) {
    logger.error(`Error updating meeting ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update meeting'
    });
  }
};

export const deleteMeeting = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.sub;
    
    // Find meeting
    const meeting = await Meeting.findByPk(id);
    
    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }
    
    // Check if user is the creator
    if (meeting.createdBy !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this meeting'
      });
    }
    
    // Delete meeting
    await meeting.destroy();
    
    return res.status(200).json({
      success: true,
      message: 'Meeting deleted successfully'
    });
  } catch (error) {
    logger.error(`Error deleting meeting ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete meeting'
    });
  }
};

export const generateToken = async (req: Request, res: Response) => {
  try {
    const { roomName, userInfo } = req.body;
    
    // Verify if the room exists (optional for clients joining via link)
    let meeting = null;
    try {
      meeting = await Meeting.findOne({
        where: { roomId: roomName }
      });
    } catch (error) {
      // Allow token generation even if meeting not found in DB
      // This allows for joining via direct links
      logger.warn(`Token requested for unknown room: ${roomName}`);
    }
    
    // Current timestamp in seconds
    const now = Math.floor(Date.now() / 1000);
    
    // JWT payload
    const payload = {
      aud: JWT_APP_ID,
      iss: JWT_APP_ID,
      sub: 'meet.jitsi',
      exp: now + 3600, // Token expires in 1 hour
      nbf: now,
      room: roomName,
      context: {
        user: {
          id: userInfo.id,
          name: userInfo.name,
          email: userInfo.email,
          moderator: userInfo.role === 'moderator'
        }
      }
    };
    
    // Generate JWT token
    const token = jwt.sign(payload, JWT_APP_SECRET);
    
    // Update meeting status if found
    if (meeting) {
      if (meeting.status === 'scheduled') {
        await meeting.update({
          status: 'in-progress',
          startTime: new Date()
        });
      }
    }
    
    return res.status(200).json({
      success: true,
      token
    });
  } catch (error) {
    logger.error('Error generating token:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate token'
    });
  }