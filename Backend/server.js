const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const voiceRoutes = require('./src/routes/voiceRoutes');
const sessionRoutes = require('./src/routes/sessionRoutes');
const journalRoutes = require('./src/routes/journalRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'VocalSaaS Backend is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/journal', journalRoutes);

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    error: 'Internal server error',
    details: error.message
  });
});

// 404 handler
app.use('/*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 VocalSaaS Backend running on port ${PORT}`);
  console.log(`📚 API Documentation available at http://localhost:${PORT}/api/health`);
});

module.exports = app;
