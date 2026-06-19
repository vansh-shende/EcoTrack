/**
 * ─────────────────────────────────────────────────────────────
 * AppError — Custom Operational Error Class
 * ─────────────────────────────────────────────────────────────
 * Extends the native Error to carry:
 *   • statusCode  (HTTP status)
 *   • status      ('fail' for 4xx, 'error' for 5xx)
 *   • isOperational (true = expected error, safe to show to client)
 *
 * Usage:
 *   throw new AppError('User not found', 404);
 *   throw new AppError('Invalid credentials', 401);
 * ─────────────────────────────────────────────────────────────
 */

class AppError extends Error {
  /**
   * @param {string} message - Human-readable error description
   * @param {number} statusCode - HTTP status code (default: 500)
   */
  constructor(message, statusCode = 500) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    // Capture stack trace, excluding the constructor from it
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
