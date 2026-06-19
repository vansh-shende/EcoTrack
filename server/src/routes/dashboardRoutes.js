/**
 * ─────────────────────────────────────────────────────────────
 * Dashboard Analytics Routes
 * ─────────────────────────────────────────────────────────────
 * GET /dashboard/summary    → Period summary stats
 * GET /dashboard/trends     → Time-series data
 * GET /dashboard/breakdown  → Category breakdown
 *
 * All routes are protected (JWT required) and validate
 * query parameters via Joi schemas.
 * ─────────────────────────────────────────────────────────────
 */

const { Router } = require('express');
const dashboardController = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const {
  summaryQuerySchema,
  trendsQuerySchema,
  breakdownQuerySchema,
} = require('../validators/dashboardValidator');

const router = Router();

// All dashboard routes require authentication
router.use(protect);

router.get('/summary', validate(summaryQuerySchema, 'query'), dashboardController.getSummary);
router.get('/trends', validate(trendsQuerySchema, 'query'), dashboardController.getTrends);
router.get('/breakdown', validate(breakdownQuerySchema, 'query'), dashboardController.getBreakdown);

module.exports = router;
