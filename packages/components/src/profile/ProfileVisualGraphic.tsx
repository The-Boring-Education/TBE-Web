import React from "react";

export const ProfileVisualGraphic: React.FC<{ className?: string }> = ({
  className = "",
}) => {
  return (
    <div
      className={`relative select-none pointer-events-none flex items-center justify-center ${className}`}
      style={{ width: "220px", height: "140px" }}
    >
      {/* Background Soft Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-32 rounded-full opacity-60 blur-2xl"
        style={{
          background:
            "radial-gradient(circle, rgba(255, 87, 87, 0.35) 0%, rgba(255, 140, 100, 0.15) 60%, transparent 80%)",
        }}
      />

      {/* Main Glassmorphic 3D Card with </> */}
      <div
        className="absolute left-3 top-2 w-28 h-24 rounded-2xl p-3 flex flex-col justify-between shadow-xl transition-transform"
        style={{
          background:
            "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 245, 245, 0.85) 100%)",
          border: "1.5px solid rgba(255, 120, 120, 0.35)",
          boxShadow:
            "0 14px 28px -6px rgba(255, 87, 87, 0.25), 0 0 16px rgba(255, 87, 87, 0.15)",
          transform: "rotate(-4deg) perspective(600px) rotateY(6deg)",
        }}
      >
        {/* Soft card inner header */}
        <div className="flex items-center gap-1.5 opacity-60">
          <div className="w-2 h-2 rounded-full bg-[#FF5757]" />
          <div className="w-2 h-2 rounded-full bg-[#FFB800]" />
          <div className="w-2 h-2 rounded-full bg-[#31AD6B]" />
        </div>

        {/* Large Glowing </> Symbol */}
        <div className="flex items-center justify-center my-auto">
          <span
            className="text-3xl font-black tracking-tighter"
            style={{
              color: "#FF5757",
              textShadow: "0 4px 12px rgba(255, 87, 87, 0.4)",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            }}
          >
            {"</>"}
          </span>
        </div>

        {/* Bottom subtle bar */}
        <div className="w-full bg-[#FF5757]/10 h-1.5 rounded-full overflow-hidden">
          <div className="w-2/3 bg-[#FF5757]/40 h-full rounded-full" />
        </div>
      </div>

      {/* Dark Code Terminal Box (Layered behind & right) */}
      <div
        className="absolute right-7 bottom-3 w-28 h-20 rounded-xl p-2.5 flex flex-col shadow-lg"
        style={{
          background: "linear-gradient(145deg, #1e293b, #0f172a)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 10px 25px -4px rgba(15, 23, 42, 0.4)",
          transform: "rotate(3deg) perspective(600px) rotateY(-4deg)",
        }}
      >
        <div className="flex items-center gap-1 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#eab308]" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
        </div>
        <div className="space-y-1.5 flex-1 flex flex-col justify-center">
          <div className="w-3/4 h-1 rounded-full bg-[#22c55e]/80" />
          <div className="w-1/2 h-1 rounded-full bg-[#38bdf8]/70" />
          <div className="w-5/6 h-1 rounded-full bg-[#f472b6]/70" />
        </div>
      </div>

      {/* Cute Ceramic Plant Pot (Bottom Right Foreground) */}
      <div
        className="absolute right-1 bottom-1 w-10 h-14 flex flex-col items-center justify-end z-10"
        style={{
          filter: "drop-shadow(0 6px 8px rgba(0, 0, 0, 0.15))",
        }}
      >
        {/* Plant Leaves */}
        <div className="relative w-8 h-8 flex items-center justify-center">
          {/* Left leaf */}
          <div
            className="absolute -left-0.5 bottom-1 w-3.5 h-5 rounded-full"
            style={{
              background: "linear-gradient(to top right, #15803d, #4ade80)",
              transform: "rotate(-32deg)",
            }}
          />
          {/* Center leaf */}
          <div
            className="absolute bottom-2 w-3.5 h-6 rounded-full"
            style={{
              background: "linear-gradient(to top, #16a34a, #86efac)",
            }}
          />
          {/* Right leaf */}
          <div
            className="absolute -right-0.5 bottom-1 w-3.5 h-5 rounded-full"
            style={{
              background: "linear-gradient(to top left, #15803d, #4ade80)",
              transform: "rotate(32deg)",
            }}
          />
        </div>

        {/* Minimalist White Pot */}
        <div
          className="w-7 h-6 rounded-b-md shadow-xs flex items-center justify-center"
          style={{
            background: "linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)",
            border: "1px solid #cbd5e1",
          }}
        >
          <div className="w-5 h-0.5 bg-slate-300 rounded-full opacity-60" />
        </div>
      </div>
    </div>
  );
};

export default ProfileVisualGraphic;
