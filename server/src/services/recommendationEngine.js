/**
 * ─────────────────────────────────────────────────────────────
 * AI Recommendation Engine — Extensible Rule-Based Architecture
 * ─────────────────────────────────────────────────────────────
 * Designed with a plugin-based architecture, allowing new rules,
 * machine learning models, or external API heuristics to be
 * integrated seamlessly without modifying the core orchestrator.
 */

// ═══════════════════════════════════════════════════════════════
// 1. BASE RULE INTERFACE
// ═══════════════════════════════════════════════════════════════
class BaseRule {
  constructor(id, category) {
    this.id = id;
    this.category = category;
  }

  /**
   * Evaluates if this recommendation rule is triggered by user data.
   * @param {Object} context - User metrics summary and category logs
   * @returns {boolean}
   */
  check(context) {
    throw new Error('Method "check()" must be implemented.');
  }

  /**
   * Generates a personalized recommendation.
   * @param {Object} context - User metrics summary and category logs
   * @returns {Object} { message, estimatedReductionPercent, impactScore }
   */
  execute(context) {
    throw new Error('Method "execute()" must be implemented.');
  }
}

// ═══════════════════════════════════════════════════════════════
// 2. CONCRETE RULES IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════

/**
 * Commute Swapping Rule
 * Target: Low-carbon transit substitutes
 */
class TransportationCommuteRule extends BaseRule {
  constructor() {
    super('RULE_TRANS_COMMUTE', 'transportation');
  }

  check(context) {
    const transport = context.categories.find(c => c.category === 'transportation');
    // Trigger if transportation exceeds 35% of total or total travel > 45 kg CO2e
    return transport && (transport.percentage > 35 || transport.total_co2_kg > 45);
  }

  execute(context) {
    const transport = context.categories.find(c => c.category === 'transportation');
    const distanceEst = (transport.total_co2_kg / 0.18).toFixed(0); // 0.18 kg CO2/km

    return {
      ruleId: this.id,
      category: this.category,
      message: `🚗 Commute Optimization: Transportation accounts for ${transport.percentage}% of your emissions. Swapping just 20% of your estimated ${distanceEst} km driven this week to public transit or cycling yields direct savings.`,
      estimatedReductionPercent: 15, // Potentially cuts 15% of transport emissions
      impactScore: 'High',
    };
  }
}

/**
 * Thermostat Tuning Rule
 * Target: Utility energy savings
 */
class EnergyThermostatRule extends BaseRule {
  constructor() {
    super('RULE_ENERGY_THERMOSTAT', 'energy');
  }

  check(context) {
    const energy = context.categories.find(c => c.category === 'energy');
    return energy && energy.total_co2_kg > 30; // Triggers if weekly energy emissions > 30 kg CO2e
  }

  execute(context) {
    const energy = context.categories.find(c => c.category === 'energy');
    return {
      ruleId: this.id,
      category: this.category,
      message: `⚡ Smart Thermostat Shift: Your electricity log indicates ${energy.total_co2_kg.toFixed(1)} kg CO₂e. Adjusting your temperature settings by 1°C closer to outdoor ambient temps reduces heating/cooling loads.`,
      estimatedReductionPercent: 8, // Potentially cuts 8% of energy emissions
      impactScore: 'Medium',
    };
  }
}

/**
 * Plant-Based Diet Substitutes
 * Target: High-impact food logs
 */
class DietPlantBasedRule extends BaseRule {
  constructor() {
    super('RULE_DIET_PLANT_BASED', 'food');
  }

  check(context) {
    const food = context.categories.find(c => c.category === 'food');
    return food && food.percentage > 30; // Triggers if food footprint represents > 30% of total
  }

  execute(context) {
    const food = context.categories.find(c => c.category === 'food');
    return {
      ruleId: this.id,
      category: this.category,
      message: `🥗 Meatless Monday Strategy: Food habits represent ${food.percentage}% of your weekly carbon output. Replacing high-emission animal proteins with grains, pulses, and greens twice a week can substantially lower food footprint.`,
      estimatedReductionPercent: 20, // Potentially cuts 20% of diet emissions
      impactScore: 'High',
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// 3. ENGINE ORCHESTRATOR
// ═══════════════════════════════════════════════════════════════
class RecommendationEngine {
  constructor() {
    this.rules = [];
  }

  /**
   * Registers a new rule to the engine.
   * Allows plugins and new rules to be registered dynamically.
   * @param {BaseRule} rule
   */
  registerRule(rule) {
    if (!(rule instanceof BaseRule)) {
      throw new Error('Only instances of BaseRule can be registered.');
    }
    this.rules.push(rule);
  }

  /**
   * Evaluates user context against all registered rules.
   * Identifies highest category emissions, computes potential reductions,
   * and returns structured recommendations.
   *
   * @param {Object} context
   * @param {number} context.total_co2_kg - User's weekly total CO2
   * @param {Array<Object>} context.categories - [{ category, total_co2_kg, percentage }]
   * @returns {Object} { recommendations: Array, summary: Object }
   */
  evaluate(context) {
    const recommendations = [];

    // 1. Evaluate registered rules
    for (const rule of this.rules) {
      try {
        if (rule.check(context)) {
          const recommendation = rule.execute(context);
          recommendations.push(recommendation);
        }
      } catch (err) {
        console.error(`Error executing rule ${rule.id}:`, err);
        // Continue processing other rules to avoid single-point failure
      }
    }

    // 2. Detect highest category
    let highestCategory = null;
    if (context.categories && context.categories.length > 0) {
      // Sort categories descending by CO2
      const sorted = [...context.categories].sort((a, b) => b.total_co2_kg - a.total_co2_kg);
      highestCategory = sorted[0];
    }

    // 3. Estimate potential reduction
    // Total reduction (kg) = Sum of (category_co2 * rule_reduction_percent)
    let totalPotentialSavingsKg = 0;
    recommendations.forEach(rec => {
      const catData = context.categories.find(c => c.category === rec.category);
      if (catData) {
        totalPotentialSavingsKg += catData.total_co2_kg * (rec.estimatedReductionPercent / 100);
      }
    });

    const potentialSavingsPercent = context.total_co2_kg > 0
      ? parseFloat(((totalPotentialSavingsKg / context.total_co2_kg) * 100).toFixed(1))
      : 0;

    return {
      recommendations,
      analysis: {
        highestCategory: highestCategory ? highestCategory.category : null,
        highestCategoryCo2Kg: highestCategory ? highestCategory.total_co2_kg : 0,
        potentialWeeklySavingsKg: parseFloat(totalPotentialSavingsKg.toFixed(2)),
        potentialSavingsPercent,
      }
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// 4. INSTANTIATION & REGISTRATION
// ═══════════════════════════════════════════════════════════════
const engineInstance = new RecommendationEngine();

// Register concrete rules
engineInstance.registerRule(new TransportationCommuteRule());
engineInstance.registerRule(new EnergyThermostatRule());
engineInstance.registerRule(new DietPlantBasedRule());

module.exports = {
  BaseRule,
  RecommendationEngine,
  recommendationEngine: engineInstance, // Singleton instance for app reuse
};
