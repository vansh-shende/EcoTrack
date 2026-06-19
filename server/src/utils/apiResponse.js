/**
 * ─────────────────────────────────────────────────────────────
 * apiResponse — Standardized API Response Helpers
 * ─────────────────────────────────────────────────────────────
 * Ensures every API response follows the same JSON shape:
 *
 *   {
 *     "success": true | false,
 *     "message": "...",
 *     "data": { ... },            // only on success
 *     "meta": { page, limit, total }  // only for paginated lists
 *   }
 *
 * Usage:
 *   const { sendSuccess, sendCreated } = require('../utils/apiResponse');
 *   sendSuccess(res, 'Users retrieved', users);
 *   sendCreated(res, 'User registered', newUser);
 * ─────────────────────────────────────────────────────────────
 */

/**
 * 200 OK
 */
const sendSuccess = (res, message, data = null, meta = null) => {
  const response = { success: true, message };
  if (data !== null) response.data = data;
  if (meta !== null) response.meta = meta;
  return res.status(200).json(response);
};

/**
 * 201 Created
 */
const sendCreated = (res, message, data = null) => {
  const response = { success: true, message };
  if (data !== null) response.data = data;
  return res.status(201).json(response);
};

/**
 * 204 No Content (for DELETE operations)
 */
const sendNoContent = (res) => {
  return res.status(204).send();
};

module.exports = {
  sendSuccess,
  sendCreated,
  sendNoContent,
};
