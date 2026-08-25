import React from "react";

export interface PersonalizationLoaderProps {
  /** Main message to display (e.g. "Getting your interests ready...", "Crafting your learning dashboard...") */
  title?: string;
  /** Optional secondary subtitle */
  subtitle?: string;
  /** Whether to render as fixed full-screen overlay or embedded inline */
  fullScreen?: boolean;
  /** Visual color theme: 'light' (default) or 'dark' */
  theme?: "light" | "dark";
  /** Optional custom class name */
  className?: string;
}

export const PersonalizationLoader: React.FC<PersonalizationLoaderProps> = ({
  title = "Crafting your learning dashboard...",
  subtitle,
  fullScreen = true,
  theme = "light",
  className = "",
}) => {
  const isDark = theme === "dark";

  const containerClasses = fullScreen
    ? `fixed inset-0 z-50 ${
        isDark ? "bg-black text-white" : "bg-white text-slate-800"
      } flex flex-col items-center justify-center p-4 text-center font-sans select-none ${className}`
    : `w-full py-12 flex flex-col items-center justify-center p-4 ${
        isDark ? "bg-black text-white" : "text-slate-800"
      } text-center font-sans select-none ${className}`;

  return (
    <div className={containerClasses}>
      <style>{`
        @keyframes tiltSequence1 {
          0% { transform: rotate(0deg) translateY(0px); }
          25% { transform: rotate(-18deg) translateY(-3px); }
          50% { transform: rotate(18deg) translateY(2px); }
          75% { transform: rotate(-8deg) translateY(-1px); }
          100% { transform: rotate(0deg) translateY(0px); }
        }
        @keyframes tiltSequence2 {
          0% { transform: rotate(0deg) translateY(0px); }
          25% { transform: rotate(16deg) translateY(2px); }
          50% { transform: rotate(-16deg) translateY(-3px); }
          75% { transform: rotate(8deg) translateY(1px); }
          100% { transform: rotate(0deg) translateY(0px); }
        }
        @keyframes tiltSequence3 {
          0% { transform: rotate(0deg) translateY(0px); }
          25% { transform: rotate(-14deg) translateY(-2px); }
          50% { transform: rotate(14deg) translateY(3px); }
          75% { transform: rotate(-6deg) translateY(-1px); }
          100% { transform: rotate(0deg) translateY(0px); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }
        .animate-tilt-html { animation: tiltSequence1 3.6s ease-in-out infinite; }
        .animate-tilt-css { animation: tiltSequence2 3.6s ease-in-out 0.5s infinite; }
        .animate-tilt-js { animation: tiltSequence3 3.6s ease-in-out 1s infinite; }
        .animate-glow { animation: pulseGlow 2.5s ease-in-out infinite; }
      `}</style>

      {/* Floating Micro Tech Logos */}
      <div className="relative mb-3 flex items-center justify-center">
        {/* Subtle Ambient Glow */}
        <div
          className={`absolute -inset-4 ${
            isDark
              ? "bg-gradient-to-r from-orange-500/20 via-red-500/20 to-yellow-500/20 blur-2xl"
              : "bg-gradient-to-r from-orange-200/40 via-red-200/40 to-yellow-200/40 blur-xl"
          } rounded-full animate-glow pointer-events-none`}
        />

        <div className="relative flex items-center justify-center gap-3.5 sm:gap-4 p-2">
          {/* HTML5 Icon */}
          <div className="w-7 h-7 sm:w-8 sm:h-8 animate-tilt-html flex items-center justify-center drop-shadow-sm transition-transform">
            <img
              src="https://ik.imagekit.io/riufvimprm/html.png"
              alt="HTML5"
              className="w-full h-full object-contain"
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = "none";
                const parent = target.parentElement;
                if (parent && !parent.querySelector("svg")) {
                  parent.innerHTML = `
                    <svg viewBox="0 0 32 32" class="w-full h-full" fill="none">
                      <path d="M5 3l2.5 24.5L16 30l8.5-2.5L27 3H5z" fill="#E44D26"/>
                      <path d="M16 27.8l6.3-1.8L24.4 5H16v22.8z" fill="#F16529"/>
                      <path d="M16 11.6h-4.3l-.3-3.6H16V5H8.3l.9 10.2H16v-3.6zm0 7.8l-3.3-.9-.2-2.4H9.7l.4 4.5 5.9 1.6V19.4z" fill="#EBEBEB"/>
                      <path d="M16 11.6v3.6h4l-.4 4.2-3.6 1v3.6l5.9-1.6.8-9.8H16zm0-6.6v3h7.4l.3-3H16z" fill="#fff"/>
                    </svg>
                  `;
                }
              }}
            />
          </div>

          {/* CSS3 Icon */}
          <div className="w-7 h-7 sm:w-8 sm:h-8 animate-tilt-css flex items-center justify-center drop-shadow-sm transition-transform">
            <img
              src="https://ik.imagekit.io/riufvimprm/css.png"
              alt="CSS3"
              className="w-full h-full object-contain"
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = "none";
                const parent = target.parentElement;
                if (parent && !parent.querySelector("svg")) {
                  parent.innerHTML = `
                    <svg viewBox="0 0 32 32" class="w-full h-full" fill="none">
                      <path d="M5 3l2.5 24.5L16 30l8.5-2.5L27 3H5z" fill="#1572B6"/>
                      <path d="M16 27.8l6.3-1.8L24.4 5H16v22.8z" fill="#33A9DC"/>
                      <path d="M16 11.6H8.9l-.3-3.6H16V5H5.8l.9 10.2H16v-3.6zm0 7.8l-3.3-.9-.2-2.4H9.7l.4 4.5 5.9 1.6V19.4z" fill="#EBEBEB"/>
                      <path d="M16 11.6v3.6h4.1l-.4 4.2-3.7 1v3.6l5.9-1.6.8-9.8H16zm0-6.6v3h7.5l.3-3H16z" fill="#fff"/>
                    </svg>
                  `;
                }
              }}
            />
          </div>

          {/* JavaScript Icon */}
          <div className="w-7 h-7 sm:w-8 sm:h-8 animate-tilt-js flex items-center justify-center drop-shadow-sm transition-transform">
            <img
              src="https://ik.imagekit.io/riufvimprm/js.png"
              alt="JavaScript"
              className="w-full h-full object-contain rounded-xs"
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = "none";
                const parent = target.parentElement;
                if (parent && !parent.querySelector("svg")) {
                  parent.innerHTML = `
                    <svg viewBox="0 0 32 32" class="w-full h-full" fill="none">
                      <rect width="32" height="32" rx="4" fill="#F7DF1E"/>
                      <path d="M19.5 23.5c.8 1.3 2 2.1 3.8 2.1 1.7 0 2.8-.8 2.8-2 0-1.4-.9-1.9-2.6-2.6l-.9-.4c-2.5-1.1-4.2-2.4-4.2-5.3 0-2.6 2-4.6 5.1-4.6 2.2 0 3.8.8 4.9 2.7l-2.3 1.5c-.6-1-1.3-1.4-2.6-1.4-1.2 0-2 .7-2 1.7 0 1.2.7 1.7 2.3 2.4l.9.4c3 1.3 4.6 2.6 4.6 5.6 0 3.2-2.5 4.9-5.9 4.9-3.3 0-5.4-1.6-6.4-3.7l2.5-1.3zm-8.8.4c.5.9 1 1.6 2 1.6 1.1 0 1.8-.5 1.8-2.3v-12.4h3.1v12.5c0 3.4-2 4.9-4.8 4.9-2.6 0-4.2-1.3-5-3.1l2.9-1.2z" fill="#000"/>
                    </svg>
                  `;
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Title & Subtitle */}
      <h2
        className={`text-xs sm:text-sm font-semibold ${
          isDark ? "text-slate-100" : "text-slate-800"
        } tracking-tight`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`text-[11px] ${
            isDark ? "text-slate-400" : "text-slate-500"
          } mt-1 max-w-xs font-medium leading-relaxed`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};
