/**
 * ─────────────────────────────────────────────────────────────
 * Centralized Configuration
 * ─────────────────────────────────────────────────────────────
 * Merges all environment variables into a single, validated
 * config object. Every module imports config from here —
 * never read process.env directly elsewhere.
 *
 * Benefits:
 *   • Single source of truth for all settings
 *   • Default values for optional variables
 *   • Fail-fast if a required variable is missing
 * ─────────────────────────────────────────────────────────────
 */

const config = {
  // ── Application ─────────────────────────────────────────
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  apiPrefix: process.env.API_PREFIX || '/api/v1',

  // ── Database (PostgreSQL) ───────────────────────────────
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    name: process.env.DB_NAME || 'ecotrack_dev',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    ssl: process.env.DB_SSL === 'true',
    pool: {
      min: parseInt(process.env.DB_POOL_MIN, 10) || 2,
      max: parseInt(process.env.DB_POOL_MAX, 10) || 10,
    },
  },

  // ── JWT Authentication ──────────────────────────────────
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  // ── CORS ────────────────────────────────────────────────
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },

  // ── Rate Limiting ───────────────────────────────────────
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,  // 15 min
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  },

  // ── Logging ─────────────────────────────────────────────
  logLevel: process.env.LOG_LEVEL || 'debug',
};

// ── Validation ────────────────────────────────────────────
// Fail fast in production if critical secrets are missing.

if (config.env === 'production') {
  const required = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'DB_PASSWORD'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables in production: ${missing.join(', ')}`
    );
  }
}

module.exports = config;
