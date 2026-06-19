/**
 * ─────────────────────────────────────────────────────────────
 * Emission Service — Business Logic for Carbon Logs
 * ─────────────────────────────────────────────────────────────
 * Handles CRUD operations for carbon emission log entries.
 * Enforces ownership — users can only access their own logs.
 *
 * Uses carbonLogModel for all database operations.
 * ─────────────────────────────────────────────────────────────
 */

const carbonLogModel = require('../models/carbonLogModel');
const AppError = require('../utils/AppError');
const logger = require('../config/logger');

const emissionService = {
  /**
   * Create a new carbon log entry for the authenticated user.
   *
   * @param {string} userId - From req.user.user_id (set by protect middleware)
   * @param {Object} data   - Validated request body
   * @returns {Promise<Object>} Created log entry
   */
  async create(userId, data) {
    const log = await carbonLogModel.create(userId, data);

    logger.info(`Carbon log created: ${log.log_id} (${log.category}: ${log.calculated_co2} kg CO₂)`);
    return log;
  },

  /**
   * List carbon logs with pagination, filtering, and sorting.
   *
   * @param {string} userId
   * @param {Object} query - Validated query parameters
   * @returns {Promise<{ data: Array, meta: Object }>}
   */
  async list(userId, query = {}) {
    // Parse sort string: "log_date:desc" → { sortField, sortOrder }
    let sortField = 'log_date';
    let sortOrder = 'desc';
    if (query.sort) {
      const [field, order] = query.sort.split(':');
      sortField = field;
      sortOrder = order;
    }

    const { data, total } = await carbonLogModel.findAll(userId, {
      page: query.page,
      limit: query.limit,
      category: query.category,
      start_date: query.start_date,
      end_date: query.end_date,
      sortField,
      sortOrder,
    });

    const totalPages = Math.ceil(total / (query.limit || 20));

    return {
      data,
      meta: {
        page: query.page || 1,
        limit: query.limit || 20,
        total,
        totalPages,
      },
    };
  },

  /**
   * Get a single carbon log by ID with ownership verification.
   *
   * @param {string} logId  - UUID from req.params.id
   * @param {string} userId - UUID from req.user.user_id
   * @returns {Promise<Object>}
   */
  async getById(logId, userId) {
    const log = await carbonLogModel.findById(logId, userId);
    if (!log) {
      throw new AppError('Carbon log not found', 404);
    }
    return log;
  },

  /**
   * Update a carbon log entry with ownership verification.
   *
   * @param {string} logId
   * @param {string} userId
   * @param {Object} updates - Validated update fields
   * @returns {Promise<Object>} Updated log
   */
  async update(logId, userId, updates) {
    const log = await carbonLogModel.update(logId, userId, updates);
    if (!log) {
      throw new AppError('Carbon log not found', 404);
    }

    logger.info(`Carbon log updated: ${logId}`);
    return log;
  },

  /**
   * Delete a carbon log entry with ownership verification.
   *
   * @param {string} logId
   * @param {string} userId
   * @returns {Promise<void>}
   */
  async remove(logId, userId) {
    const deleted = await carbonLogModel.remove(logId, userId);
    if (!deleted) {
      throw new AppError('Carbon log not found', 404);
    }

    logger.info(`Carbon log deleted: ${logId}`);
  },
};

module.exports = emissionService;
