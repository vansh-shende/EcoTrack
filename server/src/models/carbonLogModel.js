/**
 * ─────────────────────────────────────────────────────────────
 * Carbon Log Model — Data Access Layer for `carbon_logs` table
 * ─────────────────────────────────────────────────────────────
 * Contains ALL SQL queries for carbon emission logs:
 *   • CRUD operations (create, read, update, delete)
 *   • Analytics aggregations (daily, weekly, monthly, category)
 *   • Dashboard summaries (period comparison, top category)
 *
 * Every query is parameterized ($1, $2, ...) to prevent SQL
 * injection. All analytics queries are scoped to a single user
 * via the user_id parameter.
 *
 * Index coverage (from 001_initial_schema.sql):
 *   • idx_carbon_logs_user_date     → time-series queries
 *   • idx_carbon_logs_user_category → category aggregations
 *   • idx_carbon_logs_date          → global date queries
 *   • idx_carbon_logs_category      → global category queries
 * ─────────────────────────────────────────────────────────────
 */

const db = require('../config/db');

// ─────────────────────────────────────────────────────────────
// PERIOD CONFIGURATION
// ─────────────────────────────────────────────────────────────
// Maps period names to PostgreSQL interval strings.
// compareInterval is 2x the period — used for period-over-period
// comparison (e.g., "this month vs last month").

const PERIOD_CONFIG = {
  day:   { interval: '1 day',    compareInterval: '2 days'   },
  week:  { interval: '7 days',   compareInterval: '14 days'  },
  month: { interval: '30 days',  compareInterval: '60 days'  },
  year:  { interval: '365 days', compareInterval: '730 days' },
};

const carbonLogModel = {
  // ═══════════════════════════════════════════════════════════
  // CRUD OPERATIONS
  // ═══════════════════════════════════════════════════════════

  /**
   * Insert a new carbon log entry.
   * @param {string} userId - UUID of the user
   * @param {Object} data - Log data
   * @returns {Promise<Object>} Created log row
   */
  async create(userId, { category, input_value, calculated_co2, log_date }) {
    const { rows } = await db.query(
      `INSERT INTO carbon_logs (user_id, category, input_value, calculated_co2, log_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING log_id, user_id, category, input_value, calculated_co2, log_date, created_at, updated_at`,
      [userId, category, input_value, calculated_co2, log_date]
    );
    return rows[0];
  },

  /**
   * Find a single log by ID, scoped to the user (ownership check).
   * @param {string} logId  - UUID of the log
   * @param {string} userId - UUID of the user
   * @returns {Promise<Object|null>}
   */
  async findById(logId, userId) {
    const { rows } = await db.query(
      `SELECT log_id, user_id, category, input_value, calculated_co2, log_date, created_at, updated_at
       FROM carbon_logs
       WHERE log_id = $1 AND user_id = $2`,
      [logId, userId]
    );
    return rows[0] || null;
  },

  /**
   * Paginated list of logs for a user with optional filters.
   * @param {string} userId
   * @param {Object} options - { page, limit, category, start_date, end_date, sortField, sortOrder }
   * @returns {Promise<{ data: Array, total: number }>}
   */
  async findAll(userId, { page = 1, limit = 20, category, start_date, end_date, sortField = 'log_date', sortOrder = 'desc' }) {
    // Build WHERE clauses dynamically
    const conditions = ['user_id = $1'];
    const params = [userId];
    let paramIndex = 2;

    if (category) {
      conditions.push(`category = $${paramIndex++}`);
      params.push(category);
    }
    if (start_date) {
      conditions.push(`log_date >= $${paramIndex++}`);
      params.push(start_date);
    }
    if (end_date) {
      conditions.push(`log_date <= $${paramIndex++}`);
      params.push(end_date);
    }

    const whereClause = conditions.join(' AND ');

    // Whitelist sort fields to prevent SQL injection
    const allowedSortFields = ['log_date', 'created_at', 'calculated_co2'];
    const safeField = allowedSortFields.includes(sortField) ? sortField : 'log_date';
    const safeOrder = sortOrder === 'asc' ? 'ASC' : 'DESC';

    const offset = (page - 1) * limit;

    // Count total (for pagination meta)
    const countResult = await db.query(
      `SELECT COUNT(*) AS total FROM carbon_logs WHERE ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].total, 10);

    // Fetch paginated data
    const dataResult = await db.query(
      `SELECT log_id, category, input_value, calculated_co2, log_date, created_at, updated_at
       FROM carbon_logs
       WHERE ${whereClause}
       ORDER BY ${safeField} ${safeOrder}
       LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      [...params, limit, offset]
    );

    return { data: dataResult.rows, total };
  },

  /**
   * Update a carbon log entry (ownership-scoped).
   * @param {string} logId
   * @param {string} userId
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object|null>} Updated row or null
   */
  async update(logId, userId, updates) {
    const fields = [];
    const params = [];
    let paramIndex = 1;

    // Build SET clause dynamically from provided fields
    for (const [key, value] of Object.entries(updates)) {
      if (['category', 'input_value', 'calculated_co2', 'log_date'].includes(key)) {
        fields.push(`${key} = $${paramIndex++}`);
        params.push(value);
      }
    }

    if (fields.length === 0) return null;

    params.push(logId, userId);

    const { rows } = await db.query(
      `UPDATE carbon_logs
       SET ${fields.join(', ')}
       WHERE log_id = $${paramIndex++} AND user_id = $${paramIndex++}
       RETURNING log_id, user_id, category, input_value, calculated_co2, log_date, created_at, updated_at`,
      params
    );
    return rows[0] || null;
  },

  /**
   * Delete a carbon log entry (ownership-scoped).
   * @param {string} logId
   * @param {string} userId
   * @returns {Promise<boolean>} True if deleted
   */
  async remove(logId, userId) {
    const { rowCount } = await db.query(
      `DELETE FROM carbon_logs WHERE log_id = $1 AND user_id = $2`,
      [logId, userId]
    );
    return rowCount > 0;
  },

  // ═══════════════════════════════════════════════════════════
  // ANALYTICS — DASHBOARD QUERIES
  // ═══════════════════════════════════════════════════════════

  /**
   * Period summary with comparison to previous period.
   * Single query using FILTER (WHERE ...) to compute both periods.
   *
   * @param {string} userId
   * @param {string} period - 'day' | 'week' | 'month' | 'year'
   * @returns {Promise<Object>} { current_co2_kg, current_count, previous_co2_kg, previous_count }
   */
  async getPeriodSummary(userId, period = 'month') {
    const { compareInterval } = PERIOD_CONFIG[period] || PERIOD_CONFIG.month;
    const { interval } = PERIOD_CONFIG[period] || PERIOD_CONFIG.month;

    const { rows } = await db.query(
      `WITH period_data AS (
          SELECT
              calculated_co2,
              CASE
                  WHEN log_date >= CURRENT_DATE - $2::INTERVAL
                  THEN 'current'
                  ELSE 'previous'
              END AS period
          FROM carbon_logs
          WHERE user_id = $1
            AND log_date >= CURRENT_DATE - $3::INTERVAL
       )
       SELECT
           COALESCE(SUM(calculated_co2) FILTER (WHERE period = 'current'), 0)  AS current_co2_kg,
           COALESCE(COUNT(*)            FILTER (WHERE period = 'current'), 0)  AS current_count,
           COALESCE(SUM(calculated_co2) FILTER (WHERE period = 'previous'), 0) AS previous_co2_kg,
           COALESCE(COUNT(*)            FILTER (WHERE period = 'previous'), 0) AS previous_count
       FROM period_data`,
      [userId, interval, compareInterval]
    );
    return rows[0];
  },

  /**
   * Top emission category for a user within a period.
   *
   * @param {string} userId
   * @param {string} period
   * @returns {Promise<Object|null>} { category, total_co2_kg }
   */
  async getTopCategory(userId, period = 'month') {
    const { interval } = PERIOD_CONFIG[period] || PERIOD_CONFIG.month;

    const { rows } = await db.query(
      `SELECT
           category,
           SUM(calculated_co2) AS total_co2_kg
       FROM carbon_logs
       WHERE user_id = $1
         AND log_date >= CURRENT_DATE - $2::INTERVAL
       GROUP BY category
       ORDER BY total_co2_kg DESC
       LIMIT 1`,
      [userId, interval]
    );
    return rows[0] || null;
  },

  /**
   * Time-series trend data grouped by day, week, or month.
   * Uses date_trunc() for uniform time bucketing.
   *
   * @param {string} userId
   * @param {string} period  - Date range
   * @param {string} groupBy - 'day' | 'week' | 'month'
   * @returns {Promise<Array>} [{ bucket, total_co2_kg, log_count }]
   */
  async getTrends(userId, period = 'month', groupBy = 'day') {
    const { interval } = PERIOD_CONFIG[period] || PERIOD_CONFIG.month;

    // Whitelist groupBy to prevent SQL injection
    const allowedGroups = ['day', 'week', 'month'];
    const safeGroupBy = allowedGroups.includes(groupBy) ? groupBy : 'day';

    const { rows } = await db.query(
      `SELECT
           date_trunc($3, log_date)::DATE  AS bucket,
           SUM(calculated_co2)             AS total_co2_kg,
           COUNT(*)                        AS log_count,
           ROUND(AVG(calculated_co2), 2)   AS avg_per_log_kg
       FROM carbon_logs
       WHERE user_id = $1
         AND log_date >= CURRENT_DATE - $2::INTERVAL
       GROUP BY bucket
       ORDER BY bucket ASC`,
      [userId, interval, safeGroupBy]
    );
    return rows;
  },

  /**
   * Category breakdown with percentages.
   * Uses a window function to calculate each category's share
   * of the user's total emissions.
   *
   * @param {string} userId
   * @param {string} period
   * @returns {Promise<Array>} [{ category, total_co2_kg, log_count, percentage }]
   */
  async getCategoryBreakdown(userId, period = 'month') {
    const { interval } = PERIOD_CONFIG[period] || PERIOD_CONFIG.month;

    const { rows } = await db.query(
      `WITH user_totals AS (
          SELECT
              category,
              SUM(calculated_co2) AS category_co2_kg,
              COUNT(*)            AS log_count
          FROM carbon_logs
          WHERE user_id = $1
            AND log_date >= CURRENT_DATE - $2::INTERVAL
          GROUP BY category
       )
       SELECT
           category,
           ROUND(category_co2_kg, 2)                                                          AS total_co2_kg,
           log_count,
           ROUND(category_co2_kg / NULLIF(SUM(category_co2_kg) OVER (), 0) * 100, 1)          AS percentage
       FROM user_totals
       ORDER BY category_co2_kg DESC`,
      [userId, interval]
    );
    return rows;
  },
};

module.exports = carbonLogModel;
