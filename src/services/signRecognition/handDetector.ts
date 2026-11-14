import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import type { HandLandmarkPoint, HandednessLabel } from './types';

export interface RawHandLandmarkerOutput {
  landmarks: HandLandmarkPoint[][];
  handedness: HandednessLabel[];
  inferenceTimeMs: number;
}

const LOCAL_WASM_PATH = '/mediapipe/wasm';
const CDN_WASM_PATH = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm';
const LOCAL_MODEL_PATH = '/mediapipe/hand_landmarker.task';
const CDN_MODEL_PATH =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

export class MediaPipeHandDetector {
  private landmarker: HandLandmarker | null = null;
  private isInitializing = false;
  private initPromise: Promise<void> | null = null;

  async initialize(): Promise<void> {
    if (this.landmarker) return;
    if (this.initPromise) return this.initPromise;

    this.isInitializing = true;
    this.initPromise = this.createLandmarker().finally(() => {
      this.isInitializing = false;
    });

    return this.initPromise;
  }

  private async createLandmarker(): Promise<void> {
    let vision;
    try {
      vision = await FilesetResolver.forVisionTasks(LOCAL_WASM_PATH);
    } catch {
      vision = await FilesetResolver.forVisionTasks(CDN_WASM_PATH);
    }

    const attempts: Array<{ modelAssetPath: string; delegate: 'GPU' | 'CPU' }> = [
      { modelAssetPath: LOCAL_MODEL_PATH, delegate: 'GPU' },
      { modelAssetPath: LOCAL_MODEL_PATH, delegate: 'CPU' },
      { modelAssetPath: CDN_MODEL_PATH, delegate: 'CPU' },
    ];

    let lastError: unknown;
    for (const attempt of attempts) {
      try {
        this.landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: attempt.modelAssetPath,
            delegate: attempt.delegate,
          },
          runningMode: 'VIDEO',
          numHands: 2,
          minHandDetectionConfidence: 0.55,
          minHandPresenceConfidence: 0.55,
          minTrackingConfidence: 0.55,
        });
        return;
      } catch (err) {
        lastError = err;
      }
    }

    throw new Error(
      `Unable to initialize MediaPipe HandLandmarker: ${
        lastError instanceof Error ? lastError.message : 'Unknown error'
      }`
    );
  }

  isReady(): boolean {
    return this.landmarker !== null && !this.isInitializing;
  }

  detectFrame(video: HTMLVideoElement, timestampMs: number): RawHandLandmarkerOutput {
    if (!this.landmarker) {
      return { landmarks: [], handedness: [], inferenceTimeMs: 0 };
    }

    const t0 = performance.now();
    const result = this.landmarker.detectForVideo(video, timestampMs);
    const inferenceTimeMs = Math.round((performance.now() - t0) * 10) / 10;

    const landmarks: HandLandmarkPoint[][] = (result.landmarks || []).map((hand) =>
      hand.map((pt) => ({ x: pt.x, y: pt.y, z: pt.z }))
    );

    const rawHandedness = result.handedness || result.handednesses || [];
    const handedness: HandednessLabel[] = rawHandedness.map((cats) => {
      const cat = cats?.[0]?.categoryName;
      if (cat === 'Left' || cat === 'Right') return cat;
      return 'Unknown';
    });

    return { landmarks, handedness, inferenceTimeMs };
  }

  dispose(): void {
    if (this.landmarker) {
      this.landmarker.close();
      this.landmarker = null;
    }
    this.initPromise = null;
  }
}

export function drawHandSkeleton(
  ctx: CanvasRenderingContext2D,
  hands: HandLandmarkPoint[][],
  width: number,
  height: number,
  mirrored: boolean
): void {
  ctx.clearRect(0, 0, width, height);
  if (hands.length === 0) return;

  const connections = HandLandmarker.HAND_CONNECTIONS;

  hands.forEach((landmarks, handIdx) => {
    const lineColor = handIdx === 0 ? 'rgba(37, 99, 235, 0.85)' : 'rgba(124, 58, 237, 0.85)';
    const jointColor = handIdx === 0 ? '#60A5FA' : '#A78BFA';
    const tipColor = '#FFFFFF';

    ctx.lineWidth = 2.5;
    ctx.strokeStyle = lineColor;
    ctx.lineCap = 'round';

    for (const conn of connections) {
      const a = landmarks[conn.start];
      const b = landmarks[conn.end];
      if (!a || !b) continue;

      const ax = (mirrored ? 1 - a.x : a.x) * width;
      const ay = a.y * height;
      const bx = (mirrored ? 1 - b.x : b.x) * width;
      const by = b.y * height;

      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();
    }

    landmarks.forEach((pt, idx) => {
      const px = (mirrored ? 1 - pt.x : pt.x) * width;
      const py = pt.y * height;
      const isTip = idx === 4 || idx === 8 || idx === 12 || idx === 16 || idx === 20;

      ctx.beginPath();
      ctx.arc(px, py, isTip ? 5 : 3.5, 0, Math.PI * 2);
      ctx.fillStyle = isTip ? tipColor : jointColor;
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = lineColor;
      ctx.stroke();
    });
  });
}
