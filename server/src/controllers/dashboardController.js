/**
 * ─────────────────────────────────────────────────────────────
 * Dashboard Controller — Analytics Endpoint Handlers
 * ─────────────────────────────────────────────────────────────
 * Thin controller layer for dashboard analytics:
 *   • GET /dashboard/summary    → Period summary with comparison
 *   • GET /dashboard/trends     → Time-series for charts
 *   • GET /dashboard/breakdown  → Category pie chart data
 *
 * All endpoints are protected (require JWT via protect middleware).
 * User ID comes from req.user.user_id (set by authMiddleware).
 * ─────────────────────────────────────────────────────────────
 */

const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const dashboardService = require('../services/dashboardService');

/**
 * GET /api/v1/dashboard/summary?period=month
 * Returns total CO₂, log count, daily average, top category,
 * and period-over-period comparison.
 */
exports.getSummary = asyncHandler(async (req, res) => {
  const summary = await dashboardService.getSummary(
    req.user.user_id,
    req.query.period
  );

  sendSuccess(res, 'Dashboard summary retrieved', summary);
});

/**
 * GET /api/v1/dashboard/trends?period=month&group_by=day
 * Returns time-series data points for line/bar charts.
 */
exports.getTrends = asyncHandler(async (req, res) => {
  const trends = await dashboardService.getTrends(
    req.user.user_id,
    req.query
  );

  sendSuccess(res, 'Trend data retrieved', trends);
});

/**
 * GET /api/v1/dashboard/breakdown?period=month
 * Returns category-wise CO₂ breakdown with percentages.
 */
exports.getBreakdown = asyncHandler(async (req, res) => {
  const breakdown = await dashboardService.getBreakdown(
    req.user.user_id,
    req.query.period
  );

  sendSuccess(res, 'Category breakdown retrieved', breakdown);
});
