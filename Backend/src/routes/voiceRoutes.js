const express = require('express');
const router = express.Router();
const voiceController = require('../controllers/voiceController');
const { authenticateToken } = require('../utils/auth');
const multer = require('multer');

// Multer configuration for audio file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('audio/')) {
            cb(null, true);
        } else {
            cb(new Error('Only audio files are allowed'), false);
        }
    }
});

// Voice model routes
router.post('/upload', authenticateToken, upload.single('audio'), voiceController.uploadVoice);
router.post('/generate', authenticateToken, voiceController.generateAudio);
router.get('/models', authenticateToken, voiceController.getVoiceModels);
router.get('/models/:id', authenticateToken, voiceController.getVoiceModel);
router.delete('/models/:id', authenticateToken, voiceController.deleteVoiceModel);

module.exports = router;
