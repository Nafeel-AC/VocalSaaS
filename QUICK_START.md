# 🚀 Quick Start Guide

Get VocalSaaS running in 5 minutes!

## ⚡ Quick Setup

### 1. Install Dependencies
```bash
# Backend
cd Backend
npm install

# Frontend  
cd ../Frontend/vite-project
npm install
```

### 2. Environment Setup
```bash
# Backend
cd Backend
cp .env.example .env
# Edit .env with your API keys

# Frontend
cd ../Frontend/vite-project  
cp .env.example .env
# Edit .env with your Supabase credentials
```

### 3. Start Development Servers

**Windows:**
```bash
start-dev.bat
```

**Linux/Mac:**
```bash
./start-dev.sh
```

**Manual:**
```bash
# Terminal 1 - Backend
cd Backend
npm start

# Terminal 2 - Frontend  
cd Frontend/vite-project
npm run dev
```

### 4. Open Your Browser
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🔑 Required API Keys

### ElevenLabs
1. Go to [ElevenLabs](https://elevenlabs.io/)
2. Sign up and get your API key
3. Add to `Backend/.env`

### Supabase
1. Go to [Supabase](https://supabase.com/)
2. Create new project
3. Get URL and anon key
4. Add to both `.env` files

## 📱 First Time Setup

1. **Sign Up** with email/password
2. **Record Voice Sample** (2-3 minutes recommended)
3. **Create Voice Model** (wait for ElevenLabs processing)
4. **Generate Audio Session** using your voice
5. **Start Journaling** your experiences

## 🆘 Common Issues

**Backend won't start?**
- Check if port 5000 is free
- Verify `.env` file exists and has correct values

**Frontend won't start?**
- Check if port 3000 is free  
- Verify Supabase credentials in `.env`

**Voice recording not working?**
- Check microphone permissions in browser
- Use HTTPS in production (required for media APIs)

**ElevenLabs errors?**
- Verify API key is correct
- Check API usage limits
- Ensure audio file is valid format

## 🎯 Next Steps

- [ ] Set up Supabase database tables
- [ ] Configure RLS policies
- [ ] Test voice recording
- [ ] Generate first audio session
- [ ] Create journal entries

Need help? Check the main README.md for detailed documentation!
