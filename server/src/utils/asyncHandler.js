/**
 * ─────────────────────────────────────────────────────────────
 * asyncHandler — Async Route Wrapper
 * ─────────────────────────────────────────────────────────────
 * Wraps async route handlers so rejected promises are
 * automatically forwarded to the global error handler.
 *
 * Without this, every async handler would need its own
 * try/catch block.
 *
 * Usage:
 *   router.get('/users', asyncHandler(async (req, res) => {
 *     const users = await userService.findAll();
 *     res.json(users);
 *   }));
 * ─────────────────────────────────────────────────────────────
 */

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
