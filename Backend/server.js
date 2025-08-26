const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// ElevenLabs API configuration
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'VocalSaaS Backend is running' });
});

// Voice Recording & Model Creation
app.post('/api/voice/upload', authenticateToken, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const { userId } = req.user;
    const audioBuffer = req.file.buffer;
    const fileName = `${userId}_${Date.now()}.wav`;

    // Upload to ElevenLabs for voice cloning
    const formData = new FormData();
    formData.append('files', new Blob([audioBuffer]), fileName);
    formData.append('name', `voice_${userId}`);
    formData.append('description', `Voice model for user ${userId}`);

    const response = await axios.post(
      `${ELEVENLABS_BASE_URL}/voices/add`,
      formData,
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    if (response.data && response.data.voice_id) {
      // Store voice model info in your database
      const voiceModel = {
        userId,
        voiceId: response.data.voice_id,
        fileName,
        createdAt: new Date(),
        status: 'active'
      };

      // Here you would save to your database
      // For now, we'll return the voice model info
      res.json({
        success: true,
        voiceModel,
        message: 'Voice model created successfully'
      });
    } else {
      throw new Error('Failed to create voice model');
    }
  } catch (error) {
    console.error('Voice upload error:', error);
    res.status(500).json({ 
      error: 'Failed to process voice upload',
      details: error.message 
    });
  }
});

// Generate personalized audio session
app.post('/api/voice/generate', authenticateToken, async (req, res) => {
  try {
    const { script, voiceId, sessionType } = req.body;
    const { userId } = req.user;

    if (!script || !voiceId) {
      return res.status(400).json({ error: 'Script and voice ID are required' });
    }

    // Generate audio using ElevenLabs TTS
    const ttsResponse = await axios.post(
      `${ELEVENLABS_BASE_URL}/text-to-speech/${voiceId}`,
      {
        text: script,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      },
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer'
      }
    );

    // Convert audio buffer to base64 for transmission
    const audioBase64 = Buffer.from(ttsResponse.data).toString('base64');

    // Here you would save the session info to your database
    const session = {
      userId,
      voiceId,
      script,
      sessionType,
      audioData: audioBase64,
      createdAt: new Date()
    };

    res.json({
      success: true,
      session,
      message: 'Audio session generated successfully'
    });

  } catch (error) {
    console.error('Audio generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate audio session',
      details: error.message 
    });
  }
});

// Get user's voice models
app.get('/api/voice/models', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;

    // Here you would fetch from your database
    // For now, return mock data
    const voiceModels = [
      {
        id: 'mock_voice_1',
        userId,
        voiceId: 'mock_elevenlabs_id',
        fileName: 'user_voice_sample.wav',
        createdAt: new Date(),
        status: 'active'
      }
    ];

    res.json({
      success: true,
      voiceModels
    });

  } catch (error) {
    console.error('Get voice models error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch voice models',
      details: error.message 
    });
  }
});

// Journal endpoints
app.post('/api/journal/entry', authenticateToken, async (req, res) => {
  try {
    const { content, type, sessionId } = req.body;
    const { userId } = req.user;

    if (!content) {
      return res.status(400).json({ error: 'Journal content is required' });
    }

    const journalEntry = {
      userId,
      content,
      type: type || 'text', // 'text' or 'voice'
      sessionId,
      createdAt: new Date()
    };

    // Here you would save to your database
    res.json({
      success: true,
      journalEntry,
      message: 'Journal entry created successfully'
    });

  } catch (error) {
    console.error('Journal creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create journal entry',
      details: error.message 
    });
  }
});

app.get('/api/journal/entries', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { page = 1, limit = 10 } = req.query;

    // Here you would fetch from your database with pagination
    // For now, return mock data
    const journalEntries = [
      {
        id: 'mock_entry_1',
        userId,
        content: 'Today\'s meditation session was very calming.',
        type: 'text',
        sessionId: null,
        createdAt: new Date()
      }
    ];

    res.json({
      success: true,
      journalEntries,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: 1
      }
    });

  } catch (error) {
    console.error('Get journal entries error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch journal entries',
      details: error.message 
    });
  }
});

// Session management
app.post('/api/sessions', authenticateToken, async (req, res) => {
  try {
    const { script, voiceId, sessionType, customScript } = req.body;
    const { userId } = req.user;

    if (!voiceId) {
      return res.status(400).json({ error: 'Voice ID is required' });
    }

    const sessionData = {
      userId,
      voiceId,
      script: customScript || script,
      sessionType: sessionType || 'custom',
      createdAt: new Date(),
      status: 'pending'
    };

    // Here you would save to your database
    res.json({
      success: true,
      session: sessionData,
      message: 'Session created successfully'
    });

  } catch (error) {
    console.error('Session creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create session',
      details: error.message 
    });
  }
});

app.get('/api/sessions', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { page = 1, limit = 10 } = req.query;

    // Here you would fetch from your database
    // For now, return mock data
    const sessions = [
      {
        id: 'mock_session_1',
        userId,
        voiceId: 'mock_voice_id',
        script: 'Relax and breathe deeply...',
        sessionType: 'meditation',
        createdAt: new Date(),
        status: 'completed'
      }
    ];

    res.json({
      success: true,
      sessions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: 1
      }
    });

  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch sessions',
      details: error.message 
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    details: error.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 VocalSaaS Backend running on port ${PORT}`);
  console.log(`📚 API Documentation available at http://localhost:${PORT}/api/health`);
});

module.exports = app;
