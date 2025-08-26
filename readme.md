
# Voice-Based Personalized Audio & Journaling App (Prototype)

## 📌 Overview

This prototype demonstrates a personalized voice journaling and audio session app.
The core idea: users **record their own voice**, a **custom voice model** is created via **ElevenLabs (or similar TTS service)**, and users can then **generate personalized audio sessions** (e.g., sleep, anxiety relief, focus).

Additionally, the app includes:

* A **journaling interface** (text & optional voice notes).
* **Secure storage** for recordings, models, and journal entries.
* A **basic audio player** for generated sessions.
* **Documentation** for setup, deployment, and API integrations.

---

## 🚀 Features (Prototype Deliverables)

### 1. Voice Recording & Onboarding

* Step-by-step onboarding flow.
* Record 2–5 minutes of high-quality audio.
* Noise detection (warn user if background noise is too high).
* Secure upload (encrypted in transit & at rest).

### 2. Custom Voice Model Creation

* Integrates with **ElevenLabs Voice Cloning API** (alternatives: PlayHT, Amazon Polly NTTS).
* Links generated voice model to user’s account.
* Error handling & retry flow for failed training.

### 3. Personalized Audio Sessions

* Predefined library of hypnosis/coaching scripts (sleep, anxiety, focus).
* Option to input **custom scripts**.
* Converts scripts → audio with user’s cloned voice.
* In-app audio player with **play/pause, progress bar, volume control**.
* Ability to regenerate sessions with new script edits or pacing changes.

### 4. Journaling

* **Text journaling**: daily prompts + free-form entries.
* **Optional voice journaling**: record short reflections, with optional transcription.
* Journals displayed in a timeline (edit/delete supported).
* Stored locally & synced securely to **Firebase Firestore**.

### 5. Data Security & Privacy

* HTTPS/TLS for all API traffic.
* Encrypted storage for voice models and journal entries.
* GDPR-compliant data handling.
* Clear UI messaging about voice/data usage.
* Full account + data deletion supported.

---

## 🛠 Tech Stack & Tools

### Frontend (Next.js)

* **Framework**: Next.js (React, SSR/SSG, API routes optional for client helpers)
* **Audio Recording & Playback**: Web Audio APIs, `recordrtc`, `media-recorder`, `howler`
* **UI**: Tailwind CSS

### Backend (FastAPI)

* **Framework**: FastAPI (Python), served by Uvicorn/Gunicorn
* **Voice Synthesis**: `requests` to [ElevenLabs API](https://api.elevenlabs.io)
* **Data & Storage**: [Supabase](https://supabase.com/) (PostgreSQL + realtime + auth + storage)

  * **Database** → journaling entries, session metadata (PostgreSQL)
  * **Storage** → raw recordings, generated audio
  * **Auth** → Supabase Auth (JWT tokens verified server-side)
  * **Realtime** → live updates for collaborative features

### Security

* **Encryption in transit**: HTTPS/TLS
* **Encryption at rest**: Supabase-managed encryption (PostgreSQL + storage)
* **Authentication**: Supabase Auth on the client; server verifies JWT tokens
* **Environment Variables**:

  Frontend (Next.js):

  * `NEXT_PUBLIC_SUPABASE_URL`
  * `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  * `NEXT_PUBLIC_API_BASE_URL`

  Backend (FastAPI):

  * `ELEVENLABS_API_KEY`
  * `SUPABASE_URL`
  * `SUPABASE_SERVICE_ROLE_KEY`

---

## 📂 Project Structure (Prototype)

```
/frontend                # Next.js app
  /app or /pages         # route handlers (depending on Next.js version)
  /components
    AudioPlayer.tsx
    ScriptInput.tsx
    JournalEntry.tsx
  /lib
    supabase.ts          # Supabase client init
  /styles
  next.config.js
  package.json

/backend                 # FastAPI app
  app/
    main.py              # FastAPI entrypoint
    api/
      tts.py             # ElevenLabs proxy endpoints
      journal.py         # CRUD for journal entries
      sessions.py        # create/list personalized sessions
      auth.py            # auth helpers (token verification)
    services/
      elevenlabs.py
      supabase.py        # Supabase client & helpers
      storage.py         # Supabase storage helpers
    models/
      schemas.py         # Pydantic models
  requirements.txt
  uvicorn.sh (optional)

/docs
  DEPLOYMENT.md          # setup, env vars, hosting
  API.md                 # ElevenLabs & Firebase API integration
```

---

## ⚡ Deployment & Setup

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/voice-journal-prototype.git
cd voice-journal-prototype
```

### 2. Install Dependencies

Frontend (Next.js):

```bash
cd frontend
npm install
```

Backend (FastAPI):

```bash
cd backend
python -m venv .venv
. .venv/bin/activate  # Windows PowerShell: .venv\\Scripts\\Activate.ps1
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Frontend (create `frontend/.env.local`):

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

Backend (create `backend/.env` or set system vars):

```
ELEVENLABS_API_KEY=your_api_key_here
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 4. Run App (Dev Mode)

Run backend first:

```bash
cd backend
. .venv/bin/activate  # Windows PowerShell: .venv\\Scripts\\Activate.ps1
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Then run frontend in another terminal:

```bash
cd frontend
npm run dev
```

### 5. Deploy Supabase

* Setup PostgreSQL tables for journaling entries and session metadata.
* Setup Storage buckets for user recordings and generated audio.
* Enable Supabase Authentication (email/password first).
* Configure Row Level Security (RLS) policies for data access control.

---

## 📖 Documentation

* [DEPLOYMENT.md](docs/DEPLOYMENT.md): Supabase setup, PostgreSQL schema, RLS policies, hosting instructions.
* [API.md](docs/API.md): ElevenLabs integration & Supabase SDK usage.
* [SECURITY.md](docs/SECURITY.md): Data encryption, GDPR compliance, account deletion process.

---

✅ Now this README is aligned to a **Next.js frontend + FastAPI backend** architecture with Supabase as the data layer.

Do you want me to also **draft the FastAPI routes and stub the Next.js pages**, and/or the **Supabase PostgreSQL schema and RLS policies** so users only access their own data?
