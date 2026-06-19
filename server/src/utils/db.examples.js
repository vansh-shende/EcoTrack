/**
 * ═══════════════════════════════════════════════════════════════
 * db.js — Usage Examples
 * ═══════════════════════════════════════════════════════════════
 * This file demonstrates every method exposed by the database
 * module. It is NOT imported by the application — it exists
 * solely as a reference for developers.
 * ═══════════════════════════════════════════════════════════════
 */

const db = require('../config/db');

// ─────────────────────────────────────────────────────────────
// EXAMPLE 1: Simple Query
// ─────────────────────────────────────────────────────────────
// Use db.query() for standalone reads/writes.
// Always use parameterized queries ($1, $2) to prevent SQL injection.

async function getUserByEmail(email) {
  const { rows } = await db.query(
    'SELECT user_id, username, email, created_at FROM users WHERE email = $1',
    [email]
  );
  return rows[0] || null;
}

// ─────────────────────────────────────────────────────────────
// EXAMPLE 2: Insert with RETURNING
// ─────────────────────────────────────────────────────────────
// PostgreSQL's RETURNING clause gives you the inserted row
// without a second query.

async function createCarbonLog(userId, category, inputValue, calculatedCo2) {
  const { rows } = await db.query(
    `INSERT INTO carbon_logs (user_id, category, input_value, calculated_co2, log_date)
     VALUES ($1, $2, $3, $4, CURRENT_DATE)
     RETURNING *`,
    [userId, category, inputValue, calculatedCo2]
  );
  return rows[0];
}

// ─────────────────────────────────────────────────────────────
// EXAMPLE 3: Transaction
// ─────────────────────────────────────────────────────────────
// Use db.transaction() when multiple queries must succeed or
// fail as a unit. If any query throws, ALL changes are rolled back.

async function registerUser(username, email, hashedPassword) {
  return db.transaction(async (client) => {
    // Step 1: Create the user
    const { rows: [user] } = await client.query(
      `INSERT INTO users (username, email, password)
       VALUES ($1, $2, $3)
       RETURNING user_id, username, email, created_at`,
      [username, email, hashedPassword]
    );

    // Step 2: Create a welcome insight (same transaction)
    await client.query(
      `INSERT INTO ai_insights (user_id, message)
       VALUES ($1, $2)`,
      [user.user_id, '🌍 Welcome to EcoTrack! Start by logging your daily commute.']
    );

    // If either INSERT fails, BOTH are rolled back automatically
    return user;
  });
}

// ─────────────────────────────────────────────────────────────
// EXAMPLE 4: Dedicated Client (Advanced)
// ─────────────────────────────────────────────────────────────
// Use db.getClient() when you need manual control over the
// connection lifecycle (e.g., advisory locks, LISTEN/NOTIFY).

async function batchInsertWithLock(logs) {
  const client = await db.getClient();

  try {
    // Acquire an advisory lock (prevents concurrent batch imports)
    await client.query('SELECT pg_advisory_lock(12345)');

    await client.query('BEGIN');

    for (const log of logs) {
      await client.query(
        `INSERT INTO carbon_logs (user_id, category, input_value, calculated_co2)
         VALUES ($1, $2, $3, $4)`,
        [log.userId, log.category, log.inputValue, log.co2]
      );
    }

    await client.query('COMMIT');

    // Release the advisory lock
    await client.query('SELECT pg_advisory_unlock(12345)');

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;

  } finally {
    client.release(); // ⚠️ CRITICAL: Always release!
  }
}

// ─────────────────────────────────────────────────────────────
// EXAMPLE 5: Health Check (in a route handler)
// ─────────────────────────────────────────────────────────────

async function healthCheckHandler(req, res) {
  const dbHealth = await db.healthCheck();

  const status = dbHealth.status === 'healthy' ? 200 : 503;
  res.status(status).json({
    service: 'ecotrack-api',
    status: dbHealth.status === 'healthy' ? 'ok' : 'degraded',
    database: dbHealth,
    uptime: `${Math.floor(process.uptime())}s`,
  });

  // Example response:
  // {
  //   "service": "ecotrack-api",
  //   "status": "ok",
  //   "database": {
  //     "status": "healthy",
  //     "responseTime": "2ms",
  //     "pool": { "total": 5, "idle": 3, "waiting": 0 },
  //     "connected": true
  //   },
  //   "uptime": "3421s"
  // }
}

// ─────────────────────────────────────────────────────────────
// EXAMPLE 6: Pool Stats (for monitoring dashboards)
// ─────────────────────────────────────────────────────────────

function logPoolMetrics() {
  const stats = db.getPoolStats();
  console.log(`Pool: ${stats.total}/${stats.max} total, ${stats.idle} idle, ${stats.waiting} waiting`);

  // Example output:
  // Pool: 5/10 total, 3 idle, 0 waiting
}

// ─────────────────────────────────────────────────────────────
// EXAMPLE 7: Pagination Pattern
// ─────────────────────────────────────────────────────────────

async function getUserLogs(userId, page = 1, limit = 20) {
  const offset = (page - 1) * limit;

  // Run count + data queries in parallel for efficiency
  const [countResult, dataResult] = await Promise.all([
    db.query(
      'SELECT COUNT(*) FROM carbon_logs WHERE user_id = $1',
      [userId]
    ),
    db.query(
      `SELECT * FROM carbon_logs
       WHERE user_id = $1
       ORDER BY log_date DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    ),
  ]);

  return {
    data: dataResult.rows,
    pagination: {
      page,
      limit,
      total: parseInt(countResult.rows[0].count, 10),
      totalPages: Math.ceil(countResult.rows[0].count / limit),
    },
  };
}

// ─────────────────────────────────────────────────────────────
// EXAMPLE 8: Error Handling in Services
// ─────────────────────────────────────────────────────────────

const AppError = require('../utils/AppError');

async function getUserOrFail(userId) {
  const { rows } = await db.query(
    'SELECT * FROM users WHERE user_id = $1',
    [userId]
  );

  if (rows.length === 0) {
    // Throw an operational error — the error handler returns 404
    throw new AppError('User not found', 404);
  }

  return rows[0];
}

// Export for reference only — not used in the actual application
module.exports = {
  getUserByEmail,
  createCarbonLog,
  registerUser,
  batchInsertWithLock,
  healthCheckHandler,
  logPoolMetrics,
  getUserLogs,
  getUserOrFail,
};
