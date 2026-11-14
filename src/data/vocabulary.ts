export type SignCategory =
  | 'Greetings'
  | 'Responses'
  | 'Daily Needs'
  | 'Medical & Emergency'
  | 'People & Actions';

export type RecognitionSupport = 'live-geometric' | 'guided-demo';

export interface SignVocabularyItem {
  id: string;
  word: string;
  aliases: string[];
  category: SignCategory;
  recognitionSupport: RecognitionSupport;
  handshapeName: string;
  gestureDescription: string;
  stepByStep: string[];
  /** Key used by SignIllustration SVG renderer */
  illustrationKey:
    | 'hello'
    | 'thank_you'
    | 'yes'
    | 'no'
    | 'help'
    | 'water'
    | 'food'
    | 'hungry'
    | 'thirsty'
    | 'doctor'
    | 'hospital'
    | 'pain'
    | 'stop'
    | 'please'
    | 'sorry'
    | 'home'
    | 'bathroom'
    | 'i'
    | 'you'
    | 'love'
    | 'want';
}

export const SIGN_VOCABULARY: SignVocabularyItem[] = [
  {
    id: 'hello',
    word: 'Hello',
    aliases: ['hi', 'hey', 'greetings'],
    category: 'Greetings',
    recognitionSupport: 'live-geometric',
    handshapeName: 'Open Flat Palm',
    gestureDescription: 'Open hand with all five fingers extended and raised upright.',
    stepByStep: [
      'Extend all five fingers upright with palm facing forward.',
      'Hold hand near forehead or shoulder height.',
      'Move hand slightly outward in a gentle greeting motion.',
    ],
    illustrationKey: 'hello',
  },
  {
    id: 'thank-you',
    word: 'Thank You',
    aliases: ['thanks', 'thank'],
    category: 'Greetings',
    recognitionSupport: 'guided-demo',
    handshapeName: 'Flat B-Hand',
    gestureDescription: 'Flat hand touches chin and moves forward toward the listener.',
    stepByStep: [
      'Hold fingers together in a flat palm.',
      'Touch fingertips lightly to your chin.',
      'Extend hand smoothly forward and down.',
    ],
    illustrationKey: 'thank_you',
  },
  {
    id: 'yes',
    word: 'Yes',
    aliases: ['yeah', 'yep', 'okay', 'ok', 'agree'],
    category: 'Responses',
    recognitionSupport: 'live-geometric',
    handshapeName: 'Thumbs-Up / Nodding Fist',
    gestureDescription: 'Thumb extended upward with remaining four fingers curled.',
    stepByStep: [
      'Curl index, middle, ring, and pinky fingers into palm.',
      'Extend thumb cleanly upward.',
      'Hold steady in frame for recognition.',
    ],
    illustrationKey: 'yes',
  },
  {
    id: 'no',
    word: 'No',
    aliases: ['nope', 'not', 'negative'],
    category: 'Responses',
    recognitionSupport: 'live-geometric',
    handshapeName: 'Pinched Two-Finger Snap',
    gestureDescription: 'Index and middle fingers extended and pinched toward thumb.',
    stepByStep: [
      'Extend index and middle fingers together.',
      'Bring thumb tip close to touch index and middle fingertips.',
      'Curl ring and pinky fingers down.',
    ],
    illustrationKey: 'no',
  },
  {
    id: 'help',
    word: 'Help',
    aliases: ['assist', 'aid', 'support'],
    category: 'Medical & Emergency',
    recognitionSupport: 'guided-demo',
    handshapeName: 'Fist on Open Palm',
    gestureDescription: 'Closed thumbs-up fist resting atop an open flat support palm.',
    stepByStep: [
      'Hold non-dominant palm flat facing upward.',
      'Place dominant closed fist with thumb up onto the flat palm.',
      'Lift both hands upward together.',
    ],
    illustrationKey: 'help',
  },
  {
    id: 'water',
    word: 'Water',
    aliases: ['drink', 'beverage'],
    category: 'Daily Needs',
    recognitionSupport: 'live-geometric',
    handshapeName: 'W-Handshape (3 Fingers)',
    gestureDescription: 'Index, middle, and ring fingers raised in a W shape; thumb and pinky curled.',
    stepByStep: [
      'Raise index, middle, and ring fingers spread slightly apart.',
      'Touch thumb tip to pinky tip across palm.',
      'Tap index finger gently near chin.',
    ],
    illustrationKey: 'water',
  },
  {
    id: 'food',
    word: 'Food',
    aliases: ['eat', 'meal', 'snack'],
    category: 'Daily Needs',
    recognitionSupport: 'live-geometric',
    handshapeName: 'Flat-O Cluster',
    gestureDescription: 'All five fingertips pinched together facing toward the mouth.',
    stepByStep: [
      'Bring all four fingertips and thumb tip together into a flat O.',
      'Hold hand near mouth level.',
      'Tap lightly toward mouth once or twice.',
    ],
    illustrationKey: 'food',
  },
  {
    id: 'hungry',
    word: 'Hungry',
    aliases: ['starving', 'appetite'],
    category: 'Daily Needs',
    recognitionSupport: 'guided-demo',
    handshapeName: 'Curved C-Hand',
    gestureDescription: 'Curved C-hand moves downward along the center of the chest.',
    stepByStep: [
      'Curve all fingers and thumb into a C shape.',
      'Place fingertips lightly below the throat.',
      'Slide hand downward toward stomach.',
    ],
    illustrationKey: 'hungry',
  },
  {
    id: 'thirsty',
    word: 'Thirsty',
    aliases: ['dehydrated', 'parched'],
    category: 'Daily Needs',
    recognitionSupport: 'guided-demo',
    handshapeName: 'Index Trace Down Throat',
    gestureDescription: 'Index finger traces vertically downward along throat.',
    stepByStep: [
      'Extend index finger while curling other fingers.',
      'Place fingertip at upper throat.',
      'Draw finger straight down chest.',
    ],
    illustrationKey: 'thirsty',
  },
  {
    id: 'doctor',
    word: 'Doctor',
    aliases: ['physician', 'medic', 'nurse'],
    category: 'Medical & Emergency',
    recognitionSupport: 'guided-demo',
    handshapeName: 'Pulse-Check Tap',
    gestureDescription: 'Curved fingertips tap gently on the inside of the opposite wrist.',
    stepByStep: [
      'Hold one arm out with inner wrist facing upward.',
      'Bend fingers of the other hand slightly.',
      'Tap the inner wrist twice as if checking a pulse.',
    ],
    illustrationKey: 'doctor',
  },
  {
    id: 'hospital',
    word: 'Hospital',
    aliases: ['clinic', 'emergency', 'er'],
    category: 'Medical & Emergency',
    recognitionSupport: 'guided-demo',
    handshapeName: 'H-Hand Cross',
    gestureDescription: 'Two extended fingers trace a cross on the upper opposite arm.',
    stepByStep: [
      'Extend index and middle fingers together (H-handshape).',
      'Draw a vertical line down the upper opposite arm.',
      'Draw a horizontal cross line across it.',
    ],
    illustrationKey: 'hospital',
  },
  {
    id: 'pain',
    word: 'Pain',
    aliases: ['hurt', 'ache', 'sore', 'injury'],
    category: 'Medical & Emergency',
    recognitionSupport: 'guided-demo',
    handshapeName: 'Opposing Index Points',
    gestureDescription: 'Both index fingers point toward each other and twist slightly.',
    stepByStep: [
      'Extend both index fingers pointing toward one another.',
      'Position near the area of discomfort or chest.',
      'Twist wrists slightly in opposing directions.',
    ],
    illustrationKey: 'pain',
  },
  {
    id: 'stop',
    word: 'Stop',
    aliases: ['halt', 'wait', 'freeze'],
    category: 'People & Actions',
    recognitionSupport: 'live-geometric',
    handshapeName: 'Tight Upright Palm',
    gestureDescription: 'Four fingers pressed tightly together upright, thumb tucked inward.',
    stepByStep: [
      'Keep index, middle, ring, and pinky pressed tightly together.',
      'Tuck thumb across lower palm.',
      'Hold vertical palm facing outward.',
    ],
    illustrationKey: 'stop',
  },
  {
    id: 'please',
    word: 'Please',
    aliases: ['kindly'],
    category: 'Greetings',
    recognitionSupport: 'guided-demo',
    handshapeName: 'Open Chest Circle',
    gestureDescription: 'Flat open hand rubs gently in a circle on the center of the chest.',
    stepByStep: [
      'Keep fingers extended and together in a flat palm.',
      'Place palm flat against center of chest.',
      'Move hand in a slow clockwise circle.',
    ],
    illustrationKey: 'please',
  },
  {
    id: 'sorry',
    word: 'Sorry',
    aliases: ['apologize', 'excuse'],
    category: 'Greetings',
    recognitionSupport: 'live-geometric',
    handshapeName: 'Closed S-Fist',
    gestureDescription: 'Closed fist held upright (thumb wrapped across front of curled fingers).',
    stepByStep: [
      'Curl all four fingers firmly into palm.',
      'Wrap thumb across the front of middle fingers.',
      'Move fist in a gentle circle over chest.',
    ],
    illustrationKey: 'sorry',
  },
  {
    id: 'home',
    word: 'Home',
    aliases: ['house', 'residence'],
    category: 'Daily Needs',
    recognitionSupport: 'guided-demo',
    handshapeName: 'Flat-O Cheek-to-Jaw',
    gestureDescription: 'Flat-O hand taps cheek near mouth then moves to upper cheek.',
    stepByStep: [
      'Pinch all fingertips together with thumb.',
      'Touch near corner of mouth.',
      'Move lightly back to touch cheek near ear.',
    ],
    illustrationKey: 'home',
  },
  {
    id: 'bathroom',
    word: 'Bathroom',
    aliases: ['restroom', 'toilet', 'washroom'],
    category: 'Daily Needs',
    recognitionSupport: 'live-geometric',
    handshapeName: 'T-Handshape',
    gestureDescription: 'Thumb tucked firmly between index and middle finger with fingers curled.',
    stepByStep: [
      'Place thumb tip between index and middle knuckles.',
      'Curl all four fingers around thumb.',
      'Gently shake wrist side-to-side.',
    ],
    illustrationKey: 'bathroom',
  },
  {
    id: 'i',
    word: 'I',
    aliases: ['me', 'myself'],
    category: 'People & Actions',
    recognitionSupport: 'live-geometric',
    handshapeName: 'Pinky-Up I-Hand',
    gestureDescription: 'Only the pinky finger is extended upright while other fingers stay curled.',
    stepByStep: [
      'Curl index, middle, and ring fingers into palm.',
      'Hold thumb across curled fingers.',
      'Extend pinky finger straight upward.',
    ],
    illustrationKey: 'i',
  },
  {
    id: 'you',
    word: 'You',
    aliases: ['your', 'yourself'],
    category: 'People & Actions',
    recognitionSupport: 'live-geometric',
    handshapeName: 'Pointing Index',
    gestureDescription: 'Only the index finger is extended clearly outward/upward.',
    stepByStep: [
      'Extend index finger straight out.',
      'Curl middle, ring, and pinky fingers into palm.',
      'Point toward the person you are addressing.',
    ],
    illustrationKey: 'you',
  },
  {
    id: 'love',
    word: 'Love',
    aliases: ['adore', 'care', 'ily'],
    category: 'People & Actions',
    recognitionSupport: 'live-geometric',
    handshapeName: 'ILY Handshape',
    gestureDescription: 'Thumb, index, and pinky extended; middle and ring fingers curled.',
    stepByStep: [
      'Extend thumb, index finger, and pinky finger.',
      'Curl middle and ring fingers down to palm.',
      'Face palm outward at chest height.',
    ],
    illustrationKey: 'love',
  },
  {
    id: 'want',
    word: 'Want',
    aliases: ['need', 'wish', 'desire'],
    category: 'People & Actions',
    recognitionSupport: 'live-geometric',
    handshapeName: 'Open Claw Hands',
    gestureDescription: 'Fingers spread and curved forward in an open grasping claw.',
    stepByStep: [
      'Spread all five fingers and bend upper joints slightly like a claw.',
      'Hold palm facing upward.',
      'Pull hand slightly inward toward body.',
    ],
    illustrationKey: 'want',
  },
];

export const VOCABULARY_BY_WORD = new Map<string, SignVocabularyItem>(
  SIGN_VOCABULARY.map((item) => [item.word.toLowerCase(), item])
);

export function findVocabularyMatch(token: string): SignVocabularyItem | undefined {
  const clean = token
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .trim();
  if (!clean) return undefined;

  const direct = VOCABULARY_BY_WORD.get(clean);
  if (direct) return direct;

  return SIGN_VOCABULARY.find((item) => item.aliases.includes(clean));
}
