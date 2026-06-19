/**
 * ─────────────────────────────────────────────────────────────
 * HTTP Status Code Constants
 * ─────────────────────────────────────────────────────────────
 * Named constants for commonly used HTTP status codes.
 * Avoids magic numbers scattered across controllers/services.
 *
 * Usage:
 *   const { OK, CREATED, NOT_FOUND } = require('../constants/httpStatus');
 *   res.status(CREATED).json({ ... });
 * ─────────────────────────────────────────────────────────────
 */

module.exports = {
  // ── Success (2xx) ───────────────────────────────────────
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,

  // ── Client Errors (4xx) ─────────────────────────────────
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,

  // ── Server Errors (5xx) ─────────────────────────────────
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
};
