# SignBridge – AI-Powered Sign Language to Text and Speech Translator

**Project Title:** SignBridge – Breaking Communication Barriers Through AI-Powered Sign Language Translation

SignBridge is a full-stack assistive web application designed to enable two-way communication between people who use sign language and people who do not understand it.

## Communication Flow

```
Hand Gestures → Sign Recognition → Word Formation → Sentence Generation → Text Display → Voice Output
```

## Core Features

1. **Live Camera & Hand Landmark Detection**
   - Uses browser `getUserMedia` webcam permissions with graceful error handling.
   - Runs **MediaPipe HandLandmarker** (`@mediapipe/tasks-vision`) locally in the browser to extract 21 3D hand landmarks and draw a live skeletal overlay.
   - Includes a **Guided Demo Mode** (clearly labeled) for demonstrating dynamic two-handed or motion signs and testing without a webcam.

2. **Modular Sign Recognition**
   - Gesture recognition logic is separated from UI components under `src/services/signRecognition/`.
   - Includes a deterministic geometric 21-landmark handshape matcher (`GeometricSignClassifier`) and a `SignClassifierAdapter` interface ready for future TensorFlow.js or ONNX temporal ML models.
   - Supports a 21-sign core vocabulary: *Hello, Thank You, Yes, No, Help, Water, Food, Hungry, Thirsty, Doctor, Hospital, Pain, Stop, Please, Sorry, Home, Bathroom, I, You, Love,* and *Want*.
   - Includes manual word correction controls before and after adding words to the sentence buffer.

3. **AI-Powered Sentence Formation**
   - Collects recognized signs in an editable word buffer (`Add Word`, `Undo`, `Clear`, `Generate Sentence`).
   - Uses a server-side Express endpoint (`/api/generate-sentence`) powered by `@google/genai` (`gemini-4-hydrogen`) to convert sign gloss sequences (e.g., `ME + WATER + WANT`) into natural English (`"I want water."`), with a transparent rule-based grammar fallback when no API key is configured.

4. **Text-to-Speech Voice Output**
   - Uses the browser Web Speech API (`SpeechSynthesis`) with selectable system voices and adjustable speaking speed (`0.6×` – `1.5×`).

5. **Two-Way Text-to-Sign Partner Communication**
   - Lets the non-signing person type a reply, displays it in large high-contrast text, and renders SVG hand-sign illustrations for supported words while clearly flagging unsupported words.

## Running Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser and allow camera access when prompted in **Live Translator**.

### Optional Gemini API Configuration

To enable Gemini AI sentence generation locally, copy `.env.example` to `.env` and set `GEMINI_API_KEY`:

```bash
GEMINI_API_KEY="your_api_key_here"
```

Without `GEMINI_API_KEY`, SignBridge automatically uses its deterministic rule-based grammar formatter and clearly indicates the active mode in the UI.
