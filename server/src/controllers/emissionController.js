/**
 * ─────────────────────────────────────────────────────────────
 * Emission Controller — CRUD Handlers for Carbon Log Entries
 * ─────────────────────────────────────────────────────────────
 * Thin controller layer — delegates all logic to emissionService.
 * Every action is scoped to req.user.user_id (ownership enforced).
 *
 * All routes are protected by JWT middleware.
 * ─────────────────────────────────────────────────────────────
 */

const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendCreated, sendNoContent } = require('../utils/apiResponse');
const emissionService = require('../services/emissionService');

/**
 * POST /api/v1/emissions
 * Create a new carbon log entry for the authenticated user.
 */
exports.create = asyncHandler(async (req, res) => {
  const log = await emissionService.create(req.user.user_id, req.body);

  sendCreated(res, 'Carbon log created', log);
});

/**
 * GET /api/v1/emissions
 * List carbon logs with pagination, filtering, and sorting.
 * Query params: page, limit, category, start_date, end_date, sort
 */
exports.list = asyncHandler(async (req, res) => {
  const { data, meta } = await emissionService.list(
    req.user.user_id,
    req.query
  );

  sendSuccess(res, 'Carbon logs retrieved', data, meta);
});

/**
 * GET /api/v1/emissions/:id
 * Get a single carbon log by ID (ownership verified).
 */
exports.getById = asyncHandler(async (req, res) => {
  const log = await emissionService.getById(
    req.params.id,
    req.user.user_id
  );

  sendSuccess(res, 'Carbon log retrieved', log);
});

/**
 * PUT /api/v1/emissions/:id
 * Update a carbon log entry (ownership verified).
 */
exports.update = asyncHandler(async (req, res) => {
  const log = await emissionService.update(
    req.params.id,
    req.user.user_id,
    req.body
  );

  sendSuccess(res, 'Carbon log updated', log);
});

/**
 * DELETE /api/v1/emissions/:id
 * Delete a carbon log entry (ownership verified).
 */
exports.remove = asyncHandler(async (req, res) => {
  await emissionService.remove(req.params.id, req.user.user_id);

  sendNoContent(res);
});
