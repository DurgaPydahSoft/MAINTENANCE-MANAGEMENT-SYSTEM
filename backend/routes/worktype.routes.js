const express = require('express');
const router = express.Router();
const workTypeController = require('../controllers/worktype.controller');
const { auth, isAdmin } = require('../middleware/auth.middleware');

// Create work type
router.post('/', auth, isAdmin, workTypeController.createWorkType);
// Get all work types
router.get('/', auth, workTypeController.getWorkTypes);
// Get single work type
router.get('/:id', auth, workTypeController.getWorkType);
// Update work type
router.put('/:id', auth, isAdmin, workTypeController.updateWorkType);
// Delete work type
router.delete('/:id', auth, isAdmin, workTypeController.deleteWorkType);

module.exports = router;