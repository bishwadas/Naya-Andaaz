'use client';

import React from 'react';

export const Animated404Illustration: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative w-full max-w-[500px] aspect-[500/420] mx-auto select-none ${className}`}>
      <style jsx>{`
        @keyframes floatCharacter {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-14px) rotate(-1.5deg);
          }
        }

        @keyframes pulseShadow {
          0%, 100% {
            transform: scaleX(1) scaleY(1);
            opacity: 0.7;
          }
          50% {
            transform: scaleX(0.8) scaleY(0.85);
            opacity: 0.4;
          }
        }

        @keyframes floatBlob {
          0%, 100% {
            transform: scale(1) rotate(0deg);
          }
          50% {
            transform: scale(1.02) rotate(1deg);
          }
        }

        @keyframes floatCloudLeft {
          0%, 100% {
            transform: translateX(0px) translateY(0px);
          }
          50% {
            transform: translateX(-6px) translateY(3px);
          }
        }

        @keyframes floatCloudRight {
          0%, 100% {
            transform: translateX(0px) translateY(0px);
          }
          50% {
            transform: translateX(7px) translateY(-3px);
          }
        }

        @keyframes swayArmLeft {
          0%, 100% {
            transform: rotate(0deg);
          }
          50% {
            transform: rotate(-3.5deg);
          }
        }

        @keyframes swayArmRight {
          0%, 100% {
            transform: rotate(0deg);
          }
          50% {
            transform: rotate(3.5deg);
          }
        }

        @keyframes speedLine {
          0% {
            stroke-dashoffset: 200;
            opacity: 0.2;
          }
          50% {
            opacity: 0.85;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 0.2;
          }
        }

        .animate-character {
          animation: floatCharacter 3.8s ease-in-out infinite;
          transform-origin: 240px 240px;
        }

        .animate-shadow {
          animation: pulseShadow 3.8s ease-in-out infinite;
          transform-origin: 240px 388px;
        }

        .animate-blob {
          animation: floatBlob 6s ease-in-out infinite;
          transform-origin: 240px 220px;
        }

        .animate-cloud-left {
          animation: floatCloudLeft 4.5s ease-in-out infinite;
        }

        .animate-cloud-right {
          animation: floatCloudRight 5.2s ease-in-out infinite;
        }

        .animate-arm-left {
          animation: swayArmLeft 2.4s ease-in-out infinite;
          transform-origin: 175px 225px;
        }

        .animate-arm-right {
          animation: swayArmRight 2.4s ease-in-out infinite;
          transform-origin: 305px 225px;
        }

        .speed-line-1 {
          stroke-dasharray: 40 80;
          animation: speedLine 1.4s linear infinite;
        }

        .speed-line-2 {
          stroke-dasharray: 60 90;
          animation: speedLine 1.1s linear infinite 0.2s;
        }

        .speed-line-3 {
          stroke-dasharray: 30 70;
          animation: speedLine 1.6s linear infinite 0.5s;
        }

        .speed-line-4 {
          stroke-dasharray: 50 100;
          animation: speedLine 1.2s linear infinite 0.3s;
        }

        .speed-line-5 {
          stroke-dasharray: 45 85;
          animation: speedLine 1.5s linear infinite 0.1s;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-character,
          .animate-shadow,
          .animate-blob,
          .animate-cloud-left,
          .animate-cloud-right,
          .animate-arm-left,
          .animate-arm-right,
          .speed-line-1,
          .speed-line-2,
          .speed-line-3,
          .speed-line-4,
          .speed-line-5 {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>

      <svg
        viewBox="0 0 480 420"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible drop-shadow-sm"
        aria-label="404 Skydiving Character Illustration"
        role="img"
      >
        <defs>
          <linearGradient id="pinkSuitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#e11d48" />
          </linearGradient>
          <linearGradient id="blobGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fde8f0" />
            <stop offset="100%" stopColor="#fce7f0" />
          </linearGradient>
        </defs>

        {/* 1. SOFT PINK ABSTRACT BACKGROUND BLOB */}
        <path
          className="animate-blob"
          d="M 110 85 C 190 25, 330 35, 410 85 C 475 125, 465 240, 435 320 C 400 395, 290 415, 210 405 C 120 395, 55 330, 65 240 C 75 150, 60 120, 110 85 Z"
          fill="url(#blobGrad)"
          opacity="0.9"
        />

        {/* 2. DECORATIVE OUTLINED CLOUDS */}
        {/* Top Left Cloud */}
        <g className="animate-cloud-left">
          <path
            d="M 50 145 C 50 135, 62 128, 72 132 C 78 122, 92 122, 98 130 C 108 128, 118 135, 115 145 C 122 152, 118 162, 108 162 L 58 162 C 48 162, 45 152, 50 145 Z"
            fill="#ffffff"
            stroke="#f472b6"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* Bottom Left Cloud */}
        <g className="animate-cloud-left">
          <path
            d="M 75 310 C 75 298, 90 290, 102 295 C 110 282, 128 282, 136 292 C 148 290, 160 298, 158 310 C 166 318, 160 330, 148 330 L 88 330 C 75 330, 70 318, 75 310 Z"
            fill="#ffffff"
            stroke="#f472b6"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* Right Cloud */}
        <g className="animate-cloud-right">
          <path
            d="M 405 270 C 405 262, 415 256, 423 260 C 428 252, 440 252, 445 258 C 453 256, 461 262, 459 270 C 465 276, 461 285, 451 285 L 411 285 C 401 285, 399 276, 405 270 Z"
            fill="#ffffff"
            stroke="#f472b6"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* 3. VERTICAL SPEED / RAIN LINES */}
        <g stroke="#18181b" strokeWidth="2.5" strokeLinecap="round">
          <line x1="165" y1="30" x2="165" y2="180" className="speed-line-1" />
          <line x1="205" y1="15" x2="205" y2="200" className="speed-line-2" />
          <line x1="250" y1="40" x2="250" y2="160" className="speed-line-3" />
          <line x1="295" y1="10" x2="295" y2="190" className="speed-line-4" />
          <line x1="335" y1="50" x2="335" y2="210" className="speed-line-5" />
          <line x1="375" y1="70" x2="375" y2="170" className="speed-line-2" />
        </g>

        {/* 4. SOFT PINK OVAL SHADOW UNDERNEATH */}
        <ellipse
          className="animate-shadow"
          cx="240"
          cy="388"
          rx="82"
          ry="9"
          fill="#f472b6"
          opacity="0.6"
        />

        {/* 5. MAIN SKYDIVING CHARACTER GROUP */}
        <g className="animate-character">
          {/* A. LEGS & FEET (Bent upwards in skydiving pose) */}
          <g>
            {/* Left Leg */}
            <path
              d="M 215 260 Q 200 230 195 190 L 210 185 Q 220 220 230 255 Z"
              fill="#ffffff"
              stroke="#18181b"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Sock stripes */}
            <line x1="197" y1="210" x2="209" y2="207" stroke="#f43f5e" strokeWidth="3" />
            <line x1="199" y1="200" x2="211" y2="197" stroke="#f43f5e" strokeWidth="3" />

            {/* Right Leg */}
            <path
              d="M 265 260 Q 280 230 285 190 L 270 185 Q 260 220 250 255 Z"
              fill="#ffffff"
              stroke="#18181b"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Sock stripes */}
            <line x1="283" y1="210" x2="271" y2="207" stroke="#f43f5e" strokeWidth="3" />
            <line x1="281" y1="200" x2="269" y2="197" stroke="#f43f5e" strokeWidth="3" />

            {/* Left Shoe */}
            <path
              d="M 193 190 C 188 175 195 160 212 165 C 220 168 215 188 210 188 Z"
              fill="url(#pinkSuitGrad)"
              stroke="#18181b"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path
              d="M 191 188 Q 200 170 214 172"
              fill="none"
              stroke="#ffffff"
              strokeWidth="3"
            />

            {/* Right Shoe */}
            <path
              d="M 287 190 C 292 175 285 160 268 165 C 260 168 265 188 270 188 Z"
              fill="url(#pinkSuitGrad)"
              stroke="#18181b"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path
              d="M 289 188 Q 280 170 266 172"
              fill="none"
              stroke="#ffffff"
              strokeWidth="3"
            />
          </g>

          {/* B. BACKPACK / CHUTE VEST BASE */}
          <path
            d="M 200 240 C 200 215 280 215 280 240 C 280 280 200 280 200 240 Z"
            fill="#18181b"
            stroke="#18181b"
            strokeWidth="2.5"
          />

          {/* C. ARMS (Outstretched wide in skydiving pose) */}
          {/* Left Arm */}
          <g className="animate-arm-left">
            <path
              d="M 205 242 L 115 210 Q 102 205 95 218 Q 98 230 115 232 L 198 260 Z"
              fill="#fff1f2"
              stroke="#18181b"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Left Hand & Spread Fingers */}
            <path
              d="M 102 208 C 92 202 85 208 82 216 C 80 222 88 226 96 222 Z"
              fill="#fff1f2"
              stroke="#18181b"
              strokeWidth="2.2"
            />
            {/* Sleeve Cuff */}
            <path
              d="M 180 234 L 182 254"
              stroke="#18181b"
              strokeWidth="2"
            />
          </g>

          {/* Right Arm */}
          <g className="animate-arm-right">
            <path
              d="M 275 242 L 365 210 Q 378 205 385 218 Q 382 230 365 232 L 282 260 Z"
              fill="#fff1f2"
              stroke="#18181b"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Right Hand & Spread Fingers */}
            <path
              d="M 378 208 C 388 202 395 208 398 216 C 400 222 392 226 384 222 Z"
              fill="#fff1f2"
              stroke="#18181b"
              strokeWidth="2.2"
            />
            {/* Sleeve Cuff */}
            <path
              d="M 300 234 L 298 254"
              stroke="#18181b"
              strokeWidth="2"
            />
          </g>

          {/* D. TORSO / PINK SUIT & STRAPS */}
          {/* Pink Athletic Top */}
          <path
            d="M 200 240 C 200 220, 280 220, 280 240 C 285 278, 195 278, 200 240 Z"
            fill="url(#pinkSuitGrad)"
            stroke="#18181b"
            strokeWidth="2.8"
            strokeLinejoin="round"
          />

          {/* White Undershirt Collar */}
          <path
            d="M 222 225 Q 240 236 258 225 Z"
            fill="#ffffff"
            stroke="#18181b"
            strokeWidth="2"
          />

          {/* Black Shoulder Straps */}
          <path
            d="M 215 228 L 222 282"
            stroke="#18181b"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M 265 228 L 258 282"
            stroke="#18181b"
            strokeWidth="5"
            strokeLinecap="round"
          />

          {/* Chest Harness Buckle */}
          <rect
            x="233"
            y="248"
            width="14"
            height="10"
            rx="2"
            fill="#ffffff"
            stroke="#18181b"
            strokeWidth="2"
          />

          {/* E. HEAD & FACE */}
          {/* Hair (Behind Head, Windblown) */}
          <path
            d="M 198 200 C 185 180, 180 145, 210 140 C 215 125, 235 120, 245 135 C 260 125, 275 135, 280 150 C 292 165, 285 190, 280 205 Z"
            fill="#18181b"
            stroke="#18181b"
            strokeWidth="2"
          />

          {/* Face Oval */}
          <path
            d="M 208 205 C 205 185, 275 185, 272 205 C 270 235, 210 235, 208 205 Z"
            fill="#fff1f2"
            stroke="#18181b"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Cute Blushing Cheeks */}
          <ellipse cx="218" cy="216" rx="6" ry="4" fill="#f472b6" opacity="0.6" />
          <ellipse cx="262" cy="216" rx="6" ry="4" fill="#f472b6" opacity="0.6" />

          {/* Surprised "O" Mouth */}
          <ellipse cx="240" cy="222" rx="5" ry="6" fill="#18181b" />

          {/* Cute Small Nose */}
          <path
            d="M 238 214 Q 240 216 242 214"
            fill="none"
            stroke="#18181b"
            strokeWidth="1.8"
            strokeLinecap="round"
          />

          {/* F. SKYDIVING GOGGLES */}
          {/* Goggle Strap */}
          <path
            d="M 200 198 L 280 198"
            stroke="#18181b"
            strokeWidth="4"
          />

          {/* Left Lens */}
          <rect
            x="208"
            y="188"
            width="28"
            height="20"
            rx="7"
            fill="#f0f9ff"
            stroke="#18181b"
            strokeWidth="2.8"
          />
          {/* Left Lens Highlight */}
          <path
            d="M 212 192 L 220 192"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Right Lens */}
          <rect
            x="244"
            y="188"
            width="28"
            height="20"
            rx="7"
            fill="#f0f9ff"
            stroke="#18181b"
            strokeWidth="2.8"
          />
          {/* Right Lens Highlight */}
          <path
            d="M 248 192 L 256 192"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Goggle Bridge */}
          <rect
            x="236"
            y="195"
            width="8"
            height="4"
            rx="1"
            fill="#18181b"
          />

          {/* Cute Eyebrows over Goggles */}
          <path d="M 212 184 Q 222 180 232 185" fill="none" stroke="#18181b" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M 248 185 Q 258 180 268 184" fill="none" stroke="#18181b" strokeWidth="2.2" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
};
