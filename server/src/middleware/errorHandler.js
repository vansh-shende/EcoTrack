/**
 * ─────────────────────────────────────────────────────────────
 * Error Handling Middleware
 * ─────────────────────────────────────────────────────────────
 * Two handlers registered at the END of the middleware chain:
 *
 *   1. notFoundHandler   → Catches requests to undefined routes (404)
 *   2. globalErrorHandler → Catches all errors thrown/next(err)'d
 *                           from any middleware or route handler
 *
 * Uses the custom AppError class for operational errors.
 * ─────────────────────────────────────────────────────────────
 */

const config = require('../config');
const logger = require('../config/logger');
const AppError = require('../utils/AppError');

/**
 * 404 Not Found Handler
 * Triggered when no route matches the incoming request.
 */
const notFoundHandler = (req, _res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

/**
 * Global Error Handler
 * Express requires the (err, req, res, next) signature to
 * recognize this as an error-handling middleware.
 */
// eslint-disable-next-line no-unused-vars
const globalErrorHandler = (err, req, res, _next) => {
  // ── Defaults ────────────────────────────────────────────
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // ── Logging ─────────────────────────────────────────────
  // Log full stack for server errors; skip for expected client errors
  if (err.statusCode >= 500) {
    logger.error(`${err.statusCode} — ${err.message}`, {
      stack: err.stack,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
    });
  } else {
    logger.warn(`${err.statusCode} — ${err.message}`, {
      method: req.method,
      url: req.originalUrl,
    });
  }

  // ── Response ────────────────────────────────────────────
  // In development: send full error details + stack trace
  // In production: hide internal details from the client

  if (config.env === 'development') {
    return res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack,
    });
  }

  // Production response
  if (err.isOperational) {
    // Operational errors are expected (bad input, not found, etc.)
    return res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
    });
  }

  // Programming/unknown errors — don't leak details
  return res.status(500).json({
    success: false,
    status: 'error',
    message: 'Something went wrong. Please try again later.',
  });
};

module.exports = {
  notFoundHandler,
  globalErrorHandler,
};
