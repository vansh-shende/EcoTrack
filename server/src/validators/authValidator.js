/**
 * Auth Validation Schemas (Joi)
 * Defines request body validation for all authentication endpoints.
 */

const Joi = require('joi');

// Password: min 8 chars, 1 uppercase, 1 number, 1 special character
const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(50).required()
    .messages({ 'string.min': 'Username must be at least 3 characters' }),
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().pattern(passwordPattern).required()
    .messages({ 'string.pattern.base': 'Password must contain at least 8 characters, 1 uppercase, 1 number, and 1 special character' }),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required()
    .messages({ 'any.only': 'Passwords do not match' }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().required(),
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

module.exports = { registerSchema, loginSchema, refreshTokenSchema };
