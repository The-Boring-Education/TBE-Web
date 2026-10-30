import React from "react";

export const DsaHeroIllustration: React.FC<{ className?: string }> = ({
  className = "w-48 sm:w-60 lg:w-72 h-auto",
}) => {
  return (
    <div className={`relative select-none pointer-events-none ${className}`}>
      <svg
        viewBox="0 0 320 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-sm"
      >
        <defs>
          {/* Laptop Gradients */}
          <linearGradient
            id="laptopLid"
            x1="120"
            y1="20"
            x2="220"
            y2="120"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#FF5757" />
            <stop offset="100%" stopColor="#E02626" />
          </linearGradient>

          <linearGradient
            id="laptopScreen"
            x1="130"
            y1="30"
            x2="210"
            y2="105"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#FF6B6B" />
            <stop offset="100%" stopColor="#C91818" />
          </linearGradient>

          <linearGradient
            id="laptopBase"
            x1="100"
            y1="110"
            x2="240"
            y2="140"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#FF4747" />
            <stop offset="100%" stopColor="#B31212" />
          </linearGradient>

          {/* Badge Gradients */}
          <linearGradient
            id="jsGrad"
            x1="15"
            y1="40"
            x2="50"
            y2="75"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#FACC15" />
            <stop offset="100%" stopColor="#EAB308" />
          </linearGradient>

          <linearGradient
            id="cppGrad"
            x1="170"
            y1="5"
            x2="210"
            y2="40"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>

          <linearGradient
            id="dsaGrad"
            x1="240"
            y1="70"
            x2="285"
            y2="110"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#C084FC" />
            <stop offset="100%" stopColor="#9333EA" />
          </linearGradient>

          <linearGradient
            id="bracketGrad"
            x1="225"
            y1="125"
            x2="255"
            y2="155"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#F472B6" />
            <stop offset="100%" stopColor="#DB2777" />
          </linearGradient>

          {/* Shadows */}
          <filter id="badgeShadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow
              dx="0"
              dy="4"
              stdDeviation="4"
              floodColor="#000000"
              floodOpacity="0.08"
            />
          </filter>
        </defs>

        {/* Ambient shadow underneath laptop */}
        <ellipse
          cx="170"
          cy="142"
          rx="72"
          ry="12"
          fill="#E2E8F0"
          fillOpacity="0.6"
          className="dark:fill-[#1a1a20]"
        />

        {/* Decorative sparkles / dashes */}
        <circle cx="95" cy="40" r="1.5" fill="#FF8080" />
        <circle cx="85" cy="55" r="2" fill="#CBD5E1" />
        <path
          d="M78 80 L73 85"
          stroke="#FF4D4D"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M265 35 L270 30"
          stroke="#FF4D4D"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="280" cy="50" r="1.5" fill="#FACC15" />

        {/* 3D Isometric Laptop */}
        {/* Base */}
        <path
          d="M102 126 C100 128, 102 133, 110 134 L228 134 C236 133, 238 128, 236 126 L220 115 L118 115 Z"
          fill="url(#laptopBase)"
        />
        {/* Trackpad area */}
        <path
          d="M150 126 L188 126 L186 130 L152 130 Z"
          fill="#FF7878"
          fillOpacity="0.6"
        />

        {/* Laptop Screen / Lid (Tilted back) */}
        <path
          d="M124 32 C124 28, 127 25, 131 25 L211 25 C215 25, 218 28, 218 32 L221 116 L121 116 Z"
          fill="url(#laptopLid)"
          filter="url(#badgeShadow)"
        />
        {/* Inner Screen Display */}
        <path
          d="M129 32 C129 30, 131 28, 133 28 L209 28 C211 28, 213 30, 213 32 L216 109 L126 109 Z"
          fill="url(#laptopScreen)"
        />
        {/* Screen Content: </> */}
        <g transform="translate(142, 52)">
          {/* < */}
          <path
            d="M15 16 L6 25 L15 34"
            stroke="#FFFFFF"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* / */}
          <path
            d="M32 12 L22 38"
            stroke="#FFFFFF"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* > */}
          <path
            d="M40 16 L49 25 L40 34"
            stroke="#FFFFFF"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* Floating Badges */}
        {/* 1. Yellow JS Badge (Left) */}
        <g transform="translate(20, 52)" filter="url(#badgeShadow)">
          <rect
            x="0"
            y="0"
            width="34"
            height="34"
            rx="8"
            transform="rotate(-8 17 17)"
            fill="url(#jsGrad)"
          />
          <text
            x="9"
            y="23"
            transform="rotate(-8 17 17)"
            fill="#FFFFFF"
            fontSize="14"
            fontWeight="900"
            fontFamily="system-ui, sans-serif"
          >
            JS
          </text>
        </g>

        {/* 2. Blue C++ Badge (Top Right) */}
        <g transform="translate(172, 10)" filter="url(#badgeShadow)">
          <rect
            x="0"
            y="0"
            width="42"
            height="26"
            rx="7"
            transform="rotate(6 21 13)"
            fill="url(#cppGrad)"
          />
          <text
            x="7"
            y="18"
            transform="rotate(6 21 13)"
            fill="#FFFFFF"
            fontSize="12"
            fontWeight="900"
            fontFamily="system-ui, sans-serif"
          >
            C++
          </text>
        </g>

        {/* 3. Purple DSA Pill Badge (Far Right) */}
        <g transform="translate(244, 76)" filter="url(#badgeShadow)">
          <rect
            x="0"
            y="0"
            width="46"
            height="26"
            rx="13"
            transform="rotate(-4 23 13)"
            fill="url(#dsaGrad)"
          />
          <text
            x="9"
            y="18"
            transform="rotate(-4 23 13)"
            fill="#FFFFFF"
            fontSize="12"
            fontWeight="900"
            fontFamily="system-ui, sans-serif"
          >
            DSA
          </text>
        </g>

        {/* 4. Pink Bracket {} Badge (Bottom Right) */}
        <g transform="translate(232, 126)" filter="url(#badgeShadow)">
          <rect
            x="0"
            y="0"
            width="28"
            height="28"
            rx="7"
            transform="rotate(4 14 14)"
            fill="url(#bracketGrad)"
          />
          <text
            x="8"
            y="19"
            transform="rotate(4 14 14)"
            fill="#FFFFFF"
            fontSize="14"
            fontWeight="900"
            fontFamily="system-ui, sans-serif"
          >
            &#123;&#125;
          </text>
        </g>
      </svg>
    </div>
  );
};
