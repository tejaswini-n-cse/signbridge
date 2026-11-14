export interface SpeechVoiceOption {
  voiceURI: string;
  name: string;
  lang: string;
}

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

export function getAvailableVoices(): SpeechVoiceOption[] {
  if (!isSpeechSynthesisSupported()) return [];
  const voices = window.speechSynthesis.getVoices();
  const english = voices.filter((v) => v.lang.toLowerCase().startsWith('en'));
  const list = english.length > 0 ? english : voices;
  return list.map((v) => ({
    voiceURI: v.voiceURI,
    name: v.name,
    lang: v.lang,
  }));
}

export function speakText(
  text: string,
  options: {
    voiceURI?: string;
    rate?: number;
    pitch?: number;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (message: string) => void;
  } = {}
): void {
  if (!isSpeechSynthesisSupported()) {
    options.onError?.('Text-to-speech is not supported in this browser.');
    return;
  }

  const trimmed = text.trim();
  if (!trimmed) {
    options.onError?.('There is no sentence text to speak.');
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(trimmed);
  utterance.rate = options.rate ?? 1;
  utterance.pitch = options.pitch ?? 1;

  if (options.voiceURI) {
    const match = window.speechSynthesis.getVoices().find((v) => v.voiceURI === options.voiceURI);
    if (match) utterance.voice = match;
  }

  utterance.onstart = () => options.onStart?.();
  utterance.onend = () => options.onEnd?.();
  utterance.onerror = (event) => {
    if (event.error === 'interrupted' || event.error === 'canceled') {
      options.onEnd?.();
      return;
    }
    options.onError?.(`Speech output error: ${event.error}`);
  };

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
}
