const express = require('express');
const router = express.Router();
const journalController = require('../controllers/journalController');
const { authenticateToken } = require('../utils/auth');

// Journal routes
router.post('/entries', authenticateToken, journalController.createEntry);
router.get('/entries', authenticateToken, journalController.getEntries);
router.get('/entries/:id', authenticateToken, journalController.getEntry);
router.put('/entries/:id', authenticateToken, journalController.updateEntry);
router.delete('/entries/:id', authenticateToken, journalController.deleteEntry);

module.exports = router;
