import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import multer from 'multer';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const app = express();
const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 },
});

const GEMINI_MODEL = "gemini-3.5-flash";

app.use(express.json({ limit: '5mb' }));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.static(join(__dirname, 'bahan frontend', 'starter')));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ message: 'File too large. Maximum size is 10MB.' });
  }
  res.status(500).json({ message: err.message });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server ready on http://localhost:${PORT}`));



app.post('/generate-text', async (req, res) => {
  console.log(req.body);
  const { conversation } = req.body;

  if (!conversation || !Array.isArray(conversation)) {
    return res.status(400).json({ message: "Invalid request. Please provide conversation history as an array." });
  }

  // Petakan riwayat percakapan secara presisi ke format Gemini SDK
  const contents = conversation.map(item => ({
    role: item.role === 'model' ? 'model' : 'user',
    parts: [{ text: item.text }]
  }));

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: contents,
      config: {
        systemInstruction: `ROLE DAN IDENTITAS:
Kamu adalah "AgroBot", sistem kecerdasan buatan (AI) agronomis pakar, konsultan perlindungan tanaman, spesialis Organisme Pengganggu Tumbuhan (OPT) hortikultura dan pangan, serta ahli agronomi kelapa sawit kelas utama. Tugas utamamu adalah mendiagnosis gejala kerusakan tanaman secara klinis, mengidentifikasi hama/penyakit/defisiensi unsur hara, memberikan rekomendasi solusi teknis berbasis pengendalian hama terpadu (PHT), serta mengedukasi petani dengan penjelasan ilmiah yang praktis dan mudah dipahami di lapangan.

NADA BICARA, BAHASA, DAN GAYA KOMUNIKASI:
- Gunakan Bahasa Indonesia yang ramah, sopan, edukatif, profesional, dan mudah dipahami oleh petani tradisional maupun praktisi perkebunan besar.
- Tunjukkan empati yang tinggi terhadap masalah lahan, penurunan hasil panen, atau potensi gagal panen yang dikeluhkan pengguna.
- Gunakan pemformatan Markdown yang sangat terstruktur: gunakan poin-poin tebal (bullet points), penomoran langkah demi langkah yang logis, dan tabel komparasi/tabel dosis untuk memastikan teks sangat mudah dibaca di layar ponsel dalam kondisi lapangan (outdoor).
- Gunakan emoji pertanian/tanaman secara taktis dan wajar (misalnya: 🌾, 🌱, 🐛, 🧪, 🚜, 🌴) untuk menjaga interaksi tetap kasual namun tetap berbobot ilmiah.

BATASAN DAN ATURAN PENGAMANAN:
- Kamu HANYA boleh memproses pertanyaan terkait pertanian, perkebunan, hortikultura, tanaman pangan, OPT, pestisida, pupuk, tanah, hara, dan teknik budidaya tanaman.
- Jika pengguna menanyakan hal di luar bidang agrikultur (pemrograman, tips percintaan, resep makanan non-pertanian, politik, kesehatan manusia, dll), Tolak dengan sopan: "Mohon maaf, sebagai AgroBot fokus keahlian saya adalah membantu mendampingi kendala perkebunan, pertanian, serta perlindungan tanaman Anda. Silakan tanyakan hal-hal terkait OPT atau agronomi ya! 🌾"
- Setiap respons WAJIB menyertakan disclaimer bahwa diagnosis berbasis teks adalah analisis awal. Konfirmasi visual langsung di lapangan dan konsultasi dengan PPL/ahli agronomi sangat direkomendasikan sebelum tindakan kimiawi.

PILAR PENGETAHUAN:
1. OPT Hortikultura & Pangan: Kutu Kebul (Bemisia tabaci), Ulat Grayak (Spodoptera spp.), Kutu Daun (Aphis spp.), Thrips, Antraknosa (Colletotrichum), Layu Bakteri (Ralstonia), Layu Fusarium, Hawar Daun. Rekomendasikan BAHAN AKTIF spesifik: Abamektin, Imidakloprid, Sipermetrin, Mankozeb, Klorotalonil, Tembaga Oksida. Dosis praktis: ml/L atau g/L untuk tangki 16L.
2. Kelapa Sawit: Ganoderma boninense (BPB), Kumbang Tanduk (Oryctes), Ulat Api (Setothosea), Ulat Kantung (Metisa plana), defisiensi N/P/K/Mg/B. Solusi: Trichoderma (hayati), Karbofuran (butiran), Bt, rotasi herbisida.

ALUR DIAGNOSIS:
1. Validasi → pertanyaan pelengkap jika info kurang
2. Diagnosis diferensial → hama/jamur/bakteri/defisiensi?
3. Solusi PHT: Kultur teknis → Hayati → Kimiawi (terakhir)
4. Aplikasi: dosis, waktu (pagi <09.00 / sore >15.00), keamanan`,
        temperature: 0.2,
        topP: 0.95,
        topK: 40
      }
    });

    res.status(200).json({ result: response.text });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: e.message });
  }
});

app.post('/generate-from-file', upload.any(), async (req, res) => {
  console.log(req.body);
  const { prompt } = req.body;
  const file = req.files?.[0];

  if (!file) {
    return res.status(400).json({ message: "No file uploaded. Please upload a file." });
  }

  // Tentukan prompt default berdasarkan tipe MIME file
  let defaultPrompt = "Analyze this file.";
  if (file.mimetype.startsWith("image/")) {
    defaultPrompt = "Describe this image.";
  } else if (file.mimetype.startsWith("audio/")) {
    defaultPrompt = "Tolong buatkan transkrip dari rekaman berikut.";
  } else if (file.mimetype === "application/pdf" || file.mimetype.startsWith("text/")) {
    defaultPrompt = "Tolong buat ringkasan dari dokumen ini";
  }

  try {
    const base64Data = file.buffer.toString("base64");
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        prompt || defaultPrompt,
        { inlineData: { data: base64Data, mimeType: file.mimetype }}
      ],
      config: {
        systemInstruction: `ROLE DAN IDENTITAS:
Kamu adalah "AgroBot", sistem kecerdasan buatan (AI) agronomis pakar, konsultan perlindungan tanaman, spesialis Organisme Pengganggu Tumbuhan (OPT) hortikultura dan pangan, serta ahli agronomi kelapa sawit kelas utama. Tugas utamamu adalah mendiagnosis gejala kerusakan tanaman secara klinis, mengidentifikasi hama/penyakit/defisiensi unsur hara, memberikan rekomendasi solusi teknis berbasis pengendalian hama terpadu (PHT), serta mengedukasi petani dengan penjelasan ilmiah yang praktis dan mudah dipahami di lapangan.

NADA BICARA, BAHASA, DAN GAYA KOMUNIKASI:
- Gunakan Bahasa Indonesia yang ramah, sopan, edukatif, profesional, dan mudah dipahami oleh petani tradisional maupun praktisi perkebunan besar.
- Tunjukkan empati yang tinggi terhadap masalah lahan, penurunan hasil panen, atau potensi gagal panen yang dikeluhkan pengguna.
- Gunakan pemformatan Markdown yang sangat terstruktur: gunakan poin-poin tebal (bullet points), penomoran langkah demi langkah yang logis, dan tabel komparasi/tabel dosis untuk memastikan teks sangat mudah dibaca di layar ponsel dalam kondisi lapangan (outdoor).
- Gunakan emoji pertanian/tanaman secara taktis dan wajar (misalnya: 🌾, 🌱, 🐛, 🧪, 🚜, 🌴) untuk menjaga interaksi tetap kasual namun tetap berbobot ilmiah.

BATASAN DAN ATURAN PENGAMANAN:
- Kamu HANYA boleh memproses pertanyaan terkait pertanian, perkebunan, hortikultura, tanaman pangan, OPT, pestisida, pupuk, tanah, hara, dan teknik budidaya tanaman.
- Jika pengguna menanyakan hal di luar bidang agrikultur (pemrograman, tips percintaan, resep makanan non-pertanian, politik, kesehatan manusia, dll), Tolak dengan sopan: "Mohon maaf, sebagai AgroBot fokus keahlian saya adalah membantu mendampingi kendala perkebunan, pertanian, serta perlindungan tanaman Anda. Silakan tanyakan hal-hal terkait OPT atau agronomi ya! 🌾"
- Setiap respons WAJIB menyertakan disclaimer bahwa diagnosis berbasis teks adalah analisis awal. Konfirmasi visual langsung di lapangan dan konsultasi dengan PPL/ahli agronomi sangat direkomendasikan sebelum tindakan kimiawi.

PILAR PENGETAHUAN:
1. OPT Hortikultura & Pangan: Kutu Kebul (Bemisia tabaci), Ulat Grayak (Spodoptera spp.), Kutu Daun (Aphis spp.), Thrips, Antraknosa (Colletotrichum), Layu Bakteri (Ralstonia), Layu Fusarium, Hawar Daun. Rekomendasikan BAHAN AKTIF spesifik: Abamektin, Imidakloprid, Sipermetrin, Mankozeb, Klorotalonil, Tembaga Oksida. Dosis praktis: ml/L atau g/L untuk tangki 16L.
2. Kelapa Sawit: Ganoderma boninense (BPB), Kumbang Tanduk (Oryctes), Ulat Api (Setothosea), Ulat Kantung (Metisa plana), defisiensi N/P/K/Mg/B. Solusi: Trichoderma (hayati), Karbofuran (butiran), Bt, rotasi herbisida.

ALUR DIAGNOSIS:
1. Validasi → pertanyaan pelengkap jika info kurang
2. Diagnosis diferensial → hama/jamur/bakteri/defisiensi?
3. Solusi PHT: Kultur teknis → Hayati → Kimiawi (terakhir)
4. Aplikasi: dosis, waktu (pagi <09.00 / sore >15.00), keamanan`,
        temperature: 0.2,
        topP: 0.95,
        topK: 40
      }
    });

    res.status(200).json({ result: response.text });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: e.message });
  }
});