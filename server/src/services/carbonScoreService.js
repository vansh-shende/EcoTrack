/**
 * ─────────────────────────────────────────────────────────────
 * Carbon Score Service — Scientific Sustainability Algorithms
 * ─────────────────────────────────────────────────────────────
 * Calculates a normalized carbon rating from 0 (High Impact) to
 * 100 (Climate Hero). Benchmarks are based on IPCC/Paris Agreement
 * targets to limit global warming to 1.5°C.
 */

// Category-specific weekly thresholds in kg CO2e
const BENCHMARKS = {
  transportation: {
    target: 15,   // Paris aligned target (equivalent to ~80km in a hybrid vehicle or public transit)
    max: 120,    // Average single-occupant commuter driving ~650km/week in a standard car
    weight: 0.40, // Transportation represents ~40% of standard household footprint
  },
  energy: {
    target: 20,   // Low-carbon grid electricity or solar offset (~45 kWh/week)
    max: 100,    // Grid-heavy power consumption, high HVAC use (~220 kWh/week)
    weight: 0.35, // Utilities represent ~35% of standard household footprint
  },
  food: {
    target: 10,   // Plant-based diet (~4 kg food consumed/week with low-carbon intensity)
    max: 60,     // Meat-dense daily diets (~2.5 kg factor per kg consumed)
    weight: 0.25, // Diet represents ~25% of standard household footprint
  }
};

const carbonScoreService = {
  /**
   * Computes a single category sub-score (0-100) using piecewise linear interpolation.
   *
   * @param {number} emissions - Weekly emissions in kg CO2e
   * @param {Object} config - { target, max } benchmarks
   * @returns {number} Sub-score between 0 and 100
   */
  calculateCategoryScore(emissions, { target, max }) {
    if (emissions <= 0) return 100;

    // Case 1: Excellent (emissions under target limit)
    // Scale score between 100 and 90
    if (emissions <= target) {
      return Math.round(100 - 10 * (emissions / target));
    }

    // Case 2: Average to Poor (emissions between target and max)
    // Scale score between 90 and 10
    if (emissions <= max) {
      const fraction = (emissions - target) / (max - target);
      return Math.round(90 - 80 * fraction);
    }

    // Case 3: High Impact (emissions exceed maximum average benchmark)
    // Scale score asymptotically down to 0
    const overflowFraction = (emissions - max) / max;
    const rawScore = 10 - 10 * overflowFraction;
    return Math.round(Math.max(0, rawScore));
  },

  /**
   * Translates a score from 0-100 to a user-friendly rating and category descriptor.
   *
   * @param {number} score - Total carbon score
   * @returns {Object} { rating, label, color }
   */
  getScoreCategory(score) {
    if (score >= 90) {
      return {
        rating: 'A',
        label: 'Climate Hero',
        description: 'Emissions are fully aligned with the Paris Agreement 1.5°C target.',
        color: '#4ADE80', // Green
      };
    }
    if (score >= 70) {
      return {
        rating: 'B',
        label: 'Eco Conscious',
        description: 'Emissions are below average, showing consistent green habits.',
        color: '#60A5FA', // Blue
      };
    }
    if (score >= 40) {
      return {
        rating: 'C',
        label: 'Transitioning',
        description: 'Emissions are typical. Opportunity exists to swap travel or diet habits.',
        color: '#FBBF24', // Yellow
      };
    }
    return {
      rating: 'D',
      label: 'High Impact',
      description: 'Emissions exceed carbon budget benchmarks. Action recommended.',
      color: '#F87171', // Red
    };
  },

  /**
   * Generates the complete Carbon Score report for a user based on weekly metrics.
   *
   * @param {Object} categoryEmissions - { transportation: X, energy: Y, food: Z } in kg
   * @returns {Object} Detailed score report
   */
  generateWeeklyScore(categoryEmissions = {}) {
    const breakdown = {};
    let weightedScoreSum = 0;
    let totalWeightUsed = 0;

    // Process each benchmarked category
    for (const [catName, config] of Object.entries(BENCHMARKS)) {
      const emissions = parseFloat(categoryEmissions[catName]) || 0;
      const subScore = this.calculateCategoryScore(emissions, config);

      breakdown[catName] = {
        emissions_kg: emissions,
        score: subScore,
        weight: config.weight,
        target_benchmark: config.target,
        max_benchmark: config.max,
      };

      weightedScoreSum += subScore * config.weight;
      totalWeightUsed += config.weight;
    }

    // Normalize final score (to support partial categories if needed)
    const finalScore = totalWeightUsed > 0 
      ? Math.round(weightedScoreSum / totalWeightUsed) 
      : 100;

    const classification = this.getScoreCategory(finalScore);

    return {
      score: finalScore,
      rating: classification.rating,
      label: classification.label,
      description: classification.description,
      color: classification.color,
      breakdown,
    };
  }
};

module.exports = carbonScoreService;
