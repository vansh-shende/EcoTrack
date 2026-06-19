/**
 * ─────────────────────────────────────────────────────────────
 * Winston Logger Configuration
 * ─────────────────────────────────────────────────────────────
 * Structured logging with environment-aware transports:
 *   • Development → colorized console output
 *   • Production  → JSON format, file rotation ready
 *
 * Usage:
 *   const logger = require('./config/logger');
 *   logger.info('User registered', { userId: '...' });
 *   logger.error('Payment failed', { error: err.message });
 * ─────────────────────────────────────────────────────────────
 */

const { createLogger, format, transports } = require('winston');

const isProduction = process.env.NODE_ENV === 'production';

// ── Custom Formats ──────────────────────────────────────────

// Development: colorized, human-readable output
const devFormat = format.combine(
  format.timestamp({ format: 'HH:mm:ss' }),
  format.colorize(),
  format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} ${level}: ${message} ${metaStr}`;
  })
);

// Production: structured JSON for log aggregators (ELK, Datadog, etc.)
const prodFormat = format.combine(
  format.timestamp(),
  format.errors({ stack: true }),
  format.json()
);

// ── Logger Instance ─────────────────────────────────────────

const logger = createLogger({
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  format: isProduction ? prodFormat : devFormat,
  defaultMeta: { service: 'ecotrack-api' },
  transports: [
    // Console transport — always active
    new transports.Console(),
  ],
  // Don't exit on handled exceptions — let the error handler deal with them
  exitOnError: false,
});

// In production, also write to rotating log files (uncomment & configure):
// if (isProduction) {
//   logger.add(new transports.File({ filename: 'logs/error.log', level: 'error' }));
//   logger.add(new transports.File({ filename: 'logs/combined.log' }));
// }

module.exports = logger;
