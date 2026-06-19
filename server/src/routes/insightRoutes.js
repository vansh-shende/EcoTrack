/**
 * AI Insights Routes
 * POST   /insights/generate   → Generate AI insights
 * GET    /insights             → List insights (paginated)
 * GET    /insights/:id         → Get single insight
 * PATCH  /insights/:id/read   → Mark as read
 * DELETE /insights/:id         → Delete insight
 */

const { Router } = require('express');
const insightController = require('../controllers/insightController');
const validate = require('../middleware/validate');
const { listInsightsQuerySchema } = require('../validators/insightValidator');
const { protect } = require('../middleware/authMiddleware');

const router = Router();

router.use(protect);

router.post('/generate', insightController.generate);
router.get('/', insightController.list);
router.get('/:id', insightController.getById);
router.patch('/:id/read', insightController.markAsRead);
router.delete('/:id', insightController.remove);

module.exports = router;
