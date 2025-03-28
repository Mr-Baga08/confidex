// backend/src/routes/meeting.routes.ts
import { Router } from 'express';
import { authenticateJWT, handleAuthError, hasRole } from '../middleware/auth.middleware';
import { 
  createMeeting,
  getMeetings,
  getMeetingById,
  updateMeeting,
  deleteMeeting,
  generateToken
} from '../controllers/meeting.controller';

const router = Router();

// Apply JWT authentication to all routes
router.use(authenticateJWT);
router.use(handleAuthError);

// Meeting routes
router.post('/', hasRole('financial-advisor'), createMeeting);
router.get('/', getMeetings);
router.get('/:id', getMeetingById);
router.put('/:id', hasRole('financial-advisor'), updateMeeting);
router.delete('/:id', hasRole('financial-advisor'), deleteMeeting);

// Token generation for Jitsi
router.post('/token', generateToken);

export default router;