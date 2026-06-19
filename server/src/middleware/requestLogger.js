/**
 * ─────────────────────────────────────────────────────────────
 * Request Logger Middleware
 * ─────────────────────────────────────────────────────────────
 * Uses Morgan to log every HTTP request, piped through Winston
 * so all output goes through a single logging system.
 *
 * Formats:
 *   • Development → 'dev'    (concise, colorized)
 *   • Production  → 'combined' (Apache-style, for log aggregators)
 * ─────────────────────────────────────────────────────────────
 */

const morgan = require('morgan');
const config = require('../config');
const logger = require('../config/logger');

// Create a writable stream that pipes Morgan output into Winston
const stream = {
  write: (message) => {
    // Remove trailing newline that Morgan adds
    logger.http(message.trim());
  },
};

// Skip HTTP logging in test environment to keep test output clean
const skip = () => config.env === 'test';

const requestLogger = morgan(
  config.env === 'production' ? 'combined' : 'dev',
  { stream, skip }
);

module.exports = requestLogger;
