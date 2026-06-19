/**
 * ─────────────────────────────────────────────────────────────
 * Authentication Routes
 * ─────────────────────────────────────────────────────────────
 * POST /auth/register       → Create account (public)
 * POST /auth/login          → Get JWT tokens (public, auth rate-limited)
 * GET  /auth/me             → Current user profile (protected)
 * POST /auth/refresh-token  → Refresh JWT (public, auth rate-limited)
 * POST /auth/logout         → End session (protected)
 * ─────────────────────────────────────────────────────────────
 */

const { Router } = require('express');
const authController = require('../controllers/authController');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/authMiddleware');
const { authRateLimiter } = require('../middleware/security');
const {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} = require('../validators/authValidator');

const router = Router();

// ── Public Routes ───────────────────────────────────────────

router.post(
  '/register',
  validate(registerSchema),
  authController.register
);

router.post(
  '/login',
  authRateLimiter,
  validate(loginSchema),
  authController.login
);

router.post(
  '/refresh-token',
  authRateLimiter,
  validate(refreshTokenSchema),
  authController.refreshToken
);

// ── Protected Routes (require valid JWT) ────────────────────

router.get(
  '/me',
  protect,
  authController.getMe
);

router.post(
  '/logout',
  protect,
  authController.logout
);

module.exports = router;
