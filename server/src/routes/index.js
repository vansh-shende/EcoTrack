/**
 * ─────────────────────────────────────────────────────────────
 * API Router — Versioned Route Aggregator
 * ─────────────────────────────────────────────────────────────
 * Mounts all feature routers under a single Express Router.
 * This router is mounted at the versioned prefix (e.g., /api/v1)
 * in app.js.
 *
 * API Versioning Strategy:
 * ─────────────────────────
 * We use URI-based versioning (/api/v1, /api/v2) because it's:
 *   • Explicit — version is visible in every URL
 *   • Cache-friendly — different versions are distinct URIs
 *   • Simple — no custom headers or content negotiation
 *
 * When v2 is needed:
 *   1. Create a new routes/v2/ directory
 *   2. Mount it in app.js as: app.use('/api/v2', v2Router)
 *   3. Keep v1 running alongside for backward compatibility
 *   4. Deprecate v1 with a Sunset header after migration period
 *
 * Current routes:
 *   GET  /api/v1/              → API welcome / version info
 *   *    /api/v1/auth/...      → Authentication endpoints
 *   *    /api/v1/users/...     → User management endpoints
 *   *    /api/v1/emissions/... → Carbon log endpoints
 *   *    /api/v1/insights/...  → AI insights endpoints
 * ─────────────────────────────────────────────────────────────
 */

const { Router } = require('express');
const { sendSuccess } = require('../utils/apiResponse');

const router = Router();

// ── API Root ────────────────────────────────────────────────
// Version info endpoint — useful for monitoring & client checks

router.get('/', (_req, res) => {
  sendSuccess(res, 'EcoTrack API is running', {
    version: 'v1',
    docs: '/api/v1/docs',
    health: '/health',
    endpoints: {
      auth: '/api/v1/auth',
      emissions: '/api/v1/emissions',
      dashboard: '/api/v1/dashboard',
      insights: '/api/v1/insights',
    },
  });
});

// ── Feature Routers ─────────────────────────────────────────

const authRoutes = require('./authRoutes');
const emissionRoutes = require('./emissionRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const insightRoutes = require('./insightRoutes');

router.use('/auth', authRoutes);
router.use('/emissions', emissionRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/insights', insightRoutes);

module.exports = router;
