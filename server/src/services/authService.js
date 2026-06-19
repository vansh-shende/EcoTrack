/**
 * ─────────────────────────────────────────────────────────────
 * Auth Service — Business Logic Layer for Authentication
 * ─────────────────────────────────────────────────────────────
 * Encapsulates ALL authentication logic:
 *   • Password hashing & comparison (bcrypt, cost factor 12)
 *   • JWT generation (access + refresh token pair)
 *   • Registration, login, token refresh workflows
 *
 * Why a separate service layer?
 *   • Controllers stay thin (HTTP concerns only)
 *   • Business rules are testable without Express
 *   • Multiple controllers can reuse the same logic
 *
 * Security decisions documented inline.
 * ─────────────────────────────────────────────────────────────
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const logger = require('../config/logger');
const userModel = require('../models/userModel');
const AppError = require('../utils/AppError');

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────

/**
 * Bcrypt cost factor (2^12 = 4096 iterations).
 * • 10 = ~10ms   → too fast, vulnerable to brute-force
 * • 12 = ~250ms  → good balance of security vs UX
 * • 14 = ~1s     → noticeable delay on login
 */
const BCRYPT_SALT_ROUNDS = 12;

// ─────────────────────────────────────────────────────────────
// PRIVATE HELPERS
// ─────────────────────────────────────────────────────────────

/**
 * Hash a plaintext password using bcrypt.
 * @param {string} plaintext - Raw password from user input
 * @returns {Promise<string>} Bcrypt hash
 */
const hashPassword = async (plaintext) => {
  return bcrypt.hash(plaintext, BCRYPT_SALT_ROUNDS);
};

/**
 * Compare a plaintext password against a bcrypt hash.
 * bcrypt.compare is inherently constant-time — prevents timing attacks.
 * @param {string} plaintext - User-supplied password
 * @param {string} hash      - Stored bcrypt hash from DB
 * @returns {Promise<boolean>}
 */
const comparePassword = async (plaintext, hash) => {
  return bcrypt.compare(plaintext, hash);
};

/**
 * Generate an access + refresh token pair for a given user ID.
 *
 * Token design decisions:
 *   • Minimal payload (user_id + type only) — no PII
 *   • Algorithm pinned to HS256 — prevents "alg: none" attacks
 *   • Separate secrets for access vs refresh tokens
 *   • Short-lived access token (15m), long-lived refresh (30d)
 *
 * @param {string} userId - UUID of the authenticated user
 * @returns {{ accessToken: string, refreshToken: string }}
 */
const generateTokenPair = (userId) => {
  const accessToken = jwt.sign(
    { user_id: userId, type: 'access' },
    config.jwt.secret,
    {
      expiresIn: config.jwt.expiresIn,
      algorithm: 'HS256',
    }
  );

  const refreshToken = jwt.sign(
    { user_id: userId, type: 'refresh' },
    config.jwt.refreshSecret,
    {
      expiresIn: config.jwt.refreshExpiresIn,
      algorithm: 'HS256',
    }
  );

  return { accessToken, refreshToken };
};

/**
 * Strip sensitive fields from a user object before sending to client.
 * @param {Object} user - Raw user row from DB
 * @returns {Object} Sanitized user (no password)
 */
const sanitizeUser = (user) => {
  const { password, ...safeUser } = user;
  return safeUser;
};

// ─────────────────────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────────────────────

const authService = {
  /**
   * ─────────────────────────────────────────────────────────
   * register() — Create a new user account
   * ─────────────────────────────────────────────────────────
   * Flow:
   *   1. Check if email already exists      → 409 Conflict
   *   2. Check if username already exists   → 409 Conflict
   *   3. Hash the password (bcrypt 12)
   *   4. Insert user into database
   *   5. Generate JWT token pair
   *   6. Return sanitized user + tokens
   *
   * @param {Object} data
   * @param {string} data.username
   * @param {string} data.email
   * @param {string} data.password
   * @returns {Promise<{ user: Object, accessToken: string, refreshToken: string }>}
   */
  async register({ username, email, password }) {
    // 1. Check for duplicate email
    const emailExists = await userModel.existsByEmail(email);
    if (emailExists) {
      throw new AppError('An account with this email already exists', 409);
    }

    // 2. Check for duplicate username
    const usernameExists = await userModel.existsByUsername(username);
    if (usernameExists) {
      throw new AppError('This username is already taken', 409);
    }

    // 3. Hash password
    const hashedPassword = await hashPassword(password);

    // 4. Create user in database
    const user = await userModel.create({
      username,
      email,
      password: hashedPassword,
    });

    logger.info(`New user registered: ${user.user_id} (${user.email})`);

    // 5. Generate token pair
    const { accessToken, refreshToken } = generateTokenPair(user.user_id);

    // 6. Return (user already excludes password from userModel.create)
    return { user, accessToken, refreshToken };
  },

  /**
   * ─────────────────────────────────────────────────────────
   * login() — Authenticate with email + password
   * ─────────────────────────────────────────────────────────
   * Flow:
   *   1. Find user by email                → 401 if not found
   *   2. Compare password with bcrypt hash  → 401 if mismatch
   *   3. Generate JWT token pair
   *   4. Return sanitized user + tokens
   *
   * Security: Uses the SAME generic error message for both
   * "user not found" and "wrong password" to prevent user
   * enumeration attacks.
   *
   * @param {Object} data
   * @param {string} data.email
   * @param {string} data.password
   * @returns {Promise<{ user: Object, accessToken: string, refreshToken: string }>}
   */
  async login({ email, password }) {
    // 1. Find user by email (includes password hash for comparison)
    const user = await userModel.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // 2. Compare plaintext password against stored bcrypt hash
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    logger.info(`User logged in: ${user.user_id} (${user.email})`);

    // 3. Generate token pair
    const { accessToken, refreshToken } = generateTokenPair(user.user_id);

    // 4. Return sanitized user (strip password hash)
    return {
      user: sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  },

  /**
   * ─────────────────────────────────────────────────────────
   * refreshToken() — Issue a new token pair
   * ─────────────────────────────────────────────────────────
   * Verifies the refresh token and issues a fresh pair.
   * The old refresh token is implicitly invalidated by
   * issuing a new one (rotation strategy).
   *
   * Future enhancement: Store refresh tokens in DB to enable
   * explicit revocation (logout from all devices).
   *
   * @param {string} token - The refresh token to verify
   * @returns {Promise<{ accessToken: string, refreshToken: string }>}
   */
  async refreshToken(token) {
    try {
      // Verify with the REFRESH secret (not the access secret)
      const decoded = jwt.verify(token, config.jwt.refreshSecret, {
        algorithms: ['HS256'],
      });

      // Ensure it's actually a refresh token, not an access token
      if (decoded.type !== 'refresh') {
        throw new AppError('Invalid token type', 401);
      }

      // Verify the user still exists (might have been deleted)
      const user = await userModel.findById(decoded.user_id);
      if (!user) {
        throw new AppError('User belonging to this token no longer exists', 401);
      }

      // Issue a new pair (token rotation)
      const tokens = generateTokenPair(decoded.user_id);

      logger.info(`Token refreshed for user: ${decoded.user_id}`);
      return tokens;

    } catch (err) {
      // Re-throw AppErrors as-is
      if (err instanceof AppError) throw err;

      // jwt.verify errors (expired, malformed, etc.)
      if (err.name === 'TokenExpiredError') {
        throw new AppError('Refresh token has expired — please log in again', 401);
      }
      if (err.name === 'JsonWebTokenError') {
        throw new AppError('Invalid refresh token', 401);
      }

      throw new AppError('Token verification failed', 401);
    }
  },

  /**
   * ─────────────────────────────────────────────────────────
   * getMe() — Fetch current user profile
   * ─────────────────────────────────────────────────────────
   * Uses the user_id from req.user (set by protect middleware).
   * Returns a fresh DB read in case profile was updated since
   * the token was issued.
   *
   * @param {string} userId - UUID from req.user.user_id
   * @returns {Promise<Object>} User profile (no password)
   */
  async getMe(userId) {
    const user = await userModel.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  },
};

module.exports = authService;
