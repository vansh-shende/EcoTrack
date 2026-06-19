/**
 * ─────────────────────────────────────────────────────────────
 * AI Insight Model — Data Access Layer for the `ai_insights` table
 * ─────────────────────────────────────────────────────────────
 */

const db = require('../config/db');

const aiInsightModel = {
  /**
   * Create a new AI insight.
   *
   * @param {Object} data
   * @param {string} data.user_id - User UUID
   * @param {string} data.message - Insight recommendation message
   * @returns {Promise<Object>} Created insight
   */
  async create({ user_id, message }) {
    const { rows } = await db.query(
      `INSERT INTO ai_insights (user_id, message)
       VALUES ($1, $2)
       RETURNING insight_id, user_id, message, is_read, created_at`,
      [user_id, message]
    );
    return rows[0];
  },

  /**
   * List insights for a specific user with pagination and optional read filter.
   *
   * @param {string} user_id
   * @param {Object} [filters]
   * @param {number} [filters.limit=20]
   * @param {number} [filters.offset=0]
   * @param {boolean} [filters.is_read]
   * @returns {Promise<{rows: Array, count: number}>}
   */
  async list(user_id, { limit = 20, offset = 0, is_read } = {}) {
    let query = `FROM ai_insights WHERE user_id = $1`;
    const params = [user_id];

    if (typeof is_read === 'boolean') {
      params.push(is_read);
      query += ` AND is_read = $${params.length}`;
    }

    // Get total count
    const countRes = await db.query(`SELECT COUNT(*) as total ${query}`, params);
    const total = parseInt(countRes.rows[0].total, 10);

    // Get rows paginated
    params.push(limit, offset);
    const rowsRes = await db.query(
      `SELECT insight_id, user_id, message, is_read, created_at
       ${query}
       ORDER BY created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    return {
      rows: rowsRes.rows,
      total,
    };
  },

  /**
   * Get single insight by ID, ensuring user ownership.
   *
   * @param {string} insight_id
   * @param {string} user_id
   * @returns {Promise<Object|null>}
   */
  async getById(insight_id, user_id) {
    const { rows } = await db.query(
      `SELECT insight_id, user_id, message, is_read, created_at
       FROM ai_insights
       WHERE insight_id = $1 AND user_id = $2`,
      [insight_id, user_id]
    );
    return rows[0] || null;
  },

  /**
   * Mark an insight as read.
   *
   * @param {string} insight_id
   * @param {string} user_id
   * @returns {Promise<Object|null>}
   */
  async markAsRead(insight_id, user_id) {
    const { rows } = await db.query(
      `UPDATE ai_insights
       SET is_read = TRUE
       WHERE insight_id = $1 AND user_id = $2
       RETURNING insight_id, user_id, message, is_read, created_at`,
      [insight_id, user_id]
    );
    return rows[0] || null;
  },

  /**
   * Delete an insight.
   *
   * @param {string} insight_id
   * @param {string} user_id
   * @returns {Promise<boolean>}
   */
  async remove(insight_id, user_id) {
    const { rowCount } = await db.query(
      `DELETE FROM ai_insights
       WHERE insight_id = $1 AND user_id = $2`,
      [insight_id, user_id]
    );
    return rowCount > 0;
  },

  /**
   * Count unread insights for user.
   *
   * @param {string} user_id
   * @returns {Promise<number>}
   */
  async countUnread(user_id) {
    const { rows } = await db.query(
      `SELECT COUNT(*) as unread FROM ai_insights WHERE user_id = $1 AND is_read = FALSE`,
      [user_id]
    );
    return parseInt(rows[0].unread, 10);
  },

  /**
   * Clear all insights for a user (used during regenerate to prevent duplicate spam).
   *
   * @param {string} user_id
   * @returns {Promise<void>}
   */
  async clearAll(user_id) {
    await db.query(`DELETE FROM ai_insights WHERE user_id = $1`, [user_id]);
  },
};

module.exports = aiInsightModel;
