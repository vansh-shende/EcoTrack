/**
 * ─────────────────────────────────────────────────────────────
 * Validation Middleware
 * ─────────────────────────────────────────────────────────────
 * Factory function that takes a Joi schema and returns an
 * Express middleware that validates req.body / req.params /
 * req.query against it.
 *
 * Usage in routes:
 *   const { registerSchema } = require('../validators/authValidator');
 *   router.post('/register', validate(registerSchema), authController.register);
 * ─────────────────────────────────────────────────────────────
 */

const AppError = require('../utils/AppError');

/**
 * @param {import('joi').ObjectSchema} schema - Joi validation schema
 * @param {'body'|'params'|'query'} source - Which part of the request to validate
 * @returns {import('express').RequestHandler}
 */
const validate = (schema, source = 'body') => {
  return (req, _res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,     // Return ALL errors, not just the first
      stripUnknown: true,    // Remove fields not in the schema
      allowUnknown: false,
    });

    if (error) {
      const messages = error.details.map((detail) => detail.message).join('; ');
      return next(new AppError(`Validation error: ${messages}`, 400));
    }

    // Replace raw input with the sanitized/validated value
    req[source] = value;
    return next();
  };
};

module.exports = validate;
