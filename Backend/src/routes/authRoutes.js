const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../utils/auth');

// Auth routes
router.post('/token', authController.validateToken);
router.get('/profile', authenticateToken, authController.getProfile);

module.exports = router;
