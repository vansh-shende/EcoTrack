/**
 * Emission Validation Schemas (Joi)
 * Defines request body/query validation for carbon log endpoints.
 */

const Joi = require('joi');

const CATEGORIES = [
  'transportation', 'energy', 'food', 'shopping',
  'waste', 'water', 'digital', 'other',
];

const createEmissionSchema = Joi.object({
  category: Joi.string().valid(...CATEGORIES).required(),
  input_value: Joi.number().positive().precision(4).max(99999999.9999).required(),
  calculated_co2: Joi.number().min(0).precision(4).max(99999999.9999).required(),
  log_date: Joi.date().iso().max('now').default(new Date()),
});

const updateEmissionSchema = Joi.object({
  category: Joi.string().valid(...CATEGORIES),
  input_value: Joi.number().positive().precision(4).max(99999999.9999),
  calculated_co2: Joi.number().min(0).precision(4).max(99999999.9999),
  log_date: Joi.date().iso().max('now'),
}).min(1); // At least one field required for update

const listEmissionsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  category: Joi.string().valid(...CATEGORIES),
  start_date: Joi.date().iso(),
  end_date: Joi.date().iso().min(Joi.ref('start_date')),
  sort: Joi.string().pattern(/^(log_date|created_at|calculated_co2):(asc|desc)$/).default('log_date:desc'),
});

module.exports = { createEmissionSchema, updateEmissionSchema, listEmissionsQuerySchema, CATEGORIES };
