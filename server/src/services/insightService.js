/**
 * ─────────────────────────────────────────────────────────────
 * AI Insight Service — Sustainability Decision Engine
 * ─────────────────────────────────────────────────────────────
 * Core business logic that analyzes carbon logs and generates
 * contextual, actionable, and mathematically grounded suggestions.
 */

const carbonLogModel = require('../models/carbonLogModel');
const aiInsightModel = require('../models/aiInsightModel');
const dashboardService = require('./dashboardService');
const carbonScoreService = require('./carbonScoreService');
const { recommendationEngine } = require('./recommendationEngine');

const insightService = {
  /**
   * Generates custom insights for a user based on their past week's carbon logs.
   * Clears old recommendations first to prevent duplicate feed clutter.
   *
   * @param {string} userId - User UUID
   * @returns {Promise<Array>} Newly generated insights
   */
  async generate(userId) {
    // 1. Clear old recommendations
    await aiInsightModel.clearAll(userId);

    // 2. Fetch past-week summary statistics and category breakdowns
    const [summary, breakdown] = await Promise.all([
      dashboardService.getSummary(userId, 'week'),
      dashboardService.getBreakdown(userId, 'week'),
    ]);

    const { total_co2_kg = 0, log_count = 0, comparison } = summary;
    const { change_percent = 0, trend = 'stable' } = comparison || {};
    const categories = breakdown?.categories || [];

    const generatedInsights = [];

    // Helper function to save and push insights
    const addInsight = async (message) => {
      const insight = await aiInsightModel.create({ user_id: userId, message });
      generatedInsights.push(insight);
    };

    // ── RULE 1: POSITIVE REINFORCEMENT & GENERAL TRENDS ───────
    if (log_count > 0) {
      if (trend === 'decreasing' && change_percent < -2) {
        await addInsight(
          `🌿 Sustainability Milestone: Your total emissions decreased by ${Math.abs(change_percent)}% this week compared to last week! Excellent work reducing your footprint.`
        );
      } else if (trend === 'increasing' && change_percent > 2) {
        await addInsight(
          `⚠️ Eco Alert: Your weekly carbon footprint increased by ${change_percent}% compared to last week. Review your high-impact categories to identify saving opportunities.`
        );
      }
    }

    // ── RULE 2: TRANSPORTATION ANALYSIS ───────────────────────
    const transport = categories.find((c) => c.category === 'transportation');
    if (transport) {
      if (transport.percentage > 40) {
        await addInsight(
          `🚗 Commute Optimization: Transportation accounts for ${transport.percentage}% of your weekly carbon footprint. Opting for public transit, cycling, or bundling car trips could reduce this category's emissions significantly (saving ~2.4 kg CO₂e per 10 km).`
        );
      } else if (transport.total_co2_kg > 50) {
        await addInsight(
          `🚲 Active Commuting Opportunity: You accumulated ${transport.total_co2_kg.toFixed(1)} kg CO₂e from travel this week. Swapping even one car trip for walking or biking contributes directly to cleaner air and a lower personal footprint.`
        );
      }
    } else if (log_count > 0) {
      // User has logged, but no travel log. Remind them to track commute.
      await addInsight(
        `🗺️ Travel Tracking: No transportation activities were logged this week. Make sure to log commutes or driving distances to get a complete picture of your travel footprint.`
      );
    }

    // ── RULE 3: ENERGY CONSUMPTION ANALYSIS ───────────────────
    const energy = categories.find((c) => c.category === 'energy');
    if (energy) {
      if (energy.total_co2_kg > 40) {
        await addInsight(
          `⚡ Smart Power Savings: Energy usage accounts for ${energy.percentage}% (${energy.total_co2_kg.toFixed(1)} kg CO₂e) of your weekly total. Adjusting thermostats by 1°C and unplugging standby appliances ('vampire loads') can reduce your electricity usage by up to 10%.`
        );
      }
    }

    // ── RULE 4: DIETARY & FOOD HABITS ANALYSIS ────────────────
    const food = categories.find((c) => c.category === 'food');
    if (food) {
      if (food.percentage > 35) {
        await addInsight(
          `🥗 Green Plate Shift: Dietary choices comprise ${food.percentage}% of your carbon footprint this week. Integrating vegetarian days (such as Meatless Mondays) can lower your food emissions by up to 25% (cutting ~2.5 kg CO₂e per meal).`
        );
      }
    }

    // ── RULE 5: WASTE REDUCTION ANALYSIS ──────────────────────
    const waste = categories.find((c) => c.category === 'waste');
    if (waste && waste.total_co2_kg > 15) {
      await addInsight(
        `♻️ Circular Economy Tip: Waste logs represent ${waste.total_co2_kg.toFixed(1)} kg CO₂e this week. Separating compostable organic waste from landfills reduces household waste methane emissions by up to 50%.`
      );
    }

    // ── RULE 6: LOGGING CONSISTENCY AND HABIT BUILDERS ────────
    if (log_count >= 8) {
      await addInsight(
        `⭐ Consistency Champion: You logged ${log_count} carbon activities this week! Establishing a regular tracking routine is the most critical step toward personal sustainability.`
      );
    } else if (log_count > 0 && log_count < 4) {
      await addInsight(
        `📊 Habit Builder: You logged ${log_count} activities this week. Try logging at least one carbon activity daily (e.g. food or transit) to build a high-fidelity view of your habits.`
      );
    }

    // Fallback: If no logs yet, encourage initial logs
    if (log_count === 0) {
      await addInsight(
        `🌱 Welcome to EcoTrack: Ready to start your climate journey? Click 'Log Activity' at the top right to record your first commute, meal, or utility log and see real-time carbon analytics.`
      );
    }

    return generatedInsights;
  },

  /**
   * Paginated list of user's AI insights.
   *
   * @param {string} userId
   * @param {Object} query
   * @returns {Promise<Object>} Data and metadata
   */
  async list(userId, query) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    let is_read = undefined;
    if (query.is_read === 'true') is_read = true;
    if (query.is_read === 'false') is_read = false;

    const { rows, total } = await aiInsightModel.list(userId, { limit, offset, is_read });
    const unreadCount = await aiInsightModel.countUnread(userId);

    return {
      data: rows,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        unread_count: unreadCount,
      },
    };
  },

  /**
   * Get single insight by ID, ensuring user ownership.
   */
  async getById(id, userId) {
    const insight = await aiInsightModel.getById(id, userId);
    if (!insight) {
      const error = new Error('Insight not found');
      error.status = 404;
      throw error;
    }
    return insight;
  },

  /**
   * Mark an insight as read.
   */
  async markAsRead(id, userId) {
    const insight = await aiInsightModel.markAsRead(id, userId);
    if (!insight) {
      const error = new Error('Insight not found');
      error.status = 404;
      throw error;
    }
    return insight;
  },

  /**
   * Delete a single insight.
   */
  async remove(id, userId) {
    const deleted = await aiInsightModel.remove(id, userId);
    if (!deleted) {
      const error = new Error('Insight not found');
      error.status = 404;
      throw error;
    }
    return true;
  },

  /**
   * Generates a dynamic report including:
   * 1. Total weekly emissions + category breakdown
   * 2. Calculated Carbon Score (0-100)
   * 3. Rules-engine recommendations
   *
   * @param {string} userId - User UUID
   * @returns {Promise<Object>} Dynamic report containing score, recommendations, and analysis
   */
  async getDynamicReport(userId) {
    const [summary, breakdown] = await Promise.all([
      dashboardService.getSummary(userId, 'week'),
      dashboardService.getBreakdown(userId, 'week'),
    ]);

    const categories = breakdown?.categories || [];
    const total_co2_kg = summary?.total_co2_kg || 0;

    const emissionsDict = {
      transportation: categories.find(c => c.category === 'transportation')?.total_co2_kg || 0,
      energy: categories.find(c => c.category === 'energy')?.total_co2_kg || 0,
      food: categories.find(c => c.category === 'food')?.total_co2_kg || 0,
    };

    const carbonScore = carbonScoreService.generateWeeklyScore(emissionsDict);

    const evaluation = recommendationEngine.evaluate({
      total_co2_kg,
      categories,
    });

    return {
      score: carbonScore,
      recommendations: evaluation.recommendations,
      analysis: evaluation.analysis,
      weeklySummary: {
        total_co2_kg,
        log_count: summary.log_count,
        daily_average_kg: summary.daily_average_kg,
      }
    };
  }
};

module.exports = insightService;
