# AgroBot — AI Agronomis Konsultan Pertanian & Perkebunan

AgroBot adalah aplikasi chatbot fullstack berbasis Gemini AI yang berfungsi sebagai konsultan perlindungan tanaman dan ahli agronomi. Mendukung percakapan multi-turn dan upload file (gambar, PDF, audio) untuk analisis masalah tanaman.

## Prasyarat

- **Node.js** >= 18.x
- **npm** (sudah termasuk dalam instalasi Node.js)
- **Gemini API Key** — ambil dari [Google AI Studio](https://aistudio.google.com)

## Instalasi

```bash
# 1. Clone / buka folder project
cd HACTIV8

# 2. Install dependencies
npm install

# 3. Buat file .env dari template
cp .env.example .env
# Lalu isi GEMINI_API_KEY dengan API key kamu
```

## Menjalankan Aplikasi

### Mode Development (auto-reload dengan nodemon)

```bash
npm run dev
```

### Mode Production

```bash
npm start
```

Buka browser: **http://localhost:3000**

## Endpoint API

### `POST /generate-text`

Percakapan multi-turn. Payload:

```json
{
  "conversation": [
    { "role": "user", "text": "Daun kelapa sawit saya berwarna oranye" },
    { "role": "model", "text": "Berikut analisisnya..." }
  ]
}
```

### `POST /generate-from-file`

Upload file + prompt ke Gemini. Body: `multipart/form-data`
- `file` — file (gambar/PDF/audio)
- `prompt` — instruksi teks (opsional)

## Struktur Project

```
HACTIV8/
├── index.js                      # Backend Express server
├── package.json                  # Dependencies & scripts
├── .env                          # API key (RAHASIA, di-gitignore)
├── .env.example                  # Template .env
├── .gitignore                    # Abaikan node_modules/.env/lock
├── README.md
├── bahan frontend/
│   └── starter/
│       ├── index.html            # UI (Glassmorphism chat interface)
│       ├── style.css             # Styling lengkap
│       └── script.js             # Frontend logic + markdown parser
└── tasks/
    ├── todo.md                   # Task tracker
    ├── lessons.md                # Lessons learned
    └── mindset.md                # Workflow mindset
```

## Fitur

| Fitur | Detail |
|-------|--------|
| **AI Persona** | AgroBot — konsultan agronomi & perlindungan tanaman |
| **Multi-turn Chat** | Context conversation history antar pesan |
| **File Upload** | Gambar, PDF, audio untuk analisis tanaman |
| **PHT** | Rekomendasi pengendalian hama terpadu |
| **Defisiensi Hara** | Diagnosis N/P/K/Mg/B pada kelapa sawit |
| **UI** | Glassmorphism, responsive, markdown rendering |
| **Error Handling** | Global middleware + file size limit 10MB |

## Catatan Pengembangan

- Semua dependencies wajib ada di `package.json` (bukan hanya ter-install)
- Gunakan ES Modules (`"type": "module"`)
- Static files dilayani dari `bahan frontend/starter/` via `express.static`
- __dirname digunakan untuk kompatibilitas path ES Modules