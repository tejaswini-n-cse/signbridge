export interface HandLandmarkPoint {
  x: number;
  y: number;
  z: number;
}

export type HandednessLabel = 'Left' | 'Right' | 'Unknown';

export interface RecognitionPrediction {
  word: string;
  confidence: number; // 0 to 1
  handshapeName: string;
  classifierSource: 'geometric-heuristics' | 'guided-demo';
  matchedRule: string;
}

export interface FingerExtensionState {
  thumb: boolean;
  index: boolean;
  middle: boolean;
  ring: boolean;
  pinky: boolean;
  thumbIndexPinch: boolean;
  allFingersCurved: boolean;
  tightlyAdducted: boolean;
}

export interface HandDetectionFrame {
  handDetected: boolean;
  handCount: number;
  handedness: HandednessLabel;
  landmarks: HandLandmarkPoint[];
  fingerState: FingerExtensionState | null;
  prediction: RecognitionPrediction | null;
  inferenceTimeMs: number;
}

/**
 * Adapter interface for future trained neural gesture classifiers
 * (e.g., TensorFlow.js, ONNX Runtime Web, or temporal LSTM/Transformer models).
 */
export interface SignClassifierAdapter {
  readonly id: string;
  readonly label: string;
  readonly isTrainedModel: boolean;
  classifyLandmarks(
    landmarks: HandLandmarkPoint[],
    handedness: HandednessLabel
  ): {
    fingerState: FingerExtensionState;
    prediction: RecognitionPrediction | null;
  };
}
