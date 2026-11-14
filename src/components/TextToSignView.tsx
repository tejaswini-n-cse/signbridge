import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  MessageSquareText,
  Play,
  Search,
  Square,
  Trash2,
} from 'lucide-react';
import {
  SIGN_VOCABULARY,
  findVocabularyMatch,
  type SignCategory,
  type SignVocabularyItem,
} from '../data/vocabulary';
import { SignIllustration } from './SignIllustration';

const QUICK_REPLIES = [
  'Hello, how can I help you?',
  'Do you want water or food?',
  'Are you in pain? Let me call a doctor.',
  'Yes, the bathroom is right here.',
  'Thank you, please wait one moment.',
];

const CATEGORIES: Array<'All' | SignCategory> = [
  'All',
  'Greetings',
  'Responses',
  'Daily Needs',
  'Medical & Emergency',
  'People & Actions',
];

interface ParsedToken {
  raw: string;
  normalized: string;
  match: SignVocabularyItem | null;
}

export const TextToSignView: React.FC = () => {
  const [typedMessage, setTypedMessage] = useState('Hello, I want water please.');
  const [activeCategory, setActiveCategory] = useState<'All' | SignCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sequenceIndex, setSequenceIndex] = useState<number | null>(null);

  const tokens = useMemo<ParsedToken[]>(() => {
    const rawParts = typedMessage
      .split(/\s+/)
      .map((t) => t.trim())
      .filter(Boolean);

    const parsed: ParsedToken[] = [];
    for (let i = 0; i < rawParts.length; i++) {
      const current = rawParts[i];
      const next = rawParts[i + 1];
      const cleanCurrent = current.toLowerCase().replace(/[^a-z]/g, '');
      const cleanNext = next ? next.toLowerCase().replace(/[^a-z]/g, '') : '';

      // Handle 2-word sign "Thank you"
      if (cleanCurrent === 'thank' && cleanNext === 'you') {
        const match = findVocabularyMatch('thank you') || null;
        parsed.push({
          raw: `${current} ${next}`,
          normalized: 'thank you',
          match,
        });
        i += 1;
        continue;
      }

      const match = findVocabularyMatch(cleanCurrent) || null;
      parsed.push({
        raw: current,
        normalized: cleanCurrent,
        match,
      });
    }
    return parsed;
  }, [typedMessage]);

  const supportedCount = tokens.filter((t) => t.match !== null).length;
  const unsupportedCount = tokens.length - supportedCount;

  // Step-through playback across tokens
  useEffect(() => {
    if (sequenceIndex === null) return;
    if (sequenceIndex >= tokens.length) {
      setSequenceIndex(null);
      return;
    }

    const timer = window.setTimeout(() => {
      setSequenceIndex((prev) => (prev === null ? null : prev + 1));
    }, 1100);

    return () => window.clearTimeout(timer);
  }, [sequenceIndex, tokens.length]);

  const filteredVocabulary = useMemo(() => {
    return SIGN_VOCABULARY.filter((item) => {
      const catMatch = activeCategory === 'All' || item.category === activeCategory;
      const q = searchQuery.trim().toLowerCase();
      const queryMatch =
        !q ||
        item.word.toLowerCase().includes(q) ||
        item.aliases.some((a) => a.includes(q)) ||
        item.handshapeName.toLowerCase().includes(q);
      return catMatch && queryMatch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="space-y-10 pb-12">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
          Text-to-Sign Partner Communication
        </h1>
        <p className="text-sm text-slate-600 mt-1 max-w-2xl">
          Type a response for a non-speaking or deaf conversation partner. Your message displays in high-contrast text alongside visual sign illustrations for supported words.
        </p>
      </div>

      {/* Input & Large Display Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Text Composer */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="partner-reply-input"
                className="font-display text-sm font-bold text-slate-900 flex items-center gap-2"
              >
                <MessageSquareText className="w-4 h-4 text-blue-600" />
                Type Your Message
              </label>
              <button
                type="button"
                onClick={() => {
                  setTypedMessage('');
                  setSequenceIndex(null);
                }}
                disabled={!typedMessage}
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-red-600 disabled:opacity-40 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>
            </div>

            <textarea
              id="partner-reply-input"
              rows={4}
              value={typedMessage}
              onChange={(e) => {
                setTypedMessage(e.target.value);
                setSequenceIndex(null);
              }}
              placeholder="Type a clear sentence here..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
            />

            <div className="space-y-2 pt-1">
              <p className="text-xs font-medium text-slate-600">Quick conversation replies:</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_REPLIES.map((phrase) => (
                  <button
                    key={phrase}
                    type="button"
                    onClick={() => {
                      setTypedMessage(phrase);
                      setSequenceIndex(null);
                    }}
                    className="text-left px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 text-xs text-slate-700 transition-colors cursor-pointer"
                  >
                    {phrase}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-3 tabular-nums">
              <span className="text-blue-700 font-medium">{supportedCount} supported signs</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-500">{unsupportedCount} text-only words</span>
            </div>

            {tokens.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  setSequenceIndex((prev) => (prev === null ? 0 : null))
                }
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-violet-600 text-white font-medium hover:bg-violet-700 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                {sequenceIndex === null ? (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Step Through Signs
                  </>
                ) : (
                  <>
                    <Square className="w-3.5 h-3.5 fill-current" />
                    Stop Playback
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Right: High-Contrast Display for Reading */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50/70 via-white to-violet-50/70 p-6 sm:p-8 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-4 border-b border-slate-200/70">
            <span className="font-medium text-slate-700">Large Message Display</span>
            <span>Readable across table</span>
          </div>

          <div className="py-8">
            {typedMessage.trim() ? (
              <p className="font-display text-2xl sm:text-4xl font-bold text-slate-900 leading-snug break-words">
                {typedMessage}
              </p>
            ) : (
              <p className="text-base text-slate-400 italic">
                Type a message on the left to display it clearly here.
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-slate-200/70 flex flex-wrap items-center gap-4 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              Supported words display a sign diagram below
            </span>
            <span className="inline-flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              Unsupported words are explicitly labeled
            </span>
          </div>
        </div>
      </div>

      {/* Word-by-Word Visual Sign Breakdown */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900">
              Visual Sign Reference Breakdown
            </h2>
            <p className="text-sm text-slate-600 mt-0.5">
              Supported vocabulary words show their corresponding hand posture; unsupported words remain clearly flagged as text-only.
            </p>
          </div>
        </div>

        {tokens.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            Enter a sentence above to see its word-by-word sign language reference.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {tokens.map((tok, idx) => {
              const isHighlighted = sequenceIndex === idx;
              if (tok.match) {
                return (
                  <div
                    key={`${tok.raw}-${idx}`}
                    className={`rounded-2xl border p-4 bg-white transition-all flex flex-col justify-between space-y-3 ${
                      isHighlighted
                        ? 'border-violet-600 ring-2 ring-violet-500/30'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs text-slate-500 font-mono">
                          Word {idx + 1} · Supported
                        </p>
                        <h3 className="font-display text-lg font-bold text-slate-900 mt-0.5">
                          {tok.match.word}
                        </h3>
                        <p className="text-xs text-blue-700 font-medium">
                          {tok.match.handshapeName}
                        </p>
                      </div>
                      <SignIllustration
                        illustrationKey={tok.match.illustrationKey}
                        className="w-16 h-16 shrink-0"
                      />
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-2.5">
                      {tok.match.gestureDescription}
                    </p>
                  </div>
                );
              }

              return (
                <div
                  key={`${tok.raw}-${idx}`}
                  className={`rounded-2xl border border-dashed p-4 bg-slate-50/70 transition-all flex flex-col justify-between space-y-3 ${
                    isHighlighted
                      ? 'border-amber-500 ring-2 ring-amber-400/30'
                      : 'border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs text-slate-500 font-mono">
                        Word {idx + 1} · Unsupported
                      </p>
                      <h3 className="font-display text-lg font-semibold text-slate-800 mt-0.5">
                        "{tok.raw}"
                      </h3>
                    </div>
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  </div>
                  <p className="text-xs text-slate-600 border-t border-slate-200/70 pt-2.5">
                    Not in the 21-sign core vocabulary. Display as text or fingerspell.
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Complete 21-Sign Learning Directory */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900">
              Sign Language Reference Guide ({SIGN_VOCABULARY.length} Words)
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Browse step-by-step instructions for every sign supported by SignBridge.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search signs…"
                aria-label="Search sign vocabulary"
                className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 w-full sm:w-44"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    activeCategory === cat
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredVocabulary.length === 0 ? (
          <p className="text-sm text-slate-500 py-6 text-center">
            No signs matched "{searchQuery}".
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVocabulary.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-slate-200 p-4 flex items-start gap-4 bg-slate-50/40"
              >
                <SignIllustration
                  illustrationKey={item.illustrationKey}
                  className="w-16 h-16 shrink-0"
                />
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span className="font-medium text-blue-700">{item.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="truncate">{item.handshapeName}</span>
                  </div>
                  <h3 className="font-display text-base font-bold text-slate-900">{item.word}</h3>
                  <ul className="text-xs text-slate-600 space-y-0.5 list-disc pl-4">
                    {item.stepByStep.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
