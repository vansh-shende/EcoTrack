/**
 * ═══════════════════════════════════════════════════════════════
 * EcoTrack — PostgreSQL Database Module
 * ═══════════════════════════════════════════════════════════════
 *
 * A production-ready, reusable PostgreSQL connection module
 * built on top of the `pg` package.
 *
 * Features:
 *   ✔ Connection Pooling     — Efficient connection reuse & queueing
 *   ✔ Environment Variables  — All config via .env (never hardcoded)
 *   ✔ Error Handling         — Granular error classification & logging
 *   ✔ Auto Reconnection     — Exponential backoff retry strategy
 *   ✔ Transaction Support   — Managed transaction helper with rollback
 *   ✔ Health Check          — Liveness probe for load balancers
 *   ✔ Query Logging         — Optional slow-query detection
 *   ✔ Graceful Shutdown     — Clean pool drain on SIGTERM/SIGINT
 *
 * Usage:
 *   const db = require('./config/db');
 *
 *   // Simple query
 *   const users = await db.query('SELECT * FROM users WHERE id = $1', [id]);
 *
 *   // Transaction
 *   const result = await db.transaction(async (client) => {
 *     await client.query('INSERT INTO users ...', [...]);
 *     await client.query('INSERT INTO carbon_logs ...', [...]);
 *     return { success: true };
 *   });
 *
 *   // Health check
 *   const healthy = await db.healthCheck();
 *
 * ═══════════════════════════════════════════════════════════════
 */

const { Pool } = require('pg');
const config = require('./index');
const logger = require('./logger');

// ─────────────────────────────────────────────────────────────
// BEST PRACTICES — Why each config option matters
// ─────────────────────────────────────────────────────────────
//
// 1. POOL SIZING (min / max)
//    • min: Keep a warm pool of idle connections ready — avoids
//      cold-start latency on the first query after a quiet period.
//    • max: Cap total connections to prevent exhausting PostgreSQL's
//      `max_connections` (default: 100). Rule of thumb:
//        max = (number of CPU cores * 2) + spinning_disks
//      For most apps, 10–20 is optimal.
//
// 2. IDLE TIMEOUT (idleTimeoutMillis)
//    Close connections sitting unused in the pool. Prevents
//    resource hoarding and stale TCP connections through firewalls.
//
// 3. CONNECTION TIMEOUT (connectionTimeoutMillis)
//    Fail fast if the database is unreachable — don't let requests
//    queue up indefinitely. 5 seconds is aggressive but reasonable.
//
// 4. STATEMENT TIMEOUT (statement_timeout)
//    Kill any single query running longer than 30 seconds.
//    Prevents runaway queries from locking tables or exhausting CPU.
//
// 5. SSL
//    Always enable for cloud-hosted databases (AWS RDS, Supabase,
//    Neon, etc.). `rejectUnauthorized: false` is acceptable for
//    development; in production, pin the CA certificate.
//
// 6. APPLICATION NAME
//    Tags every connection in pg_stat_activity so DBAs can identify
//    which service is responsible for a query.
// ─────────────────────────────────────────────────────────────

// ═══════════════════════════════════════════════════════════════
// 1. POOL CREATION
// ═══════════════════════════════════════════════════════════════

const poolConfig = {
  // Connection parameters (from .env via centralized config)
  host: config.db.host,
  port: config.db.port,
  database: config.db.name,
  user: config.db.user,
  password: config.db.password,

  // ── Pool Sizing ───────────────────────────────────────────
  min: config.db.pool.min,       // Warm connections kept ready (default: 2)
  max: config.db.pool.max,       // Hard cap on concurrent connections (default: 10)

  // ── Timeouts ──────────────────────────────────────────────
  idleTimeoutMillis: 30_000,          // Close idle connections after 30s
  connectionTimeoutMillis: 15_000,    // Fail if connection takes > 15s (supports Neon serverless wake-up)
  allowExitOnIdle: false,             // Keep pool alive even when idle

  // ── SSL ───────────────────────────────────────────────────
  ssl: config.db.ssl
    ? { rejectUnauthorized: false }   // Accept self-signed in dev
    : false,

  // ── Connection-level settings ─────────────────────────────
  // Applied to every new connection via pg's `options` parameter
  application_name: 'ecotrack-api',   // Visible in pg_stat_activity
};

const pool = new Pool(poolConfig);

// ═══════════════════════════════════════════════════════════════
// 2. POOL EVENT LISTENERS
// ═══════════════════════════════════════════════════════════════

// Track active/idle/waiting counts for observability
let poolStats = { totalConnections: 0, activeQueries: 0 };

pool.on('connect', (client) => {
  poolStats.totalConnections++;
  logger.debug(
    `PostgreSQL — new connection established ` +
    `(total: ${pool.totalCount}, idle: ${pool.idleCount}, waiting: ${pool.waitingCount})`
  );

  // Set statement timeout on every new connection (30 seconds)
  // This is a safety net — prevents any single query from running forever
  client.query('SET statement_timeout = 30000').catch((err) => {
    logger.warn(`Failed to set statement_timeout: ${err.message}`);
  });
});

pool.on('acquire', () => {
  poolStats.activeQueries++;
  logger.debug(
    `PostgreSQL — connection acquired from pool ` +
    `(active: ${pool.totalCount - pool.idleCount}/${pool.totalCount})`
  );
});

pool.on('release', () => {
  poolStats.activeQueries = Math.max(0, poolStats.activeQueries - 1);
});

pool.on('remove', () => {
  logger.debug(
    `PostgreSQL — connection removed from pool ` +
    `(remaining: ${pool.totalCount})`
  );
});

pool.on('error', (err, client) => {
  // This fires for idle client errors (e.g., connection dropped by server)
  // The pool automatically removes the dead client and creates a new one
  logger.error('PostgreSQL — unexpected idle client error:', {
    message: err.message,
    code: err.code,
    // Common codes:
    // ECONNREFUSED  → DB server is down
    // ECONNRESET    → Connection dropped (network, server restart)
    // 57P01         → Admin shutdown
    // 57P03         → Cannot connect during recovery
  });
});

// ═══════════════════════════════════════════════════════════════
// 3. AUTOMATIC RECONNECTION — Exponential Backoff Strategy
// ═══════════════════════════════════════════════════════════════
//
// How it works:
//   • On startup, we test the connection. If it fails, we retry.
//   • Each retry doubles the wait time (1s → 2s → 4s → 8s → 16s)
//   • After MAX_RETRIES failures, we log a critical error but
//     DON'T crash — the pool will keep retrying on actual queries.
//
// Why not crash?
//   • In containerized environments (Docker, K8s), the DB might
//     start after the app. Crashing creates restart loops.
//   • The pg Pool handles per-query reconnection automatically.
//     Our retry loop is only for the initial startup health check.
// ═══════════════════════════════════════════════════════════════

const RECONNECT_CONFIG = {
  MAX_RETRIES: 5,                 // Total retry attempts
  BASE_DELAY_MS: 1_000,          // First retry after 1 second
  MAX_DELAY_MS: 30_000,          // Never wait longer than 30 seconds
  JITTER: true,                  // Add randomness to prevent thundering herd
};

/**
 * Calculate delay with exponential backoff + optional jitter.
 * @param {number} attempt - Current retry attempt (0-indexed)
 * @returns {number} Delay in milliseconds
 */
const getBackoffDelay = (attempt) => {
  const exponentialDelay = RECONNECT_CONFIG.BASE_DELAY_MS * Math.pow(2, attempt);
  const cappedDelay = Math.min(exponentialDelay, RECONNECT_CONFIG.MAX_DELAY_MS);

  if (RECONNECT_CONFIG.JITTER) {
    // Add ±25% random jitter to prevent synchronized retries
    const jitter = cappedDelay * 0.25 * (Math.random() * 2 - 1);
    return Math.floor(cappedDelay + jitter);
  }

  return cappedDelay;
};

/**
 * Attempts to connect to PostgreSQL with exponential backoff.
 * Called once on module load. Logs connection status at each step.
 */
const connectWithRetry = async () => {
  for (let attempt = 0; attempt <= RECONNECT_CONFIG.MAX_RETRIES; attempt++) {
    try {
      const client = await pool.connect();
      const { rows } = await client.query(
        'SELECT NOW() AS server_time, current_database() AS db_name, version() AS pg_version'
      );
      client.release();

      const { server_time, db_name, pg_version } = rows[0];
      // Extract just the version number (e.g., "PostgreSQL 15.4")
      const versionShort = pg_version.split(',')[0];

      logger.info(`
  ╔═══════════════════════════════════════════════════╗
  ║       🐘 PostgreSQL Connected Successfully       ║
  ╠═══════════════════════════════════════════════════╣
  ║  Database : ${db_name.padEnd(36)}║
  ║  Host     : ${(config.db.host + ':' + config.db.port).padEnd(36)}║
  ║  Version  : ${versionShort.padEnd(36).substring(0, 36)}║
  ║  Pool     : ${(config.db.pool.min + '-' + config.db.pool.max + ' connections').padEnd(36)}║
  ║  Time     : ${new Date(server_time).toISOString().padEnd(36)}║
  ╚═══════════════════════════════════════════════════╝`);

      return true; // Connected successfully

    } catch (err) {
      const isLastAttempt = attempt === RECONNECT_CONFIG.MAX_RETRIES;

      if (isLastAttempt) {
        logger.error(
          `PostgreSQL — all ${RECONNECT_CONFIG.MAX_RETRIES + 1} connection attempts failed. ` +
          `Last error: ${err.message}`
        );
        logger.error(
          'The server will continue running — queries will retry automatically. ' +
          'Check your DB_* environment variables and ensure PostgreSQL is running.'
        );
        return false;
      }

      const delay = getBackoffDelay(attempt);
      logger.warn(
        `PostgreSQL — connection attempt ${attempt + 1}/${RECONNECT_CONFIG.MAX_RETRIES + 1} failed: ${err.message}. ` +
        `Retrying in ${delay}ms...`
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

// ── Kick off the connection attempt on module load ──────────
connectWithRetry();

// ═══════════════════════════════════════════════════════════════
// 4. DATABASE INTERFACE (exported API)
// ═══════════════════════════════════════════════════════════════

const db = {
  /**
   * ─────────────────────────────────────────────────────────
   * query() — Execute a parameterized SQL query
   * ─────────────────────────────────────────────────────────
   * Uses the pool directly (acquires → executes → releases).
   * Includes automatic slow-query logging.
   *
   * @param {string} text - SQL query with $1, $2, ... placeholders
   * @param {Array} params - Parameter values (prevents SQL injection)
   * @returns {Promise<import('pg').QueryResult>}
   *
   * @example
   *   const { rows } = await db.query(
   *     'SELECT * FROM users WHERE email = $1',
   *     ['user@example.com']
   *   );
   */
  async query(text, params = []) {
    const start = Date.now();

    try {
      const result = await pool.query(text, params);
      const duration = Date.now() - start;

      // Log slow queries (> 500ms) for performance monitoring
      if (duration > 500) {
        logger.warn(`Slow query detected (${duration}ms):`, {
          text: text.substring(0, 200), // Truncate long queries
          duration,
          rows: result.rowCount,
        });
      } else {
        logger.debug(`Query executed (${duration}ms): ${text.substring(0, 80)}...`);
      }

      return result;

    } catch (err) {
      // Enhance the error with query context for debugging
      logger.error('Query execution failed:', {
        query: text.substring(0, 200),
        error: err.message,
        code: err.code,
        duration: Date.now() - start,
      });
      throw err; // Re-throw for the caller to handle
    }
  },

  /**
   * ─────────────────────────────────────────────────────────
   * getClient() — Acquire a dedicated client from the pool
   * ─────────────────────────────────────────────────────────
   * Use this when you need multiple queries on the SAME
   * connection (e.g., transactions, advisory locks, temp tables).
   *
   * ⚠️ CRITICAL: Always release the client in a finally block!
   *
   * @returns {Promise<import('pg').PoolClient>}
   *
   * @example
   *   const client = await db.getClient();
   *   try {
   *     await client.query('BEGIN');
   *     await client.query('INSERT INTO ...', [...]);
   *     await client.query('COMMIT');
   *   } catch (err) {
   *     await client.query('ROLLBACK');
   *     throw err;
   *   } finally {
   *     client.release(); // ← ALWAYS release!
   *   }
   */
  async getClient() {
    const client = await pool.connect();

    // Monkey-patch the release method to log unreleased clients
    const originalRelease = client.release.bind(client);
    const releaseTimeout = setTimeout(() => {
      logger.warn(
        'A database client has been checked out for more than 10 seconds. ' +
        'Did you forget to call client.release()?'
      );
    }, 10_000);

    client.release = () => {
      clearTimeout(releaseTimeout);
      client.release = originalRelease; // Restore original
      return originalRelease();
    };

    return client;
  },

  /**
   * ─────────────────────────────────────────────────────────
   * transaction() — Execute queries within a managed transaction
   * ─────────────────────────────────────────────────────────
   * Handles BEGIN, COMMIT, and ROLLBACK automatically.
   * The callback receives a dedicated client for all queries.
   *
   * If the callback throws, the transaction is rolled back
   * and the error is re-thrown to the caller.
   *
   * @param {(client: import('pg').PoolClient) => Promise<T>} callback
   * @returns {Promise<T>} The return value of the callback
   *
   * @example
   *   const newUser = await db.transaction(async (client) => {
   *     const { rows: [user] } = await client.query(
   *       'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *',
   *       ['john', 'john@example.com', hashedPassword]
   *     );
   *
   *     await client.query(
   *       'INSERT INTO ai_insights (user_id, message) VALUES ($1, $2)',
   *       [user.user_id, 'Welcome to EcoTrack! Start logging your carbon footprint.']
   *     );
   *
   *     return user; // This value is returned by db.transaction()
   *   });
   */
  async transaction(callback) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      logger.debug('Transaction — BEGIN');

      const result = await callback(client);

      await client.query('COMMIT');
      logger.debug('Transaction — COMMIT');

      return result;

    } catch (err) {
      await client.query('ROLLBACK');
      logger.warn(`Transaction — ROLLBACK (${err.message})`);
      throw err; // Re-throw so the caller sees the error

    } finally {
      client.release(); // Always return the client to the pool
    }
  },

  /**
   * ─────────────────────────────────────────────────────────
   * healthCheck() — Verify database connectivity
   * ─────────────────────────────────────────────────────────
   * Returns a status object for health-check endpoints and
   * load balancer probes.
   *
   * @returns {Promise<Object>} Health status
   *
   * @example
   *   app.get('/health', async (req, res) => {
   *     const dbHealth = await db.healthCheck();
   *     res.json({ api: 'ok', database: dbHealth });
   *   });
   */
  async healthCheck() {
    const start = Date.now();

    try {
      const { rows } = await pool.query('SELECT 1 AS alive');
      return {
        status: 'healthy',
        responseTime: `${Date.now() - start}ms`,
        pool: {
          total: pool.totalCount,
          idle: pool.idleCount,
          waiting: pool.waitingCount,
        },
        connected: rows[0].alive === 1,
      };

    } catch (err) {
      return {
        status: 'unhealthy',
        responseTime: `${Date.now() - start}ms`,
        error: err.message,
        pool: {
          total: pool.totalCount,
          idle: pool.idleCount,
          waiting: pool.waitingCount,
        },
        connected: false,
      };
    }
  },

  /**
   * ─────────────────────────────────────────────────────────
   * getPoolStats() — Current pool metrics (for monitoring)
   * ─────────────────────────────────────────────────────────
   * @returns {Object} Pool size, idle count, waiting count
   */
  getPoolStats() {
    return {
      total: pool.totalCount,       // Total clients in the pool
      idle: pool.idleCount,         // Clients not running a query
      waiting: pool.waitingCount,   // Queued requests waiting for a client
      max: config.db.pool.max,      // Configured maximum
    };
  },

  /**
   * ─────────────────────────────────────────────────────────
   * end() — Drain and close the connection pool
   * ─────────────────────────────────────────────────────────
   * Called during graceful shutdown (see server.js).
   * Waits for in-flight queries to finish, then closes all
   * connections.
   *
   * @returns {Promise<void>}
   */
  async end() {
    logger.info('PostgreSQL — draining connection pool...');
    await pool.end();
    logger.info('PostgreSQL — all connections closed.');
  },

  // Expose the raw pool for advanced use cases (e.g., LISTEN/NOTIFY)
  pool,
};

module.exports = db;
