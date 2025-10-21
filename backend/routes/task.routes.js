const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');
const { auth, isAdmin } = require('../middleware/auth.middleware');
const { upload, handleUploadError } = require('../config/s3.config');

// Create task (with multiple image upload)
router.post('/', auth, isAdmin, upload.array('images', 5), handleUploadError, taskController.createTask);
// Get all tasks (with filters)
router.get('/', auth, taskController.getTasks);
// Get single task
router.get('/:id', auth, taskController.getTask);
// Update task (with multiple image upload)
router.put('/:id', auth, isAdmin, upload.array('images', 5), handleUploadError, taskController.updateTask);
// Delete task
router.delete('/:id', auth, isAdmin, taskController.deleteTask);
// Assign task
router.post('/:id/assign', auth, isAdmin, taskController.assignTask);
// Update status
router.post('/:id/status', auth, isAdmin, taskController.updateStatus);
// Approve task
router.post('/:id/approve', auth, isAdmin, taskController.approveTask);
// Reject task
router.post('/:id/reject', auth, isAdmin, taskController.rejectTask);

module.exports = router;