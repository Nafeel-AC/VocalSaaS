
# VocalSaaS - Voice-Based Personalized Audio & Journaling App

## 📌 Overview

VocalSaaS is a personalized voice journaling and audio session app that allows users to:
- **Record their own voice** to create custom voice models
- **Generate personalized audio sessions** using their cloned voice
- **Journal their thoughts and experiences** with text entries
- **Listen to guided sessions** in their own voice for meditation, sleep, focus, and anxiety relief

## 🚀 Features

### 1. Voice Recording & Model Creation
- High-quality voice recording with noise detection
- Integration with ElevenLabs Voice Cloning API
- Secure voice model storage and management

### 2. Personalized Audio Sessions
- Pre-built scripts for meditation, sleep, focus, and anxiety relief
- Custom script input for personalized content
- Full-featured audio player with controls

### 3. Journaling System
- Text-based journal entries
- Edit and delete functionality
- Timestamp tracking and organization

### 4. User Authentication
- Secure signup/signin with Supabase Auth
- JWT token-based authentication
- Protected API endpoints

## 🛠 Tech Stack

### Frontend
- **React 19** with Vite
- **Tailwind CSS** for styling
- **Supabase** for authentication and database

### Backend
- **Node.js** with Express
- **ElevenLabs API** for voice cloning and TTS
- **JWT** for authentication
- **Multer** for file uploads

### Database & Storage
- **Supabase** (PostgreSQL + Auth + Storage)

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- ElevenLabs API key
- Supabase project

### 1. Clone the Repository
```bash
git clone <repository-url>
cd VocalSaaS
```

### 2. Backend Setup
```bash
cd Backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your credentials
# ELEVENLABS_API_KEY=your_key_here
# SUPABASE_URL=your_supabase_url
# SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
# JWT_SECRET=your_jwt_secret

# Start the server
npm start
```

### 3. Frontend Setup
```bash
cd Frontend/vite-project

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your Supabase credentials
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_ANON_KEY=your_anon_key

# Start the development server
npm run dev
```

### 4. Supabase Configuration
1. Create a new Supabase project
2. Enable Email/Password authentication
3. Create the following tables (SQL provided below)
4. Set up Row Level Security (RLS) policies

## 🗄 Database Schema

### Users Table (Auto-created by Supabase Auth)
```sql
-- Users are managed by Supabase Auth
-- Additional user metadata can be stored in auth.users
```

### Voice Models Table
```sql
CREATE TABLE voice_models (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  voice_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE voice_models ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own voice models
CREATE POLICY "Users can view own voice models" ON voice_models
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own voice models" ON voice_models
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own voice models" ON voice_models
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own voice models" ON voice_models
  FOR DELETE USING (auth.uid() = user_id);
```

### Audio Sessions Table
```sql
CREATE TABLE audio_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  voice_id TEXT NOT NULL,
  script TEXT NOT NULL,
  session_type TEXT NOT NULL,
  audio_data TEXT, -- Base64 encoded audio
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE audio_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own sessions
CREATE POLICY "Users can view own sessions" ON audio_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON audio_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON audio_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions" ON audio_sessions
  FOR DELETE USING (auth.uid() = user_id);
```

### Journal Entries Table
```sql
CREATE TABLE journal_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  entry_type TEXT DEFAULT 'text',
  session_id UUID REFERENCES audio_sessions(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own journal entries
CREATE POLICY "Users can view own journal entries" ON journal_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journal entries" ON journal_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journal entries" ON journal_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own journal entries" ON journal_entries
  FOR DELETE USING (auth.uid() = user_id);
```

## 🔧 API Endpoints

### Authentication Required Endpoints
All endpoints require a valid JWT token in the Authorization header: `Bearer <token>`

#### Voice Management
- `POST /api/voice/upload` - Upload voice sample and create voice model
- `POST /api/voice/generate` - Generate personalized audio session
- `GET /api/voice/models` - Get user's voice models

#### Journal Management
- `POST /api/journal/entry` - Create new journal entry
- `GET /api/journal/entries` - Get user's journal entries

#### Session Management
- `POST /api/sessions` - Create new audio session
- `GET /api/sessions` - Get user's audio sessions

## 🚀 Usage

### 1. User Registration & Authentication
- Users sign up with email and password
- Authentication is handled by Supabase Auth
- JWT tokens are used for API access

### 2. Voice Model Creation
- User records 2-5 minutes of high-quality audio
- Audio is uploaded to ElevenLabs for voice cloning
- Voice model is created and linked to user account

### 3. Audio Session Generation
- User selects voice model and session type
- Custom scripts can be written or predefined ones used
- ElevenLabs TTS generates personalized audio
- Audio is played in the built-in player

### 4. Journaling
- Users can create text-based journal entries
- Entries are timestamped and organized
- Full CRUD operations supported

## 🔒 Security Features

- **HTTPS/TLS** for all API traffic
- **JWT authentication** for API endpoints
- **Row Level Security** in database
- **Input validation** and sanitization
- **File upload restrictions** (audio files only)
- **User isolation** (users can only access their own data)

## 🌐 Environment Variables

### Backend (.env)
```env
PORT=5000
JWT_SECRET=your-super-secret-jwt-key
ELEVENLABS_API_KEY=your-elevenlabs-api-key
SUPABASE_URL=your-supabase-project-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### Frontend (.env)
```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_API_BASE_URL=http://localhost:5000
```

## 📱 Running the Application

### Development Mode
1. Start backend: `cd Backend && npm start`
2. Start frontend: `cd Frontend/vite-project && npm run dev`
3. Open browser to `http://localhost:3000`

### Production Build
```bash
# Frontend
cd Frontend/vite-project
npm run build

# Backend
cd Backend
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code comments

## 🔮 Future Enhancements

- Voice journaling with transcription
- Advanced audio effects and filters
- Community script sharing
- Mobile app development
- AI-powered script suggestions
- Progress tracking and analytics
