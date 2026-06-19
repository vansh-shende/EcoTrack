/**
 * ─────────────────────────────────────────────────────────────
 * Dashboard Validation Schemas (Joi)
 * ─────────────────────────────────────────────────────────────
 * Validates query parameters for dashboard analytics endpoints.
 * Applied via the validate middleware in dashboard routes.
 * ─────────────────────────────────────────────────────────────
 */

const Joi = require('joi');

const PERIODS = ['day', 'week', 'month', 'year'];
const GROUP_BY = ['day', 'week', 'month'];

/**
 * GET /dashboard/summary?period=month
 */
const summaryQuerySchema = Joi.object({
  period: Joi.string().valid(...PERIODS).default('month'),
});

/**
 * GET /dashboard/trends?period=month&group_by=day
 */
const trendsQuerySchema = Joi.object({
  period: Joi.string().valid(...PERIODS).default('month'),
  group_by: Joi.string().valid(...GROUP_BY).default('day'),
});

/**
 * GET /dashboard/breakdown?period=month
 */
const breakdownQuerySchema = Joi.object({
  period: Joi.string().valid(...PERIODS).default('month'),
});

module.exports = { summaryQuerySchema, trendsQuerySchema, breakdownQuerySchema };
