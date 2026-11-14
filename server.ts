import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

function createGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function buildRuleBasedSentence(words: string[]): string {
  const normalized = words.map((w) => w.trim().toLowerCase()).filter(Boolean);
  if (normalized.length === 0) return '';

  const mapped = normalized.map((w) => (w === 'me' ? 'I' : w === 'i' ? 'I' : w));
  const joined = mapped.join(' ');

  // Common sign-order patterns -> natural English
  if (mapped.length === 1) {
    const single = mapped[0];
    if (single === 'hello') return 'Hello!';
    if (single === 'thank you') return 'Thank you.';
    if (single === 'sorry') return 'I am sorry.';
    if (single === 'please') return 'Please.';
    if (single === 'help') return 'I need help.';
    if (single === 'stop') return 'Please stop.';
    if (single === 'yes') return 'Yes.';
    if (single === 'no') return 'No.';
    if (single === 'water') return 'I would like some water.';
    if (single === 'food') return 'I would like some food.';
    if (single === 'hungry') return 'I am hungry.';
    if (single === 'thirsty') return 'I am thirsty.';
    if (single === 'doctor') return 'I need a doctor.';
    if (single === 'hospital') return 'I need to go to the hospital.';
    if (single === 'pain') return 'I am in pain.';
    if (single === 'home') return 'I want to go home.';
    if (single === 'bathroom') return 'Where is the bathroom?';
    if (single === 'love') return 'I love you.';
    return single.charAt(0).toUpperCase() + single.slice(1) + '.';
  }

  // Handle patterns like ["I", "water", "want"] or ["me", "water", "want"]
  const hasI = mapped.includes('I');
  const hasYou = mapped.includes('you');
  const hasWant = mapped.includes('want');
  const hasWater = mapped.includes('water');
  const hasFood = mapped.includes('food');
  const hasHelp = mapped.includes('help');
  const hasDoctor = mapped.includes('doctor');
  const hasHospital = mapped.includes('hospital');
  const hasPain = mapped.includes('pain');
  const hasBathroom = mapped.includes('bathroom');
  const hasHome = mapped.includes('home');
  const hasHungry = mapped.includes('hungry');
  const hasThirsty = mapped.includes('thirsty');
  const hasLove = mapped.includes('love');
  const hasPlease = mapped.includes('please');
  const hasSorry = mapped.includes('sorry');
  const hasThankYou = mapped.includes('thank you');

  const prefix = hasPlease ? 'Please, ' : '';

  if (hasI && hasLove && hasYou) return 'I love you.';
  if (hasI && hasWater && hasWant) return `${prefix ? 'Please, I' : 'I'} want water.`;
  if (hasI && hasFood && hasWant) return `${prefix ? 'Please, I' : 'I'} want food.`;
  if (hasI && hasHome && hasWant) return `${prefix ? 'Please, I' : 'I'} want to go home.`;
  if (hasDoctor && hasPain) return `${prefix ? 'Please, I' : 'I'} am in pain and need a doctor.`;
  if (hasHospital && hasPain) return `${prefix ? 'Please, I' : 'I'} am in pain and need to go to the hospital.`;
  if (hasHelp && hasDoctor) return 'Please help me, I need a doctor.';
  if (hasHelp && hasWater) return `${prefix ? 'Please ' : ''}help me get some water.`;
  if (hasI && hasHungry && hasFood) return 'I am hungry and would like some food.';
  if (hasI && hasThirsty && hasWater) return 'I am thirsty and would like some water.';
  if (hasI && hasHungry) return 'I am hungry.';
  if (hasI && hasThirsty) return 'I am thirsty.';
  if (hasI && hasPain) return 'I am in pain.';
  if (hasI && hasBathroom) return `${prefix ? 'Please, where' : 'Where'} is the bathroom?`;
  if (hasBathroom) return `${prefix ? 'Please, where' : 'Where'} is the bathroom?`;
  if (hasThankYou && hasHelp) return 'Thank you for your help.';
  if (hasSorry && joined.includes('no')) return 'I am sorry, no.';

  // Generic S-O-V to S-V-O reordering for simple 3-word phrases ending in "want"
  if (mapped.length === 3 && mapped[2] === 'want') {
    const subj = mapped[0] === 'I' ? 'I' : mapped[0];
    const obj = mapped[1];
    const sentence = `${subj} want ${obj}.`;
    return sentence.charAt(0).toUpperCase() + sentence.slice(1);
  }

  const clean = mapped
    .map((w, idx) => (idx === 0 && w !== 'I' ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(' ');
  return clean.endsWith('.') || clean.endsWith('?') || clean.endsWith('!') ? clean : `${clean}.`;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  // Serve public assets (including local MediaPipe WASM and model files)
  app.use(express.static(path.join(__dirname, 'public')));

  app.get('/api/health', (_req, res) => {
    const ai = createGeminiClient();
    res.json({
      ok: true,
      geminiConfigured: Boolean(ai),
    });
  });

  app.post('/api/generate-sentence', async (req, res) => {
    const { words, context } = req.body as { words?: unknown; context?: unknown };

    if (!Array.isArray(words) || words.length === 0) {
      return res.status(400).json({ error: 'Please provide at least one recognized sign word.' });
    }

    const cleanedWords = words
      .map((w) => (typeof w === 'string' ? w.trim() : ''))
      .filter(Boolean)
      .slice(0, 30);

    if (cleanedWords.length === 0) {
      return res.status(400).json({ error: 'No valid words were provided.' });
    }

    const ai = createGeminiClient();
    if (!ai) {
      return res.json({
        sentence: buildRuleBasedSentence(cleanedWords),
        source: 'rule-based',
        note: 'Using local rule-based grammar formatter (Gemini API key not configured).',
      });
    }

    try {
      const prompt = [
        `Convert the following ordered sequence of recognized sign language gloss words into one natural, grammatically correct English sentence.`,
        `Preserve the exact meaning and intent without inventing extra facts.`,
        `Examples:`,
        `- ["ME", "WATER", "WANT"] -> "I want water."`,
        `- ["I", "HUNGRY", "FOOD", "PLEASE"] -> "I am hungry, may I please have some food?"`,
        `- ["HELP", "PAIN", "DOCTOR"] -> "Please help, I am in pain and need a doctor."`,
        `Sign gloss sequence: ${JSON.stringify(cleanedWords)}`,
        typeof context === 'string' && context.trim() ? `Additional context: ${context.trim()}` : '',
      ]
        .filter(Boolean)
        .join('\n');

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction:
            'You are an assistive sign-language-to-English sentence formatter. Return concise, natural, empathetic, grammatically accurate spoken English sentences suitable for text-to-speech output.',
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              sentence: {
                type: Type.STRING,
                description: 'The complete, natural, grammatically correct English sentence.',
              },
            },
            required: ['sentence'],
          },
        },
      });

      const rawText = response.text?.trim() || '{}';
      const parsed = JSON.parse(rawText) as { sentence?: string };
      const sentence = parsed.sentence?.trim() || buildRuleBasedSentence(cleanedWords);

      return res.json({
        sentence,
        source: 'gemini',
      });
    } catch (error) {
      console.error('Gemini sentence generation error:', error);
      const fallbackSentence = buildRuleBasedSentence(cleanedWords);
      return res.json({
        sentence: fallbackSentence,
        source: 'rule-based',
        note: 'AI service unavailable; formatted using local grammar rules.',
      });
    }
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SignBridge server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start SignBridge server:', err);
  process.exit(1);
});
