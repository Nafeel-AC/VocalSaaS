# VocalSaaS Backend

This is the backend server for the VocalSaaS application, providing API endpoints for voice model creation, audio generation, journaling, and session management.

## 🛠 Tech Stack

- **Node.js** with Express
- **Supabase** for database and storage
- **ElevenLabs API** for voice cloning and text-to-speech
- **JWT** for authentication
- **Multer** for file uploads

## 📁 Project Structure

```
Backend/
├── server.js                 # Main entry point
├── .env                      # Environment variables (create from .env.example)
├── .env.example              # Example environment variables
├── nodemon.json              # Nodemon configuration
├── package.json              # Project dependencies
└── src/
    ├── config/
    │   └── db.js             # Database configuration
    ├── controllers/
    │   ├── authController.js # Authentication logic
    │   ├── journalController.js # Journal entry logic
    │   ├── sessionController.js # Audio session logic
    │   └── voiceController.js # Voice model logic
    ├── models/
    │   ├── Journal.js        # Journal entry model
    │   ├── Session.js        # Audio session model
    │   ├── User.js           # User model
    │   └── VoiceModel.js     # Voice model model
    ├── routes/
    │   ├── authRoutes.js     # Authentication routes
    │   ├── journalRoutes.js  # Journal routes
    │   ├── sessionRoutes.js  # Session routes
    │   └── voiceRoutes.js    # Voice model routes
    └── utils/
        └── auth.js           # Authentication utilities
```

## 🔧 Setup

1. Clone the repository
2. Navigate to the Backend directory
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file based on `.env.example`
5. Start the development server:
   ```
   npm run dev
   ```

## 🔑 Required API Keys

- **ElevenLabs API Key**: Get from [ElevenLabs](https://elevenlabs.io/)
- **Supabase URL and Service Role Key**: Get from your Supabase project

## 📝 API Endpoints

### Authentication

- `POST /api/auth/token` - Validate Supabase token and issue JWT
- `GET /api/auth/profile` - Get user profile

### Voice Models

- `POST /api/voice/upload` - Upload voice recording and create voice model
- `POST /api/voice/generate` - Generate audio with voice model
- `GET /api/voice/models` - Get all user's voice models
- `GET /api/voice/models/:id` - Get a specific voice model
- `DELETE /api/voice/models/:id` - Delete a voice model

### Audio Sessions

- `POST /api/sessions` - Create a new audio session
- `GET /api/sessions` - Get all user's sessions
- `GET /api/sessions/:id` - Get a specific session
- `PUT /api/sessions/:id` - Update a session
- `DELETE /api/sessions/:id` - Delete a session

### Journal Entries

- `POST /api/journal/entries` - Create a new journal entry
- `GET /api/journal/entries` - Get all user's journal entries
- `GET /api/journal/entries/:id` - Get a specific journal entry
- `PUT /api/journal/entries/:id` - Update a journal entry
- `DELETE /api/journal/entries/:id` - Delete a journal entry

## 🚀 Development

- Run development server with hot reloading:
  ```
  npm run dev
  ```
- Run production server:
  ```
  npm start
  ```
