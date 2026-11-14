import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Camera,
  CameraOff,
  CheckCircle2,
  FlipHorizontal2,
  Hand,
  Loader2,
  Plus,
  RotateCcw,
  Sparkles,
  Square,
  Trash2,
  Undo2,
  Volume2,
  Wand2,
} from 'lucide-react';
import { SIGN_VOCABULARY } from '../data/vocabulary';
import { MediaPipeHandDetector, drawHandSkeleton } from '../services/signRecognition/handDetector';
import { defaultGeometricClassifier } from '../services/signRecognition/gestureClassifier';
import type {
  FingerExtensionState,
  HandednessLabel,
  RecognitionPrediction,
} from '../services/signRecognition/types';
import { generateNaturalSentence } from '../services/sentenceService';
import {
  getAvailableVoices,
  isSpeechSynthesisSupported,
  speakText,
  stopSpeaking,
  type SpeechVoiceOption,
} from '../services/speechService';
import { SignIllustration } from './SignIllustration';

type RecognitionMode = 'live-camera' | 'guided-demo';

interface LiveTranslatorProps {
  initialDemoWord?: string | null;
  onConsumeInitialDemoWord?: () => void;
}

const HOLD_TO_ADD_MS = 1200;

export const LiveTranslator: React.FC<LiveTranslatorProps> = ({
  initialDemoWord,
  onConsumeInitialDemoWord,
}) => {
  const [mode, setMode] = useState<RecognitionMode>(initialDemoWord ? 'guided-demo' : 'live-camera');

  // Camera & MediaPipe state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<MediaPipeHandDetector | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastVideoTimeRef = useRef<number>(-1);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [mirrored, setMirrored] = useState(true);

  // Detection telemetry state
  const [handDetected, setHandDetected] = useState(false);
  const [handCount, setHandCount] = useState(0);
  const [handedness, setHandedness] = useState<HandednessLabel>('Unknown');
  const [fingerState, setFingerState] = useState<FingerExtensionState | null>(null);
  const [livePrediction, setLivePrediction] = useState<RecognitionPrediction | null>(null);
  const [inferenceMs, setInferenceMs] = useState<number>(0);

  // Hold-to-add state
  const [autoHoldEnabled, setAutoHoldEnabled] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdWordRef = useRef<string | null>(null);
  const holdStartRef = useRef<number>(0);
  const lastAutoAddedAtRef = useRef<number>(0);

  // Guided demo selection
  const [selectedDemoWord, setSelectedDemoWord] = useState<string>(initialDemoWord || 'Hello');
  const [manualCorrectionWord, setManualCorrectionWord] = useState<string>('');

  // Word buffer & Sentence formation
  const [wordBuffer, setWordBuffer] = useState<string[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [generatedSentence, setGeneratedSentence] = useState<string>('');
  const [sentenceSource, setSentenceSource] = useState<'gemini' | 'rule-based' | null>(null);
  const [sentenceNote, setSentenceNote] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sentenceError, setSentenceError] = useState<string | null>(null);

  // Speech synthesis state
  const [voices, setVoices] = useState<SpeechVoiceOption[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [spokenHistory, setSpokenHistory] = useState<string[]>([]);

  useEffect(() => {
    if (initialDemoWord) {
      setMode('guided-demo');
      setSelectedDemoWord(initialDemoWord);
      setManualCorrectionWord(initialDemoWord);
      onConsumeInitialDemoWord?.();
    }
  }, [initialDemoWord, onConsumeInitialDemoWord]);

  // Load voices for Web Speech API
  useEffect(() => {
    if (!isSpeechSynthesisSupported()) return;

    const refreshVoices = () => {
      const list = getAvailableVoices();
      setVoices(list);
      if (list.length > 0 && !selectedVoiceURI) {
        setSelectedVoiceURI(list[0].voiceURI);
      }
    };

    refreshVoices();
    window.speechSynthesis.addEventListener('voiceschanged', refreshVoices);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', refreshVoices);
      stopSpeaking();
    };
  }, [selectedVoiceURI]);

  const stopCamera = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    setCameraActive(false);
    setCameraLoading(false);
    setHandDetected(false);
    setHandCount(0);
    setFingerState(null);
    setLivePrediction(null);
    setHoldProgress(0);
    holdWordRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
      detectorRef.current?.dispose();
    };
  }, [stopCamera]);

  const addWordToBuffer = useCallback((word: string) => {
    const clean = word.trim();
    if (!clean) return;
    setWordBuffer((prev) => [...prev, clean]);
    setSentenceError(null);
  }, []);

  // Main real-time detection loop
  useEffect(() => {
    if (!cameraActive || mode !== 'live-camera') return;

    let cancelled = false;

    const runDetectionLoop = () => {
      if (cancelled) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const detector = detectorRef.current;

      if (
        video &&
        canvas &&
        detector &&
        detector.isReady() &&
        video.readyState >= 2 &&
        video.videoWidth > 0 &&
        video.videoHeight > 0
      ) {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        if (video.currentTime !== lastVideoTimeRef.current) {
          lastVideoTimeRef.current = video.currentTime;
          const now = performance.now();
          const output = detector.detectFrame(video, now);

          setInferenceMs(output.inferenceTimeMs);
          const ctx = canvas.getContext('2d');
          if (ctx) {
            drawHandSkeleton(ctx, output.landmarks, canvas.width, canvas.height, mirrored);
          }

          if (output.landmarks.length > 0) {
            const primaryLandmarks = output.landmarks[0];
            const primaryHandedness = output.handedness[0] || 'Unknown';
            const classification = defaultGeometricClassifier.classifyLandmarks(
              primaryLandmarks,
              primaryHandedness
            );

            setHandDetected(true);
            setHandCount(output.landmarks.length);
            setHandedness(primaryHandedness);
            setFingerState(classification.fingerState);
            setLivePrediction(classification.prediction);

            if (classification.prediction) {
              setManualCorrectionWord(classification.prediction.word);
            }

            // Optional auto-hold capture
            if (autoHoldEnabled && classification.prediction) {
              const predictedWord = classification.prediction.word;
              if (holdWordRef.current !== predictedWord) {
                holdWordRef.current = predictedWord;
                holdStartRef.current = now;
                setHoldProgress(0);
              } else {
                const elapsed = now - holdStartRef.current;
                const progress = Math.min(1, elapsed / HOLD_TO_ADD_MS);
                setHoldProgress(progress);

                if (progress >= 1 && now - lastAutoAddedAtRef.current > 1500) {
                  lastAutoAddedAtRef.current = now;
                  holdStartRef.current = now;
                  setHoldProgress(0);
                  addWordToBuffer(predictedWord);
                }
              }
            } else {
              holdWordRef.current = null;
              setHoldProgress(0);
            }
          } else {
            setHandDetected(false);
            setHandCount(0);
            setHandedness('Unknown');
            setFingerState(null);
            setLivePrediction(null);
            holdWordRef.current = null;
            setHoldProgress(0);
          }
        }
      }

      rafRef.current = requestAnimationFrame(runDetectionLoop);
    };

    rafRef.current = requestAnimationFrame(runDetectionLoop);
    return () => {
      cancelled = true;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [cameraActive, mode, mirrored, autoHoldEnabled, addWordToBuffer]);

  const startCamera = async () => {
    setCameraError(null);
    setCameraLoading(true);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraLoading(false);
      setCameraError(
        'Webcam access is unavailable in this browser context. Ensure you are using HTTPS or localhost, or switch to Guided Demo Mode.'
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraActive(true);
      setCameraLoading(false);

      // Initialize MediaPipe HandLandmarker
      if (!detectorRef.current) {
        detectorRef.current = new MediaPipeHandDetector();
      }
      if (!detectorRef.current.isReady()) {
        setModelLoading(true);
        try {
          await detectorRef.current.initialize();
        } catch (modelErr) {
          setCameraError(
            `Hand landmark model could not load: ${
              modelErr instanceof Error ? modelErr.message : 'Unknown error'
            }`
          );
        } finally {
          setModelLoading(false);
        }
      }
    } catch (err) {
      setCameraLoading(false);
      stopCamera();

      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setCameraError(
            'Camera permission was denied. Please allow camera access in your browser site settings, then click Start Camera again—or use Guided Demo Mode.'
          );
          return;
        }
        if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setCameraError(
            'No webcam device was detected on this system. Connect a camera or use Guided Demo Mode to test the full translation pipeline.'
          );
          return;
        }
        if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          setCameraError(
            'Your webcam is currently in use by another application. Close other video apps and retry.'
          );
          return;
        }
      }

      setCameraError(
        `Unable to start camera: ${err instanceof Error ? err.message : 'Unexpected device error.'}`
      );
    }
  };

  const activeWord =
    mode === 'live-camera'
      ? manualCorrectionWord || livePrediction?.word || ''
      : manualCorrectionWord || selectedDemoWord;

  const activeConfidence =
    mode === 'live-camera'
      ? livePrediction
        ? Math.round(livePrediction.confidence * 100)
        : 0
      : 100;

  const demoSignInfo = SIGN_VOCABULARY.find((item) => item.word === selectedDemoWord) || SIGN_VOCABULARY[0];

  const handleUndo = () => {
    setWordBuffer((prev) => prev.slice(0, -1));
    setEditingIndex(null);
  };

  const handleClear = () => {
    setWordBuffer([]);
    setGeneratedSentence('');
    setSentenceSource(null);
    setSentenceNote(null);
    setSentenceError(null);
    setEditingIndex(null);
    stopSpeaking();
    setIsSpeaking(false);
  };

  const handleLoadExample = () => {
    setWordBuffer(['ME', 'WATER', 'WANT']);
    setGeneratedSentence('');
    setSentenceSource(null);
    setSentenceNote(null);
    setSentenceError(null);
  };

  const handleGenerateSentence = async () => {
    if (wordBuffer.length === 0) {
      setSentenceError('Add at least one sign word to the buffer first.');
      return;
    }

    setIsGenerating(true);
    setSentenceError(null);
    setSentenceNote(null);

    try {
      const result = await generateNaturalSentence(wordBuffer);
      setGeneratedSentence(result.sentence);
      setSentenceSource(result.source);
      setSentenceNote(result.note || null);
    } catch (err) {
      setSentenceError(err instanceof Error ? err.message : 'Unable to generate sentence.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSpeak = () => {
    const textToSpeak = generatedSentence.trim() || wordBuffer.join(' ');
    if (!textToSpeak) {
      setSpeechError('Generate or enter a sentence before speaking.');
      return;
    }

    setSpeechError(null);
    speakText(textToSpeak, {
      voiceURI: selectedVoiceURI,
      rate: speechRate,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: (msg) => {
        setIsSpeaking(false);
        setSpeechError(msg);
      },
    });

    setSpokenHistory((prev) => {
      if (prev[0] === textToSpeak) return prev;
      return [textToSpeak, ...prev].slice(0, 5);
    });
  };

  const handleStopSpeech = () => {
    stopSpeaking();
    setIsSpeaking(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header + Honest Recognition Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            Live Sign Language Translator
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Detect hand landmarks, assemble words, generate natural English sentences, and speak them aloud.
          </p>
        </div>

        {/* Segmented Mode Control */}
        <div
          role="tablist"
          aria-label="Recognition Mode"
          className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 self-start md:self-auto"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'live-camera'}
            onClick={() => setMode('live-camera')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              mode === 'live-camera'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Live Camera Recognition
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'guided-demo'}
            onClick={() => {
              setMode('guided-demo');
              setManualCorrectionWord(selectedDemoWord);
            }}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              mode === 'guided-demo'
                ? 'bg-white text-violet-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Guided Demo Mode (21 Signs)
          </button>
        </div>
      </div>

      {/* Main Two-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Camera & Landmark Detection OR Guided Demo Pad */}
        <div className="lg:col-span-7 space-y-4">
          {mode === 'live-camera' ? (
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
              {/* Top Status Bar inside Camera Panel */}
              <div className="px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
                <div className="flex items-center gap-2.5 text-xs font-medium">
                  <Hand
                    className={`w-4 h-4 ${
                      handDetected
                        ? 'text-emerald-600'
                        : cameraActive
                        ? 'text-blue-600'
                        : 'text-slate-400'
                    }`}
                  />
                  <span className="text-slate-900">
                    {!cameraActive
                      ? 'Camera Inactive'
                      : modelLoading
                      ? 'Loading MediaPipe HandLandmarker…'
                      : handDetected
                      ? `Hand Detected (${handedness}${handCount > 1 ? ` · ${handCount} hands` : ''})`
                      : 'Camera Active · Show hand in frame'}
                  </span>
                  {cameraActive && handDetected && (
                    <span className="text-slate-500 font-mono tabular-nums">
                      · 21 landmarks · {inferenceMs}ms
                    </span>
                  )}
                </div>

                <span className="text-xs text-slate-500">
                  Geometric Handshape Prototype
                </span>
              </div>

              {/* Video + Canvas Overlay Stage */}
              <div className="relative aspect-video bg-slate-950 flex items-center justify-center overflow-hidden">
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${mirrored ? 'scale-x-[-1]' : ''} ${
                    cameraActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                />
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                />

                {/* Overlay when camera is inactive */}
                {!cameraActive && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-4 bg-slate-900">
                    <div className="w-14 h-14 rounded-2xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                      <Camera className="w-7 h-7" />
                    </div>
                    <div className="max-w-md space-y-1.5">
                      <h2 className="font-display text-lg font-semibold text-white">
                        Webcam Preview Ready
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        Click Start Camera to grant browser webcam permission and run real-time MediaPipe 21-point hand landmark detection locally on your device.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={startCamera}
                        disabled={cameraLoading}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                      >
                        {cameraLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Camera className="w-4 h-4" />
                        )}
                        {cameraLoading ? 'Requesting Permission…' : 'Start Camera'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setMode('guided-demo')}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-sm font-medium hover:bg-slate-700 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                      >
                        Try Guided Demo Mode
                      </button>
                    </div>
                  </div>
                )}

                {/* Subtle hold-to-add progress overlay on active video */}
                {cameraActive && autoHoldEnabled && livePrediction && holdProgress > 0 && (
                  <div className="absolute bottom-4 left-4 right-4 bg-slate-950/80 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                    <div className="flex items-center justify-between text-xs text-white mb-1.5">
                      <span>Holding "{livePrediction.word}" to add automatically…</span>
                      <span className="font-mono tabular-nums">{Math.round(holdProgress * 100)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-[width] duration-75"
                        style={{ width: `${Math.round(holdProgress * 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Camera Error Alert */}
              {cameraError && (
                <div className="p-4 bg-red-50 border-t border-red-200 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="space-y-2 flex-1">
                    <p className="text-sm font-medium text-red-900">{cameraError}</p>
                    <button
                      type="button"
                      onClick={() => setMode('guided-demo')}
                      className="text-xs font-semibold text-red-700 underline hover:text-red-900 cursor-pointer"
                    >
                      Switch to Guided Demo Mode →
                    </button>
                  </div>
                </div>
              )}

              {/* Camera Controls Toolbar */}
              <div className="p-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-white">
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={startCamera}
                    disabled={cameraActive || cameraLoading}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 disabled:opacity-45 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Start Camera
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    disabled={!cameraActive}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50 disabled:opacity-45 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <CameraOff className="w-3.5 h-3.5" />
                    Stop Camera
                  </button>
                  <button
                    type="button"
                    onClick={() => setMirrored((m) => !m)}
                    aria-pressed={mirrored}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      mirrored
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <FlipHorizontal2 className="w-3.5 h-3.5" />
                    Mirror
                  </button>
                </div>

                <label className="inline-flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoHoldEnabled}
                    onChange={(e) => setAutoHoldEnabled(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                  />
                  Auto-add after 1.2s steady hold
                </label>
              </div>

              {/* Live Finger Landmark Telemetry Strip */}
              <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50/70 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-medium text-slate-700">
                    Detected Finger Extension State
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Static live gestures: Hello, Stop, Yes, No, Water, I, You, Love, Food, Sorry, Bathroom, Want
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {(
                    [
                      ['Thumb', fingerState?.thumb],
                      ['Index', fingerState?.index],
                      ['Middle', fingerState?.middle],
                      ['Ring', fingerState?.ring],
                      ['Pinky', fingerState?.pinky],
                    ] as const
                  ).map(([label, extended]) => (
                    <div
                      key={label}
                      className={`px-2.5 py-1.5 rounded-lg border text-center text-xs font-mono transition-colors ${
                        !handDetected
                          ? 'bg-white border-slate-200 text-slate-400'
                          : extended
                          ? 'bg-blue-50 border-blue-200 text-blue-800 font-medium'
                          : 'bg-white border-slate-200 text-slate-500'
                      }`}
                    >
                      {label}: {!handDetected ? '—' : extended ? 'UP' : 'DOWN'}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* GUIDED DEMO MODE PANEL */
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 bg-violet-50/60 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-base font-bold text-slate-900">
                    Guided Sign Demonstration Mode
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Explicit prototype mode for dynamic motion signs or testing without a trained temporal ML model or webcam.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMode('live-camera')}
                  className="text-xs font-medium text-blue-700 hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Switch to Live Camera →
                </button>
              </div>

              {/* Selected Demo Sign Showcase */}
              <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center gap-5 bg-slate-50/40">
                <SignIllustration
                  illustrationKey={demoSignInfo.illustrationKey}
                  className="w-24 h-24 shrink-0"
                />
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-violet-700">{demoSignInfo.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{demoSignInfo.handshapeName}</span>
                  </div>
                  <h3 className="font-display text-xl font-bold text-slate-900">
                    {demoSignInfo.word}
                  </h3>
                  <p className="text-sm text-slate-600">{demoSignInfo.gestureDescription}</p>
                </div>
                <button
                  type="button"
                  onClick={() => addWordToBuffer(demoSignInfo.word)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 text-white text-xs font-medium hover:bg-violet-700 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  Add "{demoSignInfo.word}"
                </button>
              </div>

              {/* All 21 Signs Picker Grid */}
              <div className="p-5 space-y-3">
                <p className="text-xs font-medium text-slate-700">
                  Select any vocabulary sign to demonstrate or add to your sentence buffer:
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                  {SIGN_VOCABULARY.map((item) => {
                    const isSelected = selectedDemoWord === item.word;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setSelectedDemoWord(item.word);
                          setManualCorrectionWord(item.word);
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-violet-50 border-violet-400 text-violet-950'
                            : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 text-slate-800'
                        }`}
                      >
                        <p className="text-xs font-semibold truncate">{item.word}</p>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">{item.category}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Honest Technical Disclosure Banner */}
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-600 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-slate-800 font-medium">Model Transparency:</strong> Live detection uses real MediaPipe 21-point hand landmarks paired with deterministic geometric handshape rules—never random words. Dynamic two-handed or motion signs are supported via Guided Demo Mode and ready for a future trained temporal classifier via{' '}
              <span className="font-mono text-[11px] text-slate-800">SignClassifierAdapter</span>.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Recognized Sign, Word Buffer, Sentence Generation & Voice Output */}
        <div className="lg:col-span-5 space-y-4">
          {/* 1. Recognized Sign & Correction Card */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-sm font-bold text-slate-900">
                1. Recognized Gesture & Word
              </h2>
              <span className="text-xs font-mono text-slate-500 tabular-nums">
                {mode === 'live-camera'
                  ? livePrediction
                    ? `${activeConfidence}% match`
                    : 'Waiting for sign'
                  : 'Guided Demo'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-slate-500">Current Word</p>
                  <p className="font-display text-2xl font-bold text-slate-900 mt-0.5">
                    {activeWord || '—'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => activeWord && addWordToBuffer(activeWord)}
                  disabled={!activeWord}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 disabled:opacity-45 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  Add Word
                </button>
              </div>

              {/* Confidence Meter */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>
                    {mode === 'live-camera'
                      ? livePrediction
                        ? `${livePrediction.handshapeName} · ${livePrediction.matchedRule}`
                        : handDetected
                        ? 'Hand detected — form a vocabulary handshape'
                        : 'No hand detected in frame'
                      : `${demoSignInfo.handshapeName} · Selected in Guided Demo`}
                  </span>
                  <span className="font-mono tabular-nums">{activeConfidence}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-150 ${
                      activeConfidence >= 80
                        ? 'bg-blue-600'
                        : activeConfidence > 0
                        ? 'bg-violet-500'
                        : 'bg-slate-300'
                    }`}
                    style={{ width: `${activeConfidence}%` }}
                  />
                </div>
              </div>

              {/* Manual Word Correction Option */}
              <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
                <label
                  htmlFor="correct-word-select"
                  className="text-xs font-medium text-slate-600 whitespace-nowrap shrink-0"
                >
                  Correct word:
                </label>
                <select
                  id="correct-word-select"
                  value={manualCorrectionWord}
                  onChange={(e) => setManualCorrectionWord(e.target.value)}
                  className="flex-1 min-w-0 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">Select vocabulary sign…</option>
                  {SIGN_VOCABULARY.map((item) => (
                    <option key={item.id} value={item.word}>
                      {item.word} ({item.handshapeName})
                    </option>
                  ))}
                </select>
                {manualCorrectionWord && manualCorrectionWord !== livePrediction?.word && mode === 'live-camera' && (
                  <button
                    type="button"
                    onClick={() => setManualCorrectionWord('')}
                    title="Reset to live prediction"
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-white cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* 2. Word Buffer & Sentence Builder Card */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-sm font-bold text-slate-900">
                2. Word Buffer & Sentence Formation
              </h2>
              <button
                type="button"
                onClick={handleLoadExample}
                className="text-xs font-medium text-violet-700 hover:underline whitespace-nowrap shrink-0 cursor-pointer"
              >
                Load "ME + WATER + WANT"
              </button>
            </div>

            {/* Word Buffer Display */}
            <div className="min-h-[76px] p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-wrap items-center gap-2">
              {wordBuffer.length === 0 ? (
                <p className="text-xs text-slate-500">
                  No words in buffer yet. Add recognized signs or use quick-pick words below.
                </p>
              ) : (
                wordBuffer.map((word, idx) =>
                  editingIndex === idx ? (
                    <select
                      key={`${word}-${idx}`}
                      autoFocus
                      value={word}
                      onBlur={() => setEditingIndex(null)}
                      onChange={(e) => {
                        const updated = [...wordBuffer];
                        updated[idx] = e.target.value;
                        setWordBuffer(updated);
                        setEditingIndex(null);
                      }}
                      className="rounded-lg border border-blue-400 bg-white px-2.5 py-1 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      {SIGN_VOCABULARY.map((item) => (
                        <option key={item.id} value={item.word}>
                          {item.word}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div
                      key={`${word}-${idx}`}
                      className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-900 shadow-2xs"
                    >
                      <button
                        type="button"
                        onClick={() => setEditingIndex(idx)}
                        title="Click to correct this word"
                        className="hover:text-blue-600 cursor-pointer"
                      >
                        {word}
                      </button>
                      <button
                        type="button"
                        aria-label={`Remove ${word}`}
                        onClick={() =>
                          setWordBuffer((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="p-0.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                      >
                        ×
                      </button>
                    </div>
                  )
                )
              )}
            </div>

            {/* Quick-Add Common Vocabulary Buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-slate-500 mr-1">Quick add:</span>
              {['I', 'Want', 'Water', 'Food', 'Help', 'Pain', 'Doctor', 'Please'].map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => addWordToBuffer(w)}
                  className="px-2.5 py-1 rounded-md border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 text-[11px] font-medium text-slate-700 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  + {w}
                </button>
              ))}
            </div>

            {/* Buffer Action Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={wordBuffer.length === 0}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  Undo
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={wordBuffer.length === 0 && !generatedSentence}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200 disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear
                </button>
              </div>

              <button
                type="button"
                onClick={handleGenerateSentence}
                disabled={wordBuffer.length === 0 || isGenerating}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-medium hover:bg-violet-700 disabled:opacity-45 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                {isGenerating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Wand2 className="w-3.5 h-3.5" />
                )}
                {isGenerating ? 'Generating…' : 'Generate Sentence'}
              </button>
            </div>

            {sentenceError && (
              <p className="text-xs text-red-600 font-medium">{sentenceError}</p>
            )}
          </section>

          {/* 3. Final Sentence Display & Text-to-Speech Card */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-sm font-bold text-slate-900">
                3. Generated Sentence & Voice Output
              </h2>
              {sentenceSource && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700">
                  <Sparkles className="w-3 h-3" />
                  {sentenceSource === 'gemini' ? 'Gemini AI Grammar' : 'Rule-Based Grammar'}
                </span>
              )}
            </div>

            <textarea
              aria-label="Generated English sentence"
              rows={3}
              value={generatedSentence}
              onChange={(e) => setGeneratedSentence(e.target.value)}
              placeholder="Your generated natural English sentence will appear here. You can also edit it directly before speaking."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 font-display text-lg font-semibold text-slate-900 placeholder:font-sans placeholder:text-sm placeholder:font-normal placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
            />

            {sentenceNote && (
              <p className="text-[11px] text-slate-500">{sentenceNote}</p>
            )}

            {/* Speech Controls */}
            <div className="space-y-3 pt-1">
              <div className="flex flex-wrap items-center gap-2.5">
                {!isSpeaking ? (
                  <button
                    type="button"
                    onClick={handleSpeak}
                    disabled={!generatedSentence.trim() && wordBuffer.length === 0}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-45 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Volume2 className="w-4 h-4" />
                    Speak Sentence
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStopSpeech}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    Stop Speaking
                  </button>
                )}

                {isSpeaking && (
                  <span className="text-xs font-medium text-blue-700">
                    Speaking aloud…
                  </span>
                )}
              </div>

              {/* Voice & Speed Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label htmlFor="tts-voice" className="block text-[11px] font-medium text-slate-600 mb-1">
                    Voice
                  </label>
                  <select
                    id="tts-voice"
                    value={selectedVoiceURI}
                    onChange={(e) => setSelectedVoiceURI(e.target.value)}
                    disabled={voices.length === 0}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    {voices.length === 0 ? (
                      <option value="">System Default Voice</option>
                    ) : (
                      voices.map((v) => (
                        <option key={v.voiceURI} value={v.voiceURI}>
                          {v.name} ({v.lang})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] font-medium text-slate-600 mb-1">
                    <label htmlFor="tts-speed">Speech Speed</label>
                    <span className="font-mono tabular-nums text-slate-900">
                      {speechRate.toFixed(1)}×
                    </span>
                  </div>
                  <input
                    id="tts-speed"
                    type="range"
                    min="0.6"
                    max="1.5"
                    step="0.1"
                    value={speechRate}
                    onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>
              </div>

              {speechError && (
                <p className="text-xs text-red-600 font-medium">{speechError}</p>
              )}
            </div>

            {/* Recent Spoken Phrases */}
            {spokenHistory.length > 0 && (
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <p className="text-[11px] font-medium text-slate-500">Recent Spoken Output</p>
                <div className="space-y-1.5">
                  {spokenHistory.map((item, idx) => (
                    <div
                      key={`${item}-${idx}`}
                      className="flex items-center justify-between gap-2 text-xs text-slate-700 bg-slate-50 rounded-lg px-3 py-1.5 border border-slate-100"
                    >
                      <span className="truncate">{item}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setGeneratedSentence(item);
                          speakText(item, {
                            voiceURI: selectedVoiceURI,
                            rate: speechRate,
                            onStart: () => setIsSpeaking(true),
                            onEnd: () => setIsSpeaking(false),
                          });
                        }}
                        className="text-blue-600 hover:underline font-medium whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        Replay
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
