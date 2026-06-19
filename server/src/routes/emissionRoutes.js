/**
 * Carbon Emission Routes
 * POST   /emissions      → Create carbon log
 * GET    /emissions      → List logs (paginated + filterable)
 * GET    /emissions/:id  → Get single log
 * PUT    /emissions/:id  → Update log
 * DELETE /emissions/:id  → Delete log
 */

const { Router } = require('express');
const emissionController = require('../controllers/emissionController');
const validate = require('../middleware/validate');
const { createEmissionSchema, updateEmissionSchema, listEmissionsQuerySchema } = require('../validators/emissionValidator');
const { protect } = require('../middleware/authMiddleware');

const router = Router();

// All emission routes require authentication
router.use(protect);

router.post('/', validate(createEmissionSchema), emissionController.create);
router.get('/', validate(listEmissionsQuerySchema, 'query'), emissionController.list);
router.get('/:id', emissionController.getById);
router.put('/:id', validate(updateEmissionSchema), emissionController.update);
router.delete('/:id', emissionController.remove);

module.exports = router;
