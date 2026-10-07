import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Endpoint for Gemini AI Cyber Advisor (Academic, Skripsi & Career Path)
app.post('/api/gemini/advisor', async (req: Request, res: Response) => {
  try {
    const { prompt, currentSemester, targetCareer, completedCourses, targetIPK } = req.body;

    if (!prompt && !targetCareer) {
      return res.status(400).json({ error: 'Prompt or targetCareer is required' });
    }

    if (!ai) {
      // Fallback response if GEMINI_API_KEY is not set
      return res.json({
        text: `[OFFLINE/HEURISTIC ENGINE // MATRIX ANALYZER]
Target: ${targetCareer || 'Sistem Informasi Specialist'} (Semester ${currentSemester || 5})
Target IPK: ${targetIPK || '3.75'}

Rekomendasi Strategis Semester 5+:
1. Prioritas Utama: Perdalam Analisis & Perancangan Sistem, Basis Data Lanjut, dan Enterprise Architecture.
2. Skill Kunci Industri: Kuasai SQL kompleks, REST APIs, Docker, dan Framework (React/Next.js atau Spring/FastAPI).
3. Jalur Skripsi SI: Topik Audit Tata Kelola IT (COBIT 2019) atau Prediksi Churn Pelanggan dengan Machine Learning.
4. Sertifikasi Relevan: AWS Certified Cloud Practitioner / CompTIA Security+ / Google Data Analytics.`,
        sources: [],
      });
    }

    const systemInstruction = `Kamu adalah 'CYBER_CORE // AI ACADEMIC & CAREER ADVISOR' untuk mahasiswa Sistem Informasi (S1).
Gunakan gaya komunikasi bernuansa Cyberpunk / Hacker yang profesional, cerdas, taktis, dan mudah dipahami.
Berikan saran akademik konkret, strategi lulus tepat waktu (Semester 1-8), persiapan matang untuk mahasiswa yang sekarang di Semester 5, rekomendasi topik Skripsi/Tugas Akhir SI, serta roadmap skill teknis dan sertifikasi industri internasional.
Format output dengan rapi menggunakan markdown, bullet points, dan cyber badges seperti [PRIORITY: CRITICAL], [SKILL_UPGRADE], [TACTICAL_ACTION].`;

    const userQuery = prompt || `Saya mahasiswa Sistem Informasi saat ini di Semester ${currentSemester || 5}.
Target karier impian saya adalah: ${targetCareer}.
Target IPK saya: ${targetIPK || '3.75'}.
Mata kuliah yang telah diselesaikan: ${Array.isArray(completedCourses) ? completedCourses.join(', ') : 'Semester 1-4 standard'}.
Berikan analisis gap skill, rekomendasi sertifikasi, mata kuliah kunci yang wajib dimaksimalkan, dan ide topik Skripsi yang aplikatif di industri terkini.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userQuery,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || 'Tidak ada respon yang dihasilkan.';
    const searchChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = searchChunks
      .map((chunk: any) => ({
        title: chunk.web?.title || 'Sumber Web',
        uri: chunk.web?.uri || '',
      }))
      .filter((s: any) => s.uri);

    res.json({ text, sources });
  } catch (error: any) {
    console.error('Gemini advisor error:', error);
    res.status(500).json({
      error: error.message || 'Gagal memproses rekomendasi AI',
      fallback: true,
      text: `[SYSTEM FALLBACK // MATRIX RECOVERY]
Analisis otomatis Sistem Informasi Semester 5:
- Fokus Semester 5: Penguasaan Tata Kelola TI, E-Business / Technopreneurship, dan Data Mining.
- Rekomendasi Portofolio: Bangun minimal 2 proyek nyata (Fullstack web + Dashboard analitik).
- Skripsi Relevan: Sistem Informasi Manajemen Rantai Pasok atau Perancangan UI/UX berbasis Design Thinking.`,
    });
  }
});

// Real-time Cloud Sync simulation endpoint
let cloudSyncStorage: Record<string, any> = {
  lastSync: new Date().toISOString(),
  recordsCount: 0,
};

app.post('/api/sync', (req: Request, res: Response) => {
  const { payload, clientTimestamp } = req.body;
  cloudSyncStorage = {
    ...cloudSyncStorage,
    lastSync: new Date().toISOString(),
    clientTimestamp,
    payloadSummary: payload ? Object.keys(payload) : [],
    status: 'SYNCED',
  };
  res.json({
    success: true,
    serverTimestamp: new Date().toISOString(),
    message: 'Data telemetry synchronized successfully with Cloud Matrix.',
  });
});

app.get('/api/sync/status', (_req: Request, res: Response) => {
  res.json({
    online: true,
    serverTime: new Date().toISOString(),
    storage: cloudSyncStorage,
  });
});

// Setup Vite in Dev or Static files in Prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CYBER//ROADMAP] Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
