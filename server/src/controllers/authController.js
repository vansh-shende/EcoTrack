/**
 * ─────────────────────────────────────────────────────────────
 * Auth Controller — Request Handlers for Authentication
 * ─────────────────────────────────────────────────────────────
 * Thin controller layer — delegates ALL business logic to
 * authService. Each handler is responsible only for:
 *   1. Extracting data from the request
 *   2. Calling the appropriate service method
 *   3. Sending the standardized response
 *
 * Error handling is automatic via asyncHandler + globalErrorHandler.
 * ─────────────────────────────────────────────────────────────
 */

const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendCreated } = require('../utils/apiResponse');
const authService = require('../services/authService');

/**
 * POST /api/v1/auth/register
 * Create a new user account and return JWT tokens.
 */
exports.register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  const { user, accessToken, refreshToken } = await authService.register({
    username,
    email,
    password,
  });

  sendCreated(res, 'User registered successfully', {
    user,
    accessToken,
    refreshToken,
  });
});

/**
 * POST /api/v1/auth/login
 * Authenticate with email + password, receive JWT tokens.
 */
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { user, accessToken, refreshToken } = await authService.login({
    email,
    password,
  });

  sendSuccess(res, 'Login successful', {
    user,
    accessToken,
    refreshToken,
  });
});

/**
 * GET /api/v1/auth/me
 * Return the currently authenticated user's profile.
 * Requires: protect middleware (req.user is guaranteed).
 */
exports.getMe = asyncHandler(async (req, res) => {
  // req.user is set by the protect middleware, but we fetch
  // fresh data in case the profile was updated since token issuance
  const user = await authService.getMe(req.user.user_id);

  sendSuccess(res, 'User profile retrieved', { user });
});

/**
 * POST /api/v1/auth/refresh-token
 * Exchange a valid refresh token for a new token pair.
 */
exports.refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  const tokens = await authService.refreshToken(refreshToken);

  sendSuccess(res, 'Token refreshed successfully', tokens);
});

/**
 * POST /api/v1/auth/logout
 * Invalidate the current session.
 * Currently client-side only (discard tokens).
 * Future: invalidate refresh token in DB.
 */
exports.logout = asyncHandler(async (req, res) => {
  // Future: await authService.logout(req.user.user_id, req.body.refreshToken);
  // For now, logout is handled client-side by discarding tokens.
  // The short-lived access token will expire naturally (15m).

  sendSuccess(res, 'Logged out successfully');
});
