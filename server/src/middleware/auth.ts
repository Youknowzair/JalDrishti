import { Request, Response, NextFunction } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from '../database/connection.js';
import { users } from '../database/schema.js';
import { eq } from 'drizzle-orm';

// Types and Interfaces
export interface UserPayload {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'agent' | 'community';
}

export interface JWTPayload extends UserPayload {
  iat?: number;
  exp?: number;
  type?: 'access' | 'refresh';
}

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

// Configuration
const JWT_CONFIG = {
  accessTokenExpiry: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
};

// Utility Functions
function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  return secret;
}

function createErrorResponse(code: string, message: string, statusCode: number = 401) {
  return {
    success: false,
    error: {
      code,
      message,
      timestamp: new Date().toISOString(),
    },
  };
}

// Authentication Core Functions
export class AuthService {
  // Generate JWT tokens
  static generateTokens(user: UserPayload): { accessToken: string; refreshToken: string } {
    const secret = getJWTSecret();
    
    const accessToken = jwt.sign(
      { ...user, type: 'access' },
      secret,
      { expiresIn: JWT_CONFIG.accessTokenExpiry } as SignOptions
    );

    const refreshToken = jwt.sign(
      { id: user.id, email: user.email, type: 'refresh' },
      secret,
      { expiresIn: JWT_CONFIG.refreshTokenExpiry } as SignOptions
    );

    return { accessToken, refreshToken };
  }

  // Verify JWT token
  static verifyToken(token: string, expectedType: 'access' | 'refresh' = 'access'): JWTPayload {
    const secret = getJWTSecret();
    const decoded = jwt.verify(token, secret) as JWTPayload;
    
    if (decoded.type && decoded.type !== expectedType) {
      throw new Error(`Invalid token type. Expected ${expectedType}, got ${decoded.type}`);
    }
    
    return decoded;
  }

  // Get user from database
  static async getUserById(userId: number): Promise<UserPayload | null> {
    try {
      const userResult = await db
        .select({
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          role: users.role,
          isActive: users.isActive,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!userResult.length || !userResult[0] || !userResult[0].isActive) {
        return null;
      }

      const user = userResult[0];
      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role as 'admin' | 'agent' | 'community',
      };
    } catch (error) {
      console.error('Database error in getUserById:', error);
      return null;
    }
  }

  // Hash password
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, JWT_CONFIG.bcryptRounds);
  }

  // Verify password
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}

// Middleware Functions
export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  (async () => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

      if (!token) {
        res.status(401).json(createErrorResponse('TOKEN_MISSING', 'Access token is required'));
        return;
      }

      const decoded = AuthService.verifyToken(token, 'access');

      // Development mode bypass
      if (process.env.NODE_ENV === 'development' && process.env.DEV_ALLOW_MOCK_AUTH === 'true') {
        req.user = {
          id: decoded.id,
          email: decoded.email,
          firstName: decoded.firstName || 'Demo',
          lastName: decoded.lastName || 'User',
          role: decoded.role,
        };
        next();
        return;
      }

      const user = await AuthService.getUserById(decoded.id);
      if (!user) {
        res.status(401).json(createErrorResponse('USER_INVALID', 'User not found or inactive'));
        return;
      }

      req.user = user;
      next();
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        res.status(401).json(createErrorResponse('TOKEN_EXPIRED', 'Access token has expired'));
      } else if (error.name === 'JsonWebTokenError') {
        res.status(401).json(createErrorResponse('TOKEN_INVALID', 'Invalid access token'));
      } else {
        console.error('Authentication error:', error);
        res.status(500).json(createErrorResponse('AUTH_ERROR', 'Authentication failed'));
      }
    }
  })().catch((error) => {
    console.error('Unexpected error in authenticateToken:', error);
    if (!res.headersSent) {
      res.status(500).json(createErrorResponse('AUTH_ERROR', 'Authentication failed'));
    }
  });
}

export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  (async () => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

      if (token) {
        try {
          const decoded = AuthService.verifyToken(token, 'access');
          const user = await AuthService.getUserById(decoded.id);
          if (user) {
            req.user = user;
          }
        } catch (error) {
          // Silently continue without authentication
        }
      }
    } catch (error) {
      // Silently continue without authentication
    }
    next();
  })().catch(() => next());
}

export function requireRole(...allowedRoles: UserPayload['role'][]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json(createErrorResponse('AUTH_REQUIRED', 'Authentication is required'));
      return;
    }
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        ...createErrorResponse('INSUFFICIENT_PERMISSIONS', 'You do not have permission to access this resource', 403),
        details: {
          requiredRoles: allowedRoles,
          userRole: req.user.role,
        },
      });
      return;
    }
    next();
  };
}

export const requireAdmin = requireRole('admin');
export const requireAdminOrAgent = requireRole('admin', 'agent');
export const requireAuth = requireRole('admin', 'agent', 'community');

export function refreshTokenMiddleware(req: Request, res: Response, next: NextFunction): void {
  (async () => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken || typeof refreshToken !== 'string') {
        res.status(400).json(createErrorResponse('REFRESH_TOKEN_MISSING', 'Refresh token is required', 400));
        return;
      }
      const decoded = AuthService.verifyToken(refreshToken, 'refresh');
      const user = await AuthService.getUserById(decoded.id);
      if (!user) {
        res.status(401).json(createErrorResponse('USER_INVALID', 'User not found or inactive'));
        return;
      }
      const tokens = AuthService.generateTokens(user);
      res.json({
        success: true,
        data: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          },
        },
      });
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        res.status(401).json(createErrorResponse('REFRESH_TOKEN_EXPIRED', 'Refresh token has expired'));
      } else if (error.name === 'JsonWebTokenError') {
        res.status(401).json(createErrorResponse('REFRESH_TOKEN_INVALID', 'Invalid refresh token'));
      } else {
        console.error('Refresh token error:', error);
        res.status(500).json(createErrorResponse('REFRESH_ERROR', 'Failed to refresh token'));
      }
    }
  })().catch((error) => {
    console.error('Unexpected error in refreshTokenMiddleware:', error);
    if (!res.headersSent) {
      res.status(500).json(createErrorResponse('REFRESH_ERROR', 'Failed to refresh token'));
    }
  });
}

export function validateApiKey(req: Request, res: Response, next: NextFunction): void {
  const apiKey = req.headers['x-api-key'];
  const expectedApiKey = process.env.API_KEY;
  if (!expectedApiKey) {
    console.error('API_KEY environment variable is not set');
    res.status(500).json(createErrorResponse('CONFIG_ERROR', 'Server configuration error'));
    return;
  }
  if (!apiKey || apiKey !== expectedApiKey) {
    res.status(401).json(createErrorResponse('INVALID_API_KEY', 'Invalid or missing API key'));
    return;
  }
  next();
}

export function createRateLimitKey(req: Request): string {
  const userIdentifier = req.user?.id?.toString() || req.ip || 'unknown';
  return `${userIdentifier}-${req.method}-${req.path}`;
}

export function getCurrentUser(req: Request): UserPayload | null {
  return req.user || null;
}

// Legacy exports for backward compatibility
export const hashPassword = AuthService.hashPassword;
export const verifyPassword = AuthService.verifyPassword;
export const generateToken = (user: UserPayload) => AuthService.generateTokens(user).accessToken;
