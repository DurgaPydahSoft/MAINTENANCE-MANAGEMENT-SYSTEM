const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { auth, isAdmin } = require('../middleware/auth.middleware');

// Create admin credential
router.post('/', auth, isAdmin, adminController.createAdmin);
// Get all admin credentials
router.get('/', auth, isAdmin, adminController.getAdmins);
// Get single admin credential
router.get('/:id', auth, isAdmin, adminController.getAdmin);
// Update admin credential
router.put('/:id', auth, isAdmin, adminController.updateAdmin);
// Delete admin credential
router.delete('/:id', auth, isAdmin, adminController.deleteAdmin);

module.exports = router;
