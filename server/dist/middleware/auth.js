import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from '../database/connection.js';
import { users } from '../database/schema.js';
import { eq } from 'drizzle-orm';
// JWT token generation
export function generateToken(user) {
    const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
    };
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
}
// JWT token verification middleware
export async function authenticateToken(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access token required',
                code: 'TOKEN_MISSING'
            });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Get user from database to ensure they still exist and are active
        const user = await db.select({
            id: users.id,
            email: users.email,
            firstName: users.firstName,
            lastName: users.lastName,
            role: users.role,
            isActive: users.isActive
        }).from(users).where(eq(users.id, decoded.id)).limit(1);
        if (!user.length || !user[0].isActive) {
            return res.status(401).json({
                success: false,
                message: 'User not found or inactive',
                code: 'USER_INVALID'
            });
        }
        req.user = user[0];
        next();
    }
    catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token',
                code: 'TOKEN_INVALID'
            });
        }
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({
                success: false,
                message: 'Token expired',
                code: 'TOKEN_EXPIRED'
            });
        }
        console.error('Authentication error:', error);
        return res.status(500).json({
            success: false,
            message: 'Authentication failed',
            code: 'AUTH_ERROR'
        });
    }
}
// Role-based access control middleware
export function requireRole(allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
                code: 'AUTH_REQUIRED'
            });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions',
                code: 'INSUFFICIENT_PERMISSIONS',
                requiredRoles: allowedRoles,
                userRole: req.user.role
            });
        }
        next();
    };
}
// Admin only access
export const requireAdmin = requireRole(['admin']);
// Admin or Agent access
export const requireAdminOrAgent = requireRole(['admin', 'agent']);
// Any authenticated user
export const requireAuth = requireRole(['admin', 'agent', 'community']);
// Password hashing
export async function hashPassword(password) {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    return bcrypt.hash(password, saltRounds);
}
// Password verification
export async function verifyPassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
}
// Rate limiting helper
export function createRateLimitKey(req) {
    return `${req.ip}-${req.path}`;
}
// Session validation
export function validateSession(req, res, next) {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({
            success: false,
            message: 'Session expired or invalid',
            code: 'SESSION_INVALID'
        });
    }
    next();
}
// Optional authentication (user can be authenticated but it's not required)
export async function optionalAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await db.select({
                id: users.id,
                email: users.email,
                firstName: users.firstName,
                lastName: users.lastName,
                role: users.role,
                isActive: users.isActive
            }).from(users).where(eq(users.id, decoded.id)).limit(1);
            if (user.length && user[0].isActive) {
                req.user = user[0];
            }
        }
        next();
    }
    catch (error) {
        // Continue without authentication
        next();
    }
}
// API key validation (for external integrations)
export function validateApiKey(req, res, next) {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== process.env.API_KEY) {
        return res.status(401).json({
            success: false,
            message: 'Invalid API key',
            code: 'INVALID_API_KEY'
        });
    }
    next();
}
//# sourceMappingURL=auth.js.map