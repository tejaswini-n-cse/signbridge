import React, { useState } from 'react';
import { ArrowRight, Cpu, Eye, Layers, Mic, ShieldCheck } from 'lucide-react';
import type { AppView } from './HomeDashboard';

interface AboutProjectProps {
  onNavigate: (view: AppView) => void;
}

const ABOUT_IMAGE_SRC = '/src/assets/images/about_assistive_tech_1794660301299.jpg';

const TECH_STACK = [
  {
    name: 'React 19 + TypeScript + Vite',
    role: 'Modular component architecture with strict static typing and low-latency state updates.',
  },
  {
    name: 'MediaPipe Tasks Vision (HandLandmarker)',
    role: 'On-device 21-point 3D hand landmark extraction running on WebAssembly / WebGL.',
  },
  {
    name: 'Geometric SignClassifierAdapter',
    role: 'Decoupled handshape classifier analyzing finger extensions, pinch distances, and orientation.',
  },
  {
    name: 'Express + Gemini API (gemini-4-hydrogen)',
    role: 'Server-side AI grammar engine transforming sign gloss buffers into fluent English sentences.',
  },
  {
    name: 'Web Speech API (SpeechSynthesis)',
    role: 'Zero-latency browser text-to-speech with selectable voices and speech-rate control.',
  },
  {
    name: 'Tailwind CSS v4 + Lucide Icons',
    role: 'Accessible, responsive blue-white-lavender interface designed for clinical and everyday readability.',
  },
];

export const AboutProject: React.FC<AboutProjectProps> = ({ onNavigate }) => {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div className="space-y-12 pb-12">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 space-y-2">
        <p className="text-xs font-medium text-blue-600">
          Computer Science Engineering Capstone Architecture
        </p>
        <h1 className="font-display text-2xl sm:text-4xl font-bold text-slate-900 text-balance max-w-3xl">
          SignBridge – Breaking Communication Barriers Through AI-Powered Sign Language Translation
        </h1>
      </div>

      {/* Problem & Proposed Solution Split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 space-y-3">
            <h2 className="font-display text-xl font-bold text-slate-900">
              01. Problem Statement
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Millions of deaf, hard-of-hearing, and non-speaking individuals rely on sign language as their primary medium of expression. However, most hearing people—including doctors, receptionists, teachers, and emergency responders—do not understand sign language. This creates critical friction during healthcare visits, daily errands, and workplace collaboration, often forcing people to rely on slow written notes or wait for human interpreters.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50/50 via-white to-violet-50/50 p-6 sm:p-7 space-y-3">
            <h2 className="font-display text-xl font-bold text-slate-900">
              02. Proposed Solution
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              SignBridge bridges this gap using only a standard browser and webcam. A signer performs gestures in front of the camera; MediaPipe extracts 21 3D hand landmarks per frame, maps postures into vocabulary words, collects them into an editable word buffer, uses an AI language model to synthesize natural English grammar (e.g., <span className="font-mono text-xs text-slate-800">ME + WATER + WANT</span> → <span className="italic text-slate-800">"I want water."</span>), and speaks the sentence aloud. Meanwhile, the hearing partner can type replies back in large readable text paired with visual sign diagrams.
            </p>
          </div>
        </div>

        <div className="lg:col-span-5 flex">
          <div className="w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 min-h-[280px]">
            {!imgFailed ? (
              <img
                src={ABOUT_IMAGE_SRC}
                alt="Accessible laptop workstation displaying soft blue and violet gradient light"
                referrerPolicy="no-referrer"
                onError={() => setImgFailed(true)}
                className="w-full h-full object-cover lg:h-full"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-violet-50 text-center">
                <Cpu className="w-10 h-10 text-blue-600 mb-2" />
                <p className="font-display font-semibold text-slate-800">
                  Browser-Native Assistive Computing
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How the System Works */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-900">
            03. How the System Works
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Separation of concerns ensures computer vision, grammar synthesis, and audio rendering operate independently.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5">
            <Eye className="w-5 h-5 text-blue-600" />
            <h3 className="font-display text-sm font-bold text-slate-900">
              1. Landmark Extraction
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              <span className="font-mono text-[11px] text-slate-800">handDetector.ts</span> captures video frames and computes 21 normalized (x, y, z) landmarks via MediaPipe WASM/GPU delegates.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5">
            <Layers className="w-5 h-5 text-violet-600" />
            <h3 className="font-display text-sm font-bold text-slate-900">
              2. Modular Classification
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              <span className="font-mono text-[11px] text-slate-800">gestureClassifier.ts</span> evaluates anatomical finger extensions and pinches behind a swappable <span className="font-mono text-[11px] text-slate-800">SignClassifierAdapter</span> interface.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5">
            <Cpu className="w-5 h-5 text-blue-600" />
            <h3 className="font-display text-sm font-bold text-slate-900">
              3. AI Sentence Formation
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              An Express endpoint calls Gemini (<span className="font-mono text-[11px] text-slate-800">gemini-4-hydrogen</span>) to convert sign gloss tokens into fluent English, with deterministic rule-based fallback.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5">
            <Mic className="w-5 h-5 text-violet-600" />
            <h3 className="font-display text-sm font-bold text-slate-900">
              4. Speech & Reverse Sign
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              <span className="font-mono text-[11px] text-slate-800">speechService.ts</span> synthesizes voice audio locally while the partner view maps typed replies back into SVG sign illustrations.
            </p>
          </div>
        </div>
      </section>

      {/* Technologies & Honest Prototype Scope */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 space-y-4">
          <h2 className="font-display text-xl font-bold text-slate-900">
            04. Technologies Used
          </h2>
          <div className="divide-y divide-slate-100">
            {TECH_STACK.map((tech) => (
              <div key={tech.name} className="py-3 first:pt-0 last:pb-0">
                <p className="text-sm font-semibold text-slate-900">{tech.name}</p>
                <p className="text-xs text-slate-600 mt-0.5">{tech.role}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-blue-700">
              <ShieldCheck className="w-5 h-5" />
              <h2 className="font-display text-xl font-bold text-slate-900">
                Prototype Transparency & Future Scope
              </h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              This prototype intentionally avoids fabricated predictions or false claims of a trained deep-learning ASL model. Live webcam mode executes real geometric handshape classification on 21 MediaPipe landmarks for static signs, while dynamic multi-frame signs are demonstrated in Guided Demo Mode.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Future work can drop a trained TensorFlow.js / ONNX temporal sequence model (LSTM or Transformer trained on WLASL/MS-ASL landmark sequences) directly into <span className="font-mono text-xs text-slate-800">SignClassifierAdapter</span> without altering UI components.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('translator')}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            Launch Live Translator
            <ArrowRight className="w-4 h-4" />
          </button>
        </section>
      </div>
    </div>
  );
};
