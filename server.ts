import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { generateQuestionsWithGemini } from './src/server/geminiService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// API route for generating questions via Gemini
app.post('/api/gemini/generate-questions', async (req, res) => {
  try {
    const questions = await generateQuestionsWithGemini(req.body);
    res.json({ questions });
  } catch (error: unknown) {
    console.error('Server Gemini Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown server error';
    res.status(500).json({ error: message });
  }
});

// Serve static assets from built frontend
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Fallback to index.html for SPA
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
