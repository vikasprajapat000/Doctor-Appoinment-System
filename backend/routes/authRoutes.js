const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// Public Authentication Routes (All roles: Patient, Doctor, Admin, SuperAdmin / Owner)
router.post('/register', authController.register);
router.post('/login', authController.login);

// Legacy aliases for backward compatibility
router.post('/setup-owner', authController.register);
router.post('/superadmin-login', authController.login);
router.get('/check-setup-allowed', authController.checkSetupAllowed);

// Protected Logout Route
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;