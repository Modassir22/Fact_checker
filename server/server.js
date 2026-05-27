import express from 'express';
import cors from 'cors';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import dotenv from 'dotenv';
import { extractClaimsWithAI } from './services/claimExtractor.js';
import { verifyClaimsWithAI } from './services/webVerifier.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigin = process.env.FRONTEND_URL || '*';
app.use(cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-gemini-key', 'x-openai-key', 'x-tavily-key']
}));

app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Supported formats: PDF, DOCX, TXT only!'), false);
    }
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Fact Checker API is running.' });
});

app.post('/api/check', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No document file uploaded!' });
    }

    const fileName = req.file.originalname;
    const mime = req.file.mimetype;
    
    const geminiApiKey = req.headers['x-gemini-key'] || process.env.GEMINI_API_KEY;
    const openaiApiKey = req.headers['x-openai-key'] || process.env.OPENAI_API_KEY;
    const tavilyApiKey = req.headers['x-tavily-key'] || process.env.TAVILY_API_KEY;

    let textContent = '';
    try {
      if (mime === 'text/plain') {
        textContent = req.file.buffer.toString('utf-8');
      } else if (mime === 'application/pdf') {
        const data = await pdfParse(req.file.buffer);
        textContent = data.text;
      } else if (
        mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        mime === 'application/msword'
      ) {
        const result = await mammoth.extractRawText({ buffer: req.file.buffer });
        textContent = result.value;
      } else {
        return res.status(400).json({ error: 'Unsupported file format! Please upload PDF, DOCX, or TXT.' });
      }
    } catch (parseError) {
      return res.status(500).json({ error: `Failed to extract text from the file "${fileName}".` });
    }

    if (!textContent || textContent.trim().length === 0) {
      return res.status(400).json({ error: 'Document appears to be empty or contains no extractable text.' });
    }

    if (!tavilyApiKey) {
      return res.status(400).json({ 
        error: 'Tavily Search API Key is required for live verification.' 
      });
    }

    if (!geminiApiKey && !openaiApiKey) {
      return res.status(400).json({ 
        error: 'Either a Gemini API Key or an OpenAI API Key is required to extract and compare claims.' 
      });
    }

    const claims = await extractClaimsWithAI(textContent, geminiApiKey, openaiApiKey);

    if (claims.length === 0) {
      return res.status(400).json({ 
        error: 'AI failed to extract any factual claims from this document.' 
      });
    }

    const verificationResults = await verifyClaimsWithAI(claims, geminiApiKey, openaiApiKey, tavilyApiKey, fileName, textContent);
    
    return res.json(verificationResults);

  } catch (err) {
    res.status(500).json({ error: err.message || 'An unexpected error occurred during document verification.' });
  }
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

app.listen(PORT, () => {
});
