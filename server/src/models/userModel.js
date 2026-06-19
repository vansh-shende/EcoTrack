/**
 * ─────────────────────────────────────────────────────────────
 * User Model — Data Access Layer for the `users` table
 * ─────────────────────────────────────────────────────────────
 * All SQL queries related to user records live here.
 * Controllers/services NEVER write raw SQL — they call
 * these methods instead.
 *
 * Security notes:
 *   • findByEmail() returns the password hash (for bcrypt.compare)
 *   • findById()    EXCLUDES the password hash (for req.user)
 *   • create()      EXCLUDES the password hash from its return
 *
 * Usage:
 *   const userModel = require('../models/userModel');
 *   const user = await userModel.findByEmail('john@example.com');
 * ─────────────────────────────────────────────────────────────
 */

const db = require('../config/db');

const userModel = {
  /**
   * Create a new user record.
   * Password must already be hashed before calling this method.
   *
   * @param {Object} userData
   * @param {string} userData.username
   * @param {string} userData.email
   * @param {string} userData.password - Pre-hashed password
   * @returns {Promise<Object>} Created user (WITHOUT password)
   */
  async create({ username, email, password }) {
    const { rows } = await db.query(
      `INSERT INTO users (username, email, password)
       VALUES ($1, $2, $3)
       RETURNING user_id, username, email, created_at, updated_at`,
      [username, email, password]
    );
    return rows[0];
  },

  /**
   * Find a user by email (case-insensitive).
   * Returns the FULL row INCLUDING password hash — needed for
   * bcrypt.compare() during login.
   *
   * ⚠️ NEVER send this result directly to the client.
   *
   * @param {string} email
   * @returns {Promise<Object|null>} User row or null
   */
  async findByEmail(email) {
    const { rows } = await db.query(
      `SELECT user_id, username, email, password, created_at, updated_at
       FROM users
       WHERE LOWER(email) = LOWER($1)`,
      [email]
    );
    return rows[0] || null;
  },

  /**
   * Find a user by UUID primary key.
   * EXCLUDES the password hash — safe to attach to req.user.
   *
   * @param {string} userId - UUID
   * @returns {Promise<Object|null>} User row (no password) or null
   */
  async findById(userId) {
    const { rows } = await db.query(
      `SELECT user_id, username, email, created_at, updated_at
       FROM users
       WHERE user_id = $1`,
      [userId]
    );
    return rows[0] || null;
  },

  /**
   * Check if an email is already registered (case-insensitive).
   * Lightweight existence check — doesn't fetch full row.
   *
   * @param {string} email
   * @returns {Promise<boolean>}
   */
  async existsByEmail(email) {
    const { rows } = await db.query(
      `SELECT 1 FROM users WHERE LOWER(email) = LOWER($1)`,
      [email]
    );
    return rows.length > 0;
  },

  /**
   * Check if a username is already taken (case-insensitive).
   *
   * @param {string} username
   * @returns {Promise<boolean>}
   */
  async existsByUsername(username) {
    const { rows } = await db.query(
      `SELECT 1 FROM users WHERE LOWER(username) = LOWER($1)`,
      [username]
    );
    return rows.length > 0;
  },
};

module.exports = userModel;
