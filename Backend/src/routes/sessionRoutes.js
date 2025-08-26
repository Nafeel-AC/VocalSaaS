const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const { authenticateToken } = require('../utils/auth');

// Session routes
router.post('/', authenticateToken, sessionController.createSession);
router.get('/', authenticateToken, sessionController.getSessions);
router.get('/:id', authenticateToken, sessionController.getSession);
router.put('/:id', authenticateToken, sessionController.updateSession);
router.delete('/:id', authenticateToken, sessionController.deleteSession);

module.exports = router;
