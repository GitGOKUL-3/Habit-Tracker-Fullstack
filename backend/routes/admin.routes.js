const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const verifyToken = require('../middleware/auth.middleware');
const isAdmin = require('../middleware/admin.middleware');

// Protect all admin routes with verifyToken AND isAdmin
router.use(verifyToken, isAdmin);

router.get('/users', adminController.getAllUsers);
router.get('/users/:userId/activity', adminController.getUserActivity);

module.exports = router;
