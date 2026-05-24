# AgroBot Project Context — Session Summary

## Project Overview
**AgroBot** adalah aplikasi chatbot fullstack berbasis Gemini AI yang berfungsi sebagai konsultan perlindungan tanaman dan ahli agronomi kelapa sawit.

## Tech Stack
- **Backend**: Express.js + Gemini AI SDK (@google/genai v2.6.0)
- **Frontend**: Vanilla HTML/CSS/JS dengan Glassmorphism UI
- **Dependencies**: dotenv, multer, express
- **Runtime**: Node.js >= 18.x, ES Modules

## Project Structure
```
C:/Users/Administrator/Documents/HACTIV8/
├── index.js                      # Backend server (port 3000)
├── package.json                  # Dependencies
├── .env                          # API key (gitignored)
├── .env.example                  # Template
├── .gitignore                    # Protects secrets
├── README.md                     # Documentation
├── bahan frontend/starter/
│   ├── index.html                # Chat UI
│   ├── script.js                 # Frontend logic
│   └── style.css                 # Glassmorphism styling
└── tasks/
    ├── todo.md                   # Task tracker (7 phases completed)
    ├── lessons.md                # Lessons learned
    └── mindset.md                # Workflow principles
```

## Key Features
1. **AI Persona**: AgroBot — agronomis expert, OPT specialist, palm oil consultant
2. **Multi-turn Conversation**: Context-aware chat history
3. **File Upload**: Image/PDF/audio analysis via `/generate-from-file`
4. **PHT Recommendations**: Integrated Pest Management approach
5. **Deficiency Diagnosis**: N/P/K/Mg/B nutrient analysis for palm oil
6. **Guardrails**: Rejects non-agricultural queries politely

## API Endpoints
- `POST /generate-text` — Multi-turn conversation with `{ conversation: [...] }`
- `POST /generate-from-file` — File upload (multipart/form-data)
- `GET /` — Serves frontend static files

## System Instruction (Backend)
AgroBot persona configured in `index.js` with:
- Role: AI agronomis, OPT consultant, palm oil expert
- Language: Bahasa Indonesia (ramah, edukatif, empati tinggi)
- Format: Markdown structured (tables, bullets, emoji 🌾🌱🐛)
- Guardrails: Agriculture-only, disclaimer required
- Knowledge: OPT hortikultura, kelapa sawit (Ganoderma, Oryctes, defisiensi hara)
- Diagnosis flow: Validasi → Diagnosis → PHT (kultur → hayati → kimiawtHub Repository
- **URL**: https://github.com/elrioprofit/projectbothactiv8farm
- **Branch**: main
- **Last Commit**: 4c0dc52 (docs: remove .gitignore section from README)
- **Protected Files**: .env, node_modules/, package-lock.json, *.zip

## Development Commands
```bash
npm install          # Install dependencies
npm start            # Production mode
npm run dev          # Development mode (nodemon)
```

## Environment Variables
```
GEMINI_API_KEY=AIzaSy...  # From .env (not committed)
```

## Implementation Phases Completed
1. ✅ Planning & Approval
2. ✅ Backend Implementation (Express + Gemini SDK)
3. ✅ Frontend Implementation (Glassmorphism UI)
4. ✅ Verification & Walkthrough
5. ✅ Production Readiness (bug fixes, static serving, error handling)
6. ✅ AgroBot Persona Integration
7. ✅ Repository Preparation & Code Cleanup

## Critical Fixes Applied
- Fixed `GoogleGenAI` initialization with API key from `.env`
- Added `express.static()` for frontend serving
- Added `__dirname` polyfill for ES Modules path resolution
- Added multer file size limit (10MB)
- Added global error handler middleware
- Updated all dependencies in `package.json`
- Removed dead code and test files
- Created comprehensive 

## Server Status
- **Running**: http://localhost:3000
- **Verified**: Frontend loads, API endpoints work, AgroBot responds correctly

## Next Steps (If Needed)
- Add database for conversation persistence
- Implement user authentication
- Add rate limiting
- Deploy to cloud (Vercel/Railway/Render)
- Add monitoring/logging (Winston/Pino)

## Important Notes
- API key stored in `.env` — never commit to git
- Frontend branding: "AgroBot" with 🌱 logo
- Loading text: "AgroBot sedang menganalisis"
- Error messages: Agricultural-themed, helpful
- All static files served from `bahan frontend/starter/`

---
**Session Date**: 2026-05-23 → 2026-05-24
**Status**: ✅ Production-ready, deployed to GitHub