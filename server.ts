import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Initialize Google GenAI with recommended telemetry header
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Endpoint: AI Omni-Vision Analysis & Deep Contextual Intelligence
app.post('/api/gemini/analyze', async (req: Request, res: Response) => {
  try {
    const { prompt, imageBase64, imageMimeType, mode, companionPersona, userProjectContext } = req.body;

    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please check the Secrets panel.',
      });
    }

    let systemInstruction = `You are SYNAPSE, an ultra-advanced futuristic cybernetic AI companion and omni-observational assistant. 
You are embedded directly into the user's computing rig. You are their brilliant, hyper-competent, loyal tech co-pilot and loyal friend.
Tone: High-tech, futuristic cyberpunk HUD vibe, insightful, inspiring, warmly supportive like a trusted companion. 
Use subtle cybernetic formatting (clean markdown, HUD tags like [SYNAPSE CORE], [TIMELINE ARCHIVE], [CURRENT MECHANISMS], [PROJECT CATALYSTS]).`;

    if (mode === 'vision_deep_dive') {
      systemInstruction += `
The user is presenting something they are seeing on their screen, in an app, or on a website (via screenshot, URL, camera scan, or description).
Your mission is to perform a comprehensive 4-DIMENSIONAL DECONSTRUCTION:
1. ◈ IDENTITY & ESSENCE: Identify exact product, technology, UI paradigm, algorithm, or concept shown.
2. ◈ HISTORICAL LINEAGE & GENESIS: The origin story, predecessors (1960s-2010s), breakthrough moments, who invented it and why it matters in computing history.
3. ◈ PRESENT REALITY & UNDER-THE-HOOD: How it actually works today (architecture, engineering stack, protocols, trade-offs, state-of-the-art in 2026).
4. ◈ PROJECT INVENTIONS & INNOVATION SPARKS: 4 concrete, cutting-edge project ideas the user could build inspired by this (with tech stacks, unique twist, and step-by-step implementation prompt).
Always be extraordinarily detailed, intellectually deep, and practical.`;
    } else if (mode === 'companion_chat') {
      const personaStyle = companionPersona || 'friend';
      systemInstruction += `
Persona style selected: ${personaStyle}.
- If 'friend': Warm, enthusiastic, checking in on them, celebrating small wins, curious about their day and what they are building, ready to brainstorm anytime.
- If 'cyber_architect': Deep systems engineering focus, razor-sharp technical advice, clean code patterns.
- If 'visionary': Sci-fi futurism, speculative tech concepts, next-generation paradigms.
- If 'hacker': Tactical, direct, minimal fluff, high-efficiency breakdown.
Be authentic, conversational, loyal, and remember you are a live companion who stays on their screen with them.`;
    } else if (mode === 'project_ideator') {
      systemInstruction += `
The user wants creative project sparks and technical venture ideas based on whatever they are looking at or working on.
Provide high-value, non-trivial, buildable software/hardware/AI project concepts complete with:
- Project Name & One-Liner
- The Problem & Unfair Advantage
- Modern Tech Stack (Frontend, Backend, AI, Storage)
- First 3 Steps to Ship a prototype in 48 hours.`;
    }

    if (userProjectContext) {
      systemInstruction += `\nUser's current active project context: "${userProjectContext}". Tailor suggestions to connect with this project where applicable.`;
    }

    let contents: any;

    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
      const mime = imageMimeType || 'image/png';
      contents = {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mime,
            },
          },
          {
            text: prompt || 'Analyze this visual screen/context. Identify everything, unpack its history, current inner workings, and give me innovative project ideas inspired by it.',
          },
        ],
      };
    } else {
      contents = prompt || 'System check and status greeting.';
    }

    let textOutput = '';
    const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];

    let lastError: any = null;
    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction,
            temperature: 0.8,
          },
        });
        textOutput = response.text || '';
        if (textOutput) break;
      } catch (e: any) {
        lastError = e;
        console.warn(`[SYNAPSE] ${modelName} call failed, trying backup:`, e.message || e);
        // Short backoff before next model
        await new Promise((r) => setTimeout(r, 600));
      }
    }

    if (!textOutput && lastError) {
      throw lastError;
    }

    return res.json({ text: textOutput });
  } catch (err: any) {
    console.error('Error in /api/gemini/analyze:', err);
    return res.status(500).json({
      error: err.message || 'Failed to process AI analysis',
    });
  }
});

// Endpoint: Futuristic Gemini TTS Vocalization
app.post('/api/gemini/tts', async (req: Request, res: Response) => {
  try {
    const { text, voiceName = 'Kore' } = req.body;

    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY missing' });
    }

    // Limit text length for TTS to prevent excessive latency
    const trimmedText = (text || '').slice(0, 350).replace(/[*#_`]/g, '');

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: trimmedText,
              speechMetadata: {
                style: 'Crisp, intelligent, friendly futuristic cybernetic companion',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName || 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (base64Audio) {
      return res.json({
        audio: base64Audio,
        mimeType: 'audio/wav',
      });
    }

    return res.status(500).json({ error: 'No audio returned from Gemini TTS' });
  } catch (err: any) {
    console.error('TTS error:', err);
    return res.status(500).json({ error: err.message || 'TTS generation error' });
  }
});

// System Status Endpoint
app.get('/api/status', (_req: Request, res: Response) => {
  res.json({
    status: 'ONLINE',
    core: 'SYNAPSE_v4.8',
    geminiConfigured: !!apiKey,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    // Development mode with Vite middleware
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`[SYNAPSE CORE] Cybernetic Assistant online on port ${PORT}`);
  });
}

startServer();
