/**
 * ─────────────────────────────────────────────────────────────
 * Dashboard Service — Analytics Business Logic
 * ─────────────────────────────────────────────────────────────
 * Transforms raw database aggregations into structured
 * dashboard responses with computed metrics:
 *   • Period totals + daily average
 *   • Period-over-period comparison (change % and trend)
 *   • Time-series data for charting
 *   • Category breakdown with percentages
 *
 * All methods are scoped to a single user (user_id).
 * ─────────────────────────────────────────────────────────────
 */

const carbonLogModel = require('../models/carbonLogModel');

const dashboardService = {
  /**
   * ─────────────────────────────────────────────────────────
   * getSummary() — Dashboard summary card data
   * ─────────────────────────────────────────────────────────
   * Returns:
   *   • Total CO₂ for the current period
   *   • Number of logs
   *   • Daily average
   *   • Top emission category
   *   • Comparison vs previous period (% change + trend direction)
   *
   * @param {string} userId
   * @param {string} period - 'day' | 'week' | 'month' | 'year'
   * @returns {Promise<Object>}
   */
  async getSummary(userId, period = 'month') {
    // Run both queries in parallel — they're independent
    const [periodData, topCategory] = await Promise.all([
      carbonLogModel.getPeriodSummary(userId, period),
      carbonLogModel.getTopCategory(userId, period),
    ]);

    const currentCo2 = parseFloat(periodData.current_co2_kg) || 0;
    const previousCo2 = parseFloat(periodData.previous_co2_kg) || 0;
    const currentCount = parseInt(periodData.current_count, 10) || 0;

    // Calculate period-over-period change
    let changePercent = 0;
    let trend = 'stable';

    if (previousCo2 > 0) {
      changePercent = parseFloat(
        (((currentCo2 - previousCo2) / previousCo2) * 100).toFixed(1)
      );

      if (changePercent > 2) trend = 'increasing';
      else if (changePercent < -2) trend = 'decreasing';
      else trend = 'stable';
    } else if (currentCo2 > 0) {
      // No previous data to compare — first period of activity
      trend = 'new';
      changePercent = 100;
    }

    // Calculate daily average based on period length
    const periodDays = { day: 1, week: 7, month: 30, year: 365 };
    const days = periodDays[period] || 30;
    const dailyAverage = parseFloat((currentCo2 / days).toFixed(2));

    return {
      total_co2_kg: parseFloat(currentCo2.toFixed(2)),
      log_count: currentCount,
      daily_average_kg: dailyAverage,
      top_category: topCategory
        ? {
            category: topCategory.category,
            total_co2_kg: parseFloat(parseFloat(topCategory.total_co2_kg).toFixed(2)),
          }
        : null,
      comparison: {
        previous_period_co2_kg: parseFloat(previousCo2.toFixed(2)),
        change_percent: changePercent,
        trend,
      },
    };
  },

  /**
   * ─────────────────────────────────────────────────────────
   * getTrends() — Time-series data for charts
   * ─────────────────────────────────────────────────────────
   * Returns an array of time-bucketed data points suitable
   * for line/bar charts on the frontend.
   *
   * @param {string} userId
   * @param {Object} options
   * @param {string} options.period   - Date range
   * @param {string} options.group_by - Bucket size
   * @returns {Promise<Object>}
   */
  async getTrends(userId, { period = 'month', group_by = 'day' } = {}) {
    const series = await carbonLogModel.getTrends(userId, period, group_by);

    // Convert numeric strings to proper numbers
    const formattedSeries = series.map((point) => ({
      date: point.bucket,
      total_co2_kg: parseFloat(parseFloat(point.total_co2_kg).toFixed(2)),
      log_count: parseInt(point.log_count, 10),
      avg_per_log_kg: parseFloat(point.avg_per_log_kg),
    }));

    return {
      period,
      group_by,
      data_points: formattedSeries.length,
      series: formattedSeries,
    };
  },

  /**
   * ─────────────────────────────────────────────────────────
   * getBreakdown() — Category-wise emission breakdown
   * ─────────────────────────────────────────────────────────
   * Returns each category's total CO₂, log count, and
   * percentage share — ideal for pie/donut charts.
   *
   * @param {string} userId
   * @param {string} period
   * @returns {Promise<Object>}
   */
  async getBreakdown(userId, period = 'month') {
    const categories = await carbonLogModel.getCategoryBreakdown(userId, period);

    const formattedCategories = categories.map((cat) => ({
      category: cat.category,
      total_co2_kg: parseFloat(cat.total_co2_kg),
      log_count: parseInt(cat.log_count, 10),
      percentage: parseFloat(cat.percentage),
    }));

    const totalCo2 = formattedCategories.reduce(
      (sum, cat) => sum + cat.total_co2_kg,
      0
    );

    return {
      period,
      total_co2_kg: parseFloat(totalCo2.toFixed(2)),
      category_count: formattedCategories.length,
      categories: formattedCategories,
    };
  },
};

module.exports = dashboardService;
