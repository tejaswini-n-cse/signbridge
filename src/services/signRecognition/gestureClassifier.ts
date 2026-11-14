import type {
  FingerExtensionState,
  HandLandmarkPoint,
  HandednessLabel,
  RecognitionPrediction,
  SignClassifierAdapter,
} from './types';

function dist2D(a: HandLandmarkPoint, b: HandLandmarkPoint): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

function clamp01(val: number): number {
  return Math.max(0, Math.min(1, val));
}

/**
 * Extracts deterministic anatomical finger-extension & pinch geometry
 * from MediaPipe's 21 hand landmarks.
 */
export function extractFingerState(landmarks: HandLandmarkPoint[]): FingerExtensionState {
  const wrist = landmarks[0];
  const palmScale = Math.max(dist2D(wrist, landmarks[9]), 0.04);

  const isFingerExtended = (mcpIdx: number, pipIdx: number, tipIdx: number): boolean => {
    const tipDist = dist2D(wrist, landmarks[tipIdx]);
    const pipDist = dist2D(wrist, landmarks[pipIdx]);
    const mcpDist = dist2D(wrist, landmarks[mcpIdx]);
    return tipDist > pipDist * 1.08 && tipDist > mcpDist * 1.18;
  };

  // Thumb extension: tip is substantially further from pinky MCP (17) and index MCP (5) than IP joint (3)
  const thumbTipToPinkyMcp = dist2D(landmarks[4], landmarks[17]);
  const thumbIpToPinkyMcp = dist2D(landmarks[3], landmarks[17]);
  const thumbTipToIndexMcp = dist2D(landmarks[4], landmarks[5]);
  const thumbExtended =
    thumbTipToPinkyMcp > thumbIpToPinkyMcp * 1.12 && thumbTipToIndexMcp / palmScale > 0.45;

  const index = isFingerExtended(5, 6, 8);
  const middle = isFingerExtended(9, 10, 12);
  const ring = isFingerExtended(13, 14, 16);
  const pinky = isFingerExtended(17, 18, 20);

  const thumbIndexPinch = dist2D(landmarks[4], landmarks[8]) / palmScale < 0.36;

  // Check if fingers are held tightly together (adducted) vs spread apart
  const indexMiddleGap = dist2D(landmarks[8], landmarks[12]) / palmScale;
  const middleRingGap = dist2D(landmarks[12], landmarks[16]) / palmScale;
  const tightlyAdducted = index && middle && ring && indexMiddleGap < 0.28 && middleRingGap < 0.28;

  // Check if fingers are semi-curved (claw/cup shape for Food / Want)
  const tipToMcpAvg =
    (dist2D(landmarks[8], landmarks[5]) +
      dist2D(landmarks[12], landmarks[9]) +
      dist2D(landmarks[16], landmarks[13]) +
      dist2D(landmarks[20], landmarks[17])) /
    (4 * palmScale);

  const allFingersCurved = !index && !middle && !ring && !pinky && tipToMcpAvg > 0.35 && tipToMcpAvg < 0.72;

  return {
    thumb: thumbExtended,
    index,
    middle,
    ring,
    pinky,
    thumbIndexPinch,
    allFingersCurved,
    tightlyAdducted,
  };
}

/**
 * Deterministic Geometric Handshape Matcher (Prototype).
 * Maps static 21-landmark hand postures to core vocabulary signs without fabricated predictions.
 * Designed as a drop-in adapter implementing SignClassifierAdapter.
 */
export class GeometricSignClassifier implements SignClassifierAdapter {
  readonly id = 'geometric-heuristics-v1';
  readonly label = 'Geometric 21-Landmark Handshape Matcher (Prototype)';
  readonly isTrainedModel = false;

  classifyLandmarks(
    landmarks: HandLandmarkPoint[],
    _handedness: HandednessLabel
  ): {
    fingerState: FingerExtensionState;
    prediction: RecognitionPrediction | null;
  } {
    const fingerState = extractFingerState(landmarks);
    const wrist = landmarks[0];
    const palmScale = Math.max(dist2D(wrist, landmarks[9]), 0.04);

    const { thumb, index, middle, ring, pinky, thumbIndexPinch, allFingersCurved, tightlyAdducted } =
      fingerState;

    // 1. ILY / "Love": Thumb + Index + Pinky extended, Middle + Ring curled
    if (thumb && index && !middle && !ring && pinky) {
      return {
        fingerState,
        prediction: {
          word: 'Love',
          confidence: 0.91,
          handshapeName: 'ILY Handshape',
          classifierSource: 'geometric-heuristics',
          matchedRule: 'Thumb + Index + Pinky extended',
        },
      };
    }

    // 2. "Water" (W-handshape): Index + Middle + Ring extended, Pinky curled, Thumb curled/pinched
    if (!thumb && index && middle && ring && !pinky) {
      return {
        fingerState,
        prediction: {
          word: 'Water',
          confidence: 0.88,
          handshapeName: 'W-Handshape (3 Fingers)',
          classifierSource: 'geometric-heuristics',
          matchedRule: 'Index + Middle + Ring extended',
        },
      };
    }

    // 3. "I" (Pinky-up I-handshape): Only Pinky extended
    if (!index && !middle && !ring && pinky && !thumb) {
      return {
        fingerState,
        prediction: {
          word: 'I',
          confidence: 0.87,
          handshapeName: 'Pinky-Up I-Hand',
          classifierSource: 'geometric-heuristics',
          matchedRule: 'Pinky extended, other 4 curled',
        },
      };
    }

    // 4. "You" (Pointing Index): Only Index extended
    if (!thumb && index && !middle && !ring && !pinky) {
      return {
        fingerState,
        prediction: {
          word: 'You',
          confidence: 0.89,
          handshapeName: 'Pointing Index',
          classifierSource: 'geometric-heuristics',
          matchedRule: 'Index extended, middle/ring/pinky curled',
        },
      };
    }

    // 5. "Yes" (Thumbs-up): Thumb extended upward, all 4 fingers curled
    if (thumb && !index && !middle && !ring && !pinky && landmarks[4].y < landmarks[2].y) {
      const verticalDelta = clamp01((landmarks[2].y - landmarks[4].y) / palmScale);
      return {
        fingerState,
        prediction: {
          word: 'Yes',
          confidence: Number((0.78 + verticalDelta * 0.16).toFixed(2)),
          handshapeName: 'Thumbs-Up',
          classifierSource: 'geometric-heuristics',
          matchedRule: 'Thumb upward, four fingers curled',
        },
      };
    }

    // 6. "No" (Two-finger thumb pinch): Index + Middle extended & pinched toward thumb, Ring + Pinky curled
    if (index && middle && !ring && !pinky && thumbIndexPinch) {
      return {
        fingerState,
        prediction: {
          word: 'No',
          confidence: 0.84,
          handshapeName: 'Pinched Two-Finger Snap',
          classifierSource: 'geometric-heuristics',
          matchedRule: 'Index + Middle pinched toward thumb',
        },
      };
    }

    // 7. "Stop" vs "Hello" (Open palm variations)
    if (index && middle && ring && pinky) {
      if (!thumb && tightlyAdducted) {
        return {
          fingerState,
          prediction: {
            word: 'Stop',
            confidence: 0.86,
            handshapeName: 'Tight Upright Palm',
            classifierSource: 'geometric-heuristics',
            matchedRule: 'Four fingers adducted, thumb tucked',
          },
        };
      }

      if (thumb) {
        const fingerSpread = dist2D(landmarks[8], landmarks[20]) / palmScale;
        const conf = clamp01(0.78 + Math.min(fingerSpread, 1.2) * 0.12);
        return {
          fingerState,
          prediction: {
            word: 'Hello',
            confidence: Number(conf.toFixed(2)),
            handshapeName: 'Open Flat Palm',
            classifierSource: 'geometric-heuristics',
            matchedRule: 'All five fingers extended',
          },
        };
      }
    }

    // 8. "Food" (Flat-O pinch): Thumb & fingertips clustered close together
    const middleToThumb = dist2D(landmarks[12], landmarks[4]) / palmScale;
    if (thumbIndexPinch && middleToThumb < 0.42 && !ring && !pinky) {
      return {
        fingerState,
        prediction: {
          word: 'Food',
          confidence: 0.81,
          handshapeName: 'Flat-O Cluster',
          classifierSource: 'geometric-heuristics',
          matchedRule: 'Fingertips clustered with thumb',
        },
      };
    }

    // 9. "Want" (Open claw posture)
    if (allFingersCurved && thumb) {
      return {
        fingerState,
        prediction: {
          word: 'Want',
          confidence: 0.77,
          handshapeName: 'Open Claw Hand',
          classifierSource: 'geometric-heuristics',
          matchedRule: 'Fingers semi-curved in grasping posture',
        },
      };
    }

    // 10. "Bathroom" (T-handshape: thumb tucked near index/middle PIP, all fingers curled)
    const thumbToMiddlePip = dist2D(landmarks[4], landmarks[10]) / palmScale;
    if (!thumb && !index && !middle && !ring && !pinky && thumbToMiddlePip < 0.28) {
      return {
        fingerState,
        prediction: {
          word: 'Bathroom',
          confidence: 0.79,
          handshapeName: 'T-Handshape',
          classifierSource: 'geometric-heuristics',
          matchedRule: 'Thumb tucked between index and middle',
        },
      };
    }

    // 11. "Sorry" (Closed S-fist: all fingers curled)
    if (!thumb && !index && !middle && !ring && !pinky) {
      return {
        fingerState,
        prediction: {
          word: 'Sorry',
          confidence: 0.78,
          handshapeName: 'Closed S-Fist',
          classifierSource: 'geometric-heuristics',
          matchedRule: 'Closed fist posture',
        },
      };
    }

    return {
      fingerState,
      prediction: null,
    };
  }
}

export const defaultGeometricClassifier = new GeometricSignClassifier();
