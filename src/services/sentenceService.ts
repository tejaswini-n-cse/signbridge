export interface SentenceGenerationResult {
  sentence: string;
  source: 'gemini' | 'rule-based';
  note?: string;
}

export async function generateNaturalSentence(
  words: string[],
  context?: string
): Promise<SentenceGenerationResult> {
  if (words.length === 0) {
    throw new Error('Add at least one sign word before generating a sentence.');
  }

  const response = await fetch('/api/generate-sentence', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ words, context }),
  });

  if (!response.ok) {
    let errorMessage = 'Failed to generate sentence.';
    try {
      const payload = (await response.json()) as { error?: string };
      if (payload.error) errorMessage = payload.error;
    } catch {
      // Ignore JSON parse errors on error payloads
    }
    throw new Error(errorMessage);
  }

  return (await response.json()) as SentenceGenerationResult;
}

export async function checkBackendHealth(): Promise<{ ok: boolean; geminiConfigured: boolean }> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) return { ok: false, geminiConfigured: false };
    return (await res.json()) as { ok: boolean; geminiConfigured: boolean };
  } catch {
    return { ok: false, geminiConfigured: false };
  }
}
