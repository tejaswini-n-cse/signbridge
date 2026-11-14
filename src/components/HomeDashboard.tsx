import React, { useState } from 'react';
import {
  ArrowRight,
  Camera,
  MessageSquareText,
  Sparkles,
  Volume2,
  Hand,
} from 'lucide-react';
import { SIGN_VOCABULARY } from '../data/vocabulary';
import { SignIllustration } from './SignIllustration';

export type AppView = 'home' | 'translator' | 'text-comm' | 'about';

interface HomeDashboardProps {
  onNavigate: (view: AppView) => void;
  onQuickDemoWord?: (word: string) => void;
}

const HERO_IMAGE_SRC = '/src/assets/images/hero_sign_communication_1794660300792.jpg';

const PIPELINE_STEPS = [
  { num: '01', title: 'Hand Gestures', desc: 'Perform signs in front of a standard webcam.' },
  { num: '02', title: 'Sign Recognition', desc: 'MediaPipe extracts 21 3D hand landmarks per frame.' },
  { num: '03', title: 'Word Formation', desc: 'Detected signs accumulate in an editable word buffer.' },
  { num: '04', title: 'Sentence Generation', desc: 'AI grammar synthesis forms complete English sentences.' },
  { num: '05', title: 'Text Display', desc: 'Clear, high-contrast sentences appear for reading.' },
  { num: '06', title: 'Voice Output', desc: 'Natural browser speech synthesis speaks aloud.' },
];

export const HomeDashboard: React.FC<HomeDashboardProps> = ({ onNavigate, onQuickDemoWord }) => {
  const [heroImgFailed, setHeroImgFailed] = useState(false);

  return (
    <div className="space-y-16 pb-12">
      {/* Split Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch pt-4">
        <div className="lg:col-span-6 flex flex-col justify-between py-2 space-y-8">
          <div className="space-y-5">
            <p className="text-sm font-medium text-blue-600 tracking-tight">
              SignBridge · AI-Powered Sign Language Translator
            </p>
            <h1 className="font-display text-[clamp(2.25rem,3.8vw,3.35rem)] font-bold tracking-tight text-slate-900 leading-[1.1] text-balance">
              Breaking communication barriers through real-time sign translation.
            </h1>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
              Perform hand gestures in front of your webcam, assemble recognized signs into grammatically complete sentences, and speak them aloud—with two-way visual text replies for your conversation partner.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => onNavigate('translator')}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 active:scale-[0.99] transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              Start Communication
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('text-comm')}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium text-sm hover:border-violet-300 hover:bg-violet-50/50 hover:text-violet-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <MessageSquareText className="w-4 h-4 text-violet-600" />
              Partner Text-to-Sign
            </button>
          </div>

          <div className="pt-4 border-t border-slate-200 grid grid-cols-3 gap-6 max-w-lg">
            <div>
              <p className="font-display text-2xl font-bold text-slate-900 tabular-nums">21</p>
              <p className="text-xs text-slate-500 mt-0.5">Core everyday & medical signs</p>
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-slate-900 tabular-nums">21-Pt</p>
              <p className="text-xs text-slate-500 mt-0.5">MediaPipe 3D hand tracking</p>
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-slate-900">2-Way</p>
              <p className="text-xs text-slate-500 mt-0.5">Sign-to-speech & text-to-sign</p>
            </div>
          </div>
        </div>

        {/* Hero Visual Anchor */}
        <div className="lg:col-span-6 flex">
          <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 min-h-[300px] lg:min-h-[420px]">
            {!heroImgFailed ? (
              <img
                src={HERO_IMAGE_SRC}
                alt="Two people communicating naturally in a sunlit room using sign language"
                referrerPolicy="no-referrer"
                onError={() => setHeroImgFailed(true)}
                className="w-full h-full object-cover lg:h-full"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 via-white to-violet-50 text-center">
                <Hand className="w-12 h-12 text-blue-600 mb-3" />
                <p className="font-display font-semibold text-slate-800">SignBridge Real-Time Conversation</p>
                <p className="text-sm text-slate-500 mt-1">Webcam Hand Tracking · AI Grammar · Voice Output</p>
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 via-slate-950/35 to-transparent p-6">
              <p className="text-xs font-medium text-blue-200">
                Real-Time Assistive Flow
              </p>
              <p className="text-sm sm:text-base font-medium text-white mt-1">
                From hand landmarks to spoken English sentences in seconds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* End-to-End Communication Flow */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
              How SignBridge Works
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Six modular stages transform visual hand movements into clear spoken dialogue.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('about')}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline whitespace-nowrap shrink-0 cursor-pointer self-start sm:self-auto"
          >
            Read technical architecture →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 pt-6">
          {PIPELINE_STEPS.map((step) => (
            <div key={step.num} className="space-y-2">
              <span className="font-mono text-xs font-semibold text-violet-600 tabular-nums">
                {step.num}
              </span>
              <h3 className="font-display text-sm font-semibold text-slate-900">{step.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Core Capabilities — Asymmetric Bento Layout */}
      <section className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">Core System Capabilities</h2>
          <p className="text-sm text-slate-600 mt-1">
            Built for live classroom, clinical, and everyday two-way conversations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Primary Wide Card: Gesture Recognition */}
          <div className="lg:col-span-6 rounded-2xl border border-slate-200 bg-white p-7 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <Hand className="w-5 h-5" />
              </div>
              <h3 className="font-display text-xl font-bold text-slate-900">
                01. Gesture Recognition
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Uses MediaPipe HandLandmarker directly in the browser to extract 21 anatomical 3D hand coordinates in real time. A separated geometric handshape classifier evaluates finger extensions and pinches with transparent confidence scores and manual word correction.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Live Webcam + Guided Demo Mode</span>
              <button
                type="button"
                onClick={() => onNavigate('translator')}
                className="font-medium text-blue-600 hover:underline whitespace-nowrap shrink-0 cursor-pointer"
              >
                Open Live Translator →
              </button>
            </div>
          </div>

          {/* Secondary Card: Sentence Generation */}
          <div className="lg:col-span-3 rounded-2xl border border-slate-200 bg-gradient-to-b from-violet-50/60 to-white p-7 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-violet-100/80 border border-violet-200/70 flex items-center justify-center text-violet-700">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-display text-lg font-bold text-slate-900">
                02. Sentence Generation
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Converts sign gloss buffers such as <span className="font-mono text-xs text-slate-800">ME + WATER + WANT</span> into natural English (<span className="italic text-slate-800">"I want water."</span>) using Gemini AI with deterministic rule-based fallback.
              </p>
            </div>
            <p className="text-xs text-slate-500 pt-4 border-t border-slate-100">
              Editable word buffer · Undo & clear controls
            </p>
          </div>

          {/* Secondary Card: Voice Output */}
          <div className="lg:col-span-3 rounded-2xl border border-slate-200 bg-gradient-to-b from-blue-50/60 to-white p-7 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100/80 border border-blue-200/70 flex items-center justify-center text-blue-700">
                <Volume2 className="w-5 h-5" />
              </div>
              <h3 className="font-display text-lg font-bold text-slate-900">
                03. Voice Output
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Speaks finalized sentences aloud using the browser Web Speech API with selectable system voices and adjustable speaking speed from 0.6× to 1.5×.
              </p>
            </div>
            <p className="text-xs text-slate-500 pt-4 border-t border-slate-100">
              Instant local audio · Zero latency
            </p>
          </div>
        </div>
      </section>

      {/* Core 21-Sign Vocabulary Preview */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900">
              Supported Core Sign Vocabulary ({SIGN_VOCABULARY.length} Signs)
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Click any sign to load it directly into the Live Translator or browse full instructions in Text Communication.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('text-comm')}
            className="text-sm font-medium text-violet-700 hover:text-violet-800 hover:underline whitespace-nowrap shrink-0 cursor-pointer"
          >
            View all sign illustrations →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
          {SIGN_VOCABULARY.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onQuickDemoWord?.(item.word);
                onNavigate('translator');
              }}
              className="group text-left p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-blue-50/60 hover:border-blue-300 transition-colors flex flex-col items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer"
            >
              <SignIllustration illustrationKey={item.illustrationKey} className="w-12 h-12" />
              <div className="text-center w-full">
                <p className="text-xs font-semibold text-slate-900 truncate">{item.word}</p>
                <p className="text-[11px] text-slate-500 truncate">{item.category}</p>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
