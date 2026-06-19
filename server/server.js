/**
 * ─────────────────────────────────────────────────────────────
 * EcoTrack — HTTP Server Entry Point
 * ─────────────────────────────────────────────────────────────
 * Responsibilities:
 *   1. Load environment variables (must happen FIRST)
 *   2. Initialize the database connection pool
 *   3. Boot the Express application
 *   4. Listen on the configured port
 *   5. Handle graceful shutdown (SIGTERM / SIGINT)
 *
 * This file deliberately does NOT contain Express middleware
 * or route definitions — those live in app.js.
 * ─────────────────────────────────────────────────────────────
 */

// Load .env before anything else
require('dotenv').config();

const app = require('./src/app');
const config = require('./src/config');
const logger = require('./src/config/logger');
const db = require('./src/config/db');

// ── Start Server ────────────────────────────────────────────

const server = app.listen(config.port, () => {
  logger.info(`
  ╔═══════════════════════════════════════════════════╗
  ║         🌍 EcoTrack API Server Running           ║
  ╠═══════════════════════════════════════════════════╣
  ║  Environment : ${config.env.padEnd(32)}║
  ║  Port        : ${String(config.port).padEnd(32)}║
  ║  API Prefix  : ${config.apiPrefix.padEnd(32)}║
  ║  Database    : ${config.db.name.padEnd(32)}║
  ╚═══════════════════════════════════════════════════╝
  `);
});

// ── Graceful Shutdown ───────────────────────────────────────
// Ensures in-flight requests complete and the DB pool drains
// before the process exits (critical for zero-downtime deploys).

const shutdown = async (signal) => {
  logger.info(`\n${signal} received — starting graceful shutdown...`);

  // 1. Stop accepting new connections
  server.close(async () => {
    logger.info('HTTP server closed.');

    try {
      // 2. Drain the PostgreSQL connection pool
      await db.end();
      logger.info('Database pool drained.');
    } catch (err) {
      logger.error('Error draining database pool:', err);
    }

    // 3. Exit
    logger.info('Shutdown complete. Goodbye! 🌿');
    process.exit(0);
  });

  // Force kill after 10 seconds if shutdown stalls
  setTimeout(() => {
    logger.error('Forced shutdown — could not close connections in time.');
    process.exit(1);
  }, 10_000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// ── Uncaught Error Safety Nets ──────────────────────────────

process.on('unhandledRejection', (reason) => {
  logger.error('UNHANDLED REJECTION:', reason);
  // Let the process crash so your process manager (PM2, Docker) restarts it
  throw reason;
});

process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION:', err);
  process.exit(1);
});

module.exports = server;
