/**
 * Insight Validation Schemas (Joi)
 */

const Joi = require('joi');

const listInsightsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  is_read: Joi.boolean(),
});

module.exports = { listInsightsQuerySchema };
