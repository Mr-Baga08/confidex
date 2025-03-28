// backend/src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { expressjwt } from 'express-jwt';
import jwksRsa from 'jwks-rsa';
import dotenv from 'dotenv';

dotenv.config();

const keycloakUrl = process.env.KEYCLOAK_URL || 'http://keycloak:8080';
const realm = process.env.KEYCLOAK_REALM || 'financial-secure-video';

// Authentication middleware
export const authenticateJWT = expressjwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `${keycloakUrl}/realms/${realm}/protocol/openid-connect/certs`
  }),
  algorithms: ['RS256'],
  audience: 'secure-video-client',
  issuer: `${keycloakUrl}/realms/${realm}`
});

// Error handling for authentication
export const handleAuthError = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token or unauthorized'
    });
  }
  
  next(err);
};

// Check if user has required role
export const hasRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const roles = req.user?.realm_access?.roles || [];
    
    if (!roles.includes(role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Insufficient permissions'
      });
    }
    
    next();
  };
};