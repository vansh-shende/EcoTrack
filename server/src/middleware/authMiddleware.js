/**
 * ─────────────────────────────────────────────────────────────
 * Authentication & Authorization Middleware
 * ─────────────────────────────────────────────────────────────
 * Two middleware functions for protecting routes:
 *
 *   1. protect    → Verifies JWT, attaches req.user
 *   2. authorize  → Checks req.user.role against allowed roles
 *
 * Usage in routes:
 *   const { protect, authorize } = require('../middleware/authMiddleware');
 *
 *   // Any authenticated user
 *   router.get('/profile', protect, controller.getProfile);
 *
 *   // Only admins
 *   router.delete('/users/:id', protect, authorize('admin'), controller.deleteUser);
 * ─────────────────────────────────────────────────────────────
 */

const jwt = require('jsonwebtoken');
const config = require('../config');
const userModel = require('../models/userModel');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * ─────────────────────────────────────────────────────────────
 * protect — JWT Verification Middleware
 * ─────────────────────────────────────────────────────────────
 * Pipeline:
 *   1. Check Authorization header exists
 *   2. Extract token from "Bearer <token>" format
 *   3. Verify token signature + expiry (HS256 only)
 *   4. Confirm it's an access token (not a refresh token)
 *   5. Verify user still exists in database
 *   6. Attach user object to req.user (NO password)
 *   7. Call next()
 *
 * On failure: throws AppError(401) — caught by globalErrorHandler.
 * ─────────────────────────────────────────────────────────────
 */
const protect = asyncHandler(async (req, _res, next) => {
  // 1. Check for Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError(
      'Access denied — no authentication token provided. Please log in.',
      401
    );
  }

  // 2. Extract the token (strip "Bearer " prefix)
  const token = authHeader.split(' ')[1];
  if (!token) {
    throw new AppError('Access denied — malformed authorization header.', 401);
  }

  // 3. Verify token signature and expiry
  let decoded;
  try {
    decoded = jwt.verify(token, config.jwt.secret, {
      algorithms: ['HS256'], // Pin algorithm — prevents "alg: none" attacks
    });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new AppError('Your session has expired — please log in again.', 401);
    }
    if (err.name === 'JsonWebTokenError') {
      throw new AppError('Invalid authentication token.', 401);
    }
    throw new AppError('Token verification failed.', 401);
  }

  // 4. Ensure this is an access token (not a refresh token)
  if (decoded.type !== 'access') {
    throw new AppError('Invalid token type — please use an access token.', 401);
  }

  // 5. Verify the user still exists (account may have been deleted)
  const user = await userModel.findById(decoded.user_id);
  if (!user) {
    throw new AppError(
      'The user belonging to this token no longer exists.',
      401
    );
  }

  // 6. Attach the user to the request object (no password included)
  req.user = user;

  // 7. Proceed to the next middleware / route handler
  next();
});

/**
 * ─────────────────────────────────────────────────────────────
 * authorize — Role-Based Access Control (RBAC) Middleware
 * ─────────────────────────────────────────────────────────────
 * Must be used AFTER protect middleware (depends on req.user).
 *
 * Returns a middleware that checks whether req.user.role is
 * included in the list of allowed roles.
 *
 * Future-ready: The current `users` table doesn't have a
 * `role` column yet. When RBAC is needed:
 *   1. Add migration: ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user';
 *   2. Update userModel queries to include the role field
 *   3. Use: router.delete('/admin/users/:id', protect, authorize('admin'), ...)
 *
 * @param {...string} roles - Allowed roles (e.g., 'admin', 'moderator')
 * @returns {import('express').RequestHandler}
 * ─────────────────────────────────────────────────────────────
 */
const authorize = (...roles) => {
  return (req, _res, next) => {
    // req.user is guaranteed to exist (protect runs first)
    const userRole = req.user.role || 'user'; // Default to 'user' if column doesn't exist yet

    if (!roles.includes(userRole)) {
      throw new AppError(
        `Access denied — this action requires one of the following roles: ${roles.join(', ')}`,
        403
      );
    }

    next();
  };
};

module.exports = { protect, authorize };
