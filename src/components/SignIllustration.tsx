import React from 'react';
import type { SignVocabularyItem } from '../data/vocabulary';

interface SignIllustrationProps {
  illustrationKey: SignVocabularyItem['illustrationKey'];
  className?: string;
}

/**
 * Clean vector handshape & gesture-motion diagrams for all 21 core signs.
 * Uses consistent blue (#2563EB) & light-purple (#7C3AED) instructional strokes.
 */
export const SignIllustration: React.FC<SignIllustrationProps> = ({
  illustrationKey,
  className = 'w-20 h-20',
}) => {
  const renderSignSvg = () => {
    switch (illustrationKey) {
      case 'hello':
        // Open 5-finger palm + subtle wave arc
        return (
          <g>
            <path
              d="M28 52V28a3 3 0 0 1 6 0v14m0-18a3 3 0 0 1 6 0v18m0-16a3 3 0 0 1 6 0v16m0-12a3 3 0 0 1 6 0v22c0 10-7 16-16 16h-4c-7 0-12-5-14-12l-4-11a3 3 0 0 1 5.5-2.4L28 52Z"
              fill="#EFF6FF"
              stroke="#2563EB"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M58 20c4 3 6 8 6 13" stroke="#7C3AED" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M62 17l3 3-3 3" stroke="#7C3AED" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </g>
        );

      case 'stop':
        // Four fingers tightly adducted upright, thumb tucked
        return (
          <g>
            <path
              d="M28 54V22a3 3 0 0 1 5.5 0v20m0-22a3 3 0 0 1 5.5 0v22m0-21a3 3 0 0 1 5.5 0v21m0-16a3 3 0 0 1 5.5 0v24c0 9-6 15-14 15h-4c-7 0-11-5-11-12V46a3 3 0 0 1 6 0v4"
              fill="#EFF6FF"
              stroke="#2563EB"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M24 52h13" stroke="#7C3AED" strokeWidth="2.4" strokeLinecap="round" />
          </g>
        );

      case 'yes':
        // Thumbs up / nodding fist
        return (
          <g>
            <path
              d="M32 38V21a3.5 3.5 0 0 1 7 0v15h12a4 4 0 0 1 4 4v14a10 10 0 0 1-10 10H33a9 9 0 0 1-9-9V45a7 7 0 0 1 8-7Z"
              fill="#EFF6FF"
              stroke="#2563EB"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M40 44h13M40 51h12M40 58h10" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" />
          </g>
        );

      case 'no':
        // Index + middle pinched toward thumb
        return (
          <g>
            <path
              d="M24 44c0-10 7-16 15-16h12a3 3 0 0 1 0 6H39m12 0a3 3 0 0 1 0 6H38m11 6a3 3 0 0 1 0 6H37c-7 0-13-4-13-8Z"
              fill="#EFF6FF"
              stroke="#2563EB"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M49 34l-3 7m-4-7l-3 7" stroke="#7C3AED" strokeWidth="2.2" strokeLinecap="round" />
          </g>
        );

      case 'water':
        // W handshape: 3 fingers (index, middle, ring)
        return (
          <g>
            <path
              d="M27 46V21a3 3 0 0 1 6 0v22m2-24a3 3 0 0 1 6 0v24m2-21a3 3 0 0 1 6 0v24c0 10-6 17-15 17h-2c-7 0-12-5-12-13V48a4 4 0 0 1 7-2Z"
              fill="#EFF6FF"
              stroke="#2563EB"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M22 50c4 3 10 3 14-1" stroke="#7C3AED" strokeWidth="2.2" strokeLinecap="round" />
          </g>
        );

      case 'i':
        // Pinky extended upright
        return (
          <g>
            <path
              d="M49 48V20a3 3 0 0 1 6 0v32c0 9-6 15-15 15h-4c-7 0-12-5-12-12V44a4 4 0 0 1 8 0v4h17Z"
              fill="#EFF6FF"
              stroke="#2563EB"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M28 48h15M28 54h13" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" />
          </g>
        );

      case 'you':
        // Index pointing forward/upward
        return (
          <g>
            <path
              d="M30 48V18a3.2 3.2 0 0 1 6.4 0v26h14a4 4 0 0 1 4 4v6c0 8-6 14-14 14h-6c-7 0-12-5-12-12V48Z"
              fill="#EFF6FF"
              stroke="#2563EB"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M33 11v-3m0 0l-3 3m3-3l3 3" stroke="#7C3AED" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        );

      case 'love':
        // ILY handshape: thumb + index + pinky
        return (
          <g>
            <path
              d="M27 48V20a3 3 0 0 1 6 0v22h16V24a3 3 0 0 1 6 0v28c0 9-6 15-15 15h-5c-7 0-12-5-14-11l-5-10a3 3 0 0 1 5.4-2.6L27 48Z"
              fill="#EFF6FF"
              stroke="#2563EB"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M36 44c0-3 2-5 5-5s5 2 5 5" stroke="#7C3AED" strokeWidth="2.2" strokeLinecap="round" />
          </g>
        );

      case 'sorry':
        // Closed fist + circular chest motion arrow
        return (
          <g>
            <rect
              x="25"
              y="32"
              width="28"
              height="28"
              rx="10"
              fill="#EFF6FF"
              stroke="#2563EB"
              strokeWidth="2.4"
            />
            <path d="M32 39h14M32 46h14M28 52h18" stroke="#2563EB" strokeWidth="2.2" strokeLinecap="round" />
            <path
              d="M56 26a18 18 0 0 1 4 22"
              stroke="#7C3AED"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
            <path d="M58 45l2 4 4-2" stroke="#7C3AED" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </g>
        );

      case 'please':
        // Flat open palm + clockwise circle
        return (
          <g>
            <path
              d="M24 44V26a3 3 0 0 1 6 0v14m0-16a3 3 0 0 1 6 0v16m0-15a3 3 0 0 1 6 0v15m0-11a3 3 0 0 1 6 0v21c0 8-5 13-13 13h-4c-6 0-10-4-10-11V44Z"
              fill="#EFF6FF"
              stroke="#2563EB"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="55" cy="46" r="10" stroke="#7C3AED" strokeWidth="2" strokeDasharray="4 3" fill="none" />
            <path d="M62 39l3 4-4 2" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </g>
        );

      case 'thank_you':
        // Flat hand moving forward from chin
        return (
          <g>
            <circle cx="26" cy="24" r="6" fill="#F5F3FF" stroke="#7C3AED" strokeWidth="2" />
            <path
              d="M28 44h22a3 3 0 0 1 0 6H36l12 4a3 3 0 0 1-1.8 5.7L24 54V44Z"
              fill="#EFF6FF"
              stroke="#2563EB"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M36 32h24m0 0l-5-4m5 4l-5 4" stroke="#7C3AED" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        );

      case 'food':
        // Flat-O cluster tapping toward mouth
        return (
          <g>
            <path
              d="M26 52c0-11 6-19 14-19 6 0 11 5 11 11 0 9-5 17-13 17h-4c-5 0-8-4-8-9Z"
              fill="#EFF6FF"
              stroke="#2563EB"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M35 33l5-9m5 10l-3-10" stroke="#7C3AED" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M40 16v5m-3-3l3 3 3-3" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        );

      case 'hungry':
        // C-hand sliding downward
        return (
          <g>
            <path
              d="M44 24c-11 0-18 7-18 16s7 16 18 16"
              fill="none"
              stroke="#2563EB"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <path d="M54 22v28m0 0l-4-5m4 5l4-5" stroke="#7C3AED" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        );

      case 'thirsty':
        // Index finger tracing downward
        return (
          <g>
            <path
              d="M36 22v26m-9-9a9 9 0 1 0 18 0"
              fill="none"
              stroke="#2563EB"
              strokeWidth="2.6"
              strokeLinecap="round"
            />
            <circle cx="36" cy="20" r="4" fill="#EFF6FF" stroke="#2563EB" strokeWidth="2.4" />
            <path d="M52 24v28m0 0l-4-5m4 5l4-5" stroke="#7C3AED" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        );

      case 'help':
        // Fist resting on open palm lifting upward
        return (
          <g>
            <rect x="26" y="24" width="22" height="20" rx="8" fill="#EFF6FF" stroke="#2563EB" strokeWidth="2.4" />
            <path d="M16 48h42a3 3 0 0 1 0 6H20a4 4 0 0 1-4-6Z" fill="#DBEAFE" stroke="#2563EB" strokeWidth="2.4" />
            <path d="M58 38V20m0 0l-4 4m4-4l4 4" stroke="#7C3AED" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        );

      case 'doctor':
        // Fingertips tapping inner wrist (pulse check)
        return (
          <g>
            <path d="M16 48h34a4 4 0 0 1 0 8H16" fill="#EFF6FF" stroke="#2563EB" strokeWidth="2.4" strokeLinecap="round" />
            <path
              d="M34 22l6 18m6-16l-2 16"
              stroke="#7C3AED"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="38" cy="46" r="3" fill="#7C3AED" />
          </g>
        );

      case 'hospital':
        // H-hand tracing a cross on arm
        return (
          <g>
            <rect x="18" y="22" width="44" height="36" rx="10" fill="#EFF6FF" stroke="#2563EB" strokeWidth="2.2" />
            <path d="M40 30v20M30 40h20" stroke="#7C3AED" strokeWidth="3.2" strokeLinecap="round" />
          </g>
        );

      case 'pain':
        // Opposing index fingers pointing inward
        return (
          <g>
            <path d="M14 40h18m0 0l-4-4m4 4l-4 4" stroke="#2563EB" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M66 40H48m0 0l4-4m-4 4l4 4" stroke="#2563EB" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M40 24l2 5m-2 27l-2-5m-9-21l4 3m18 12l-4-3" stroke="#7C3AED" strokeWidth="2.2" strokeLinecap="round" />
          </g>
        );

      case 'home':
        // Flat-O moving cheek to jaw + house roofline cue
        return (
          <g>
            <path d="M22 40l18-16 18 16v18H22V40Z" fill="#EFF6FF" stroke="#2563EB" strokeWidth="2.4" strokeLinejoin="round" />
            <path d="M33 58V44h14v14" stroke="#7C3AED" strokeWidth="2.2" strokeLinejoin="round" />
          </g>
        );

      case 'bathroom':
        // T-handshape (thumb tucked between index & middle)
        return (
          <g>
            <rect x="24" y="28" width="30" height="30" rx="11" fill="#EFF6FF" stroke="#2563EB" strokeWidth="2.4" />
            <path d="M38 26v14" stroke="#7C3AED" strokeWidth="4" strokeLinecap="round" />
            <path d="M18 44l-4-3 4-3M60 38l4 3-4 3" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        );

      case 'want':
        // Open claw hands pulling inward
        return (
          <g>
            <path
              d="M22 46c0-10 5-18 10-18M34 44c0-11 4-19 8-19M46 44c0-11 4-18 8-18M24 52c6 6 26 6 32-2"
              fill="none"
              stroke="#2563EB"
              strokeWidth="2.6"
              strokeLinecap="round"
            />
            <path d="M40 58v-8m0 8l-4-4m4 4l4-4" stroke="#7C3AED" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        );
    }
  };

  return (
    <svg
      viewBox="0 0 80 80"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="76" height="76" rx="16" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1.5" />
      {renderSignSvg()}
    </svg>
  );
};
