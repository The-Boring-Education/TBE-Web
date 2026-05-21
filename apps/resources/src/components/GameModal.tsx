"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Bomb,
  CheckCircle2,
  ChevronRight,
  Flame,
  RotateCcw,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { GameQuestion, ResourceGame } from "@/lib/types";

const MAX_TIME = 5.0; // 5 seconds per question
const XP_PER_CORRECT = 10;

type GameState = "ticking" | "correct" | "wrong" | "explanation" | "finished";

type Props = {
  game: ResourceGame;
  isOpen: boolean;
  onClose: () => void;
  inline?: boolean;
  onBack?: () => void;
  shareUrl?: string;
};

// Web Audio API Sound Synthesizer (No external asset files needed, 100% reliable)
const playSound = (
  type: "tick" | "correct" | "wrong" | "explosion" | "aha",
) => {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === "tick") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(900, ctx.currentTime);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } else if (type === "correct") {
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.12, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.25);
      });
    } else if (type === "wrong") {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.type = "sawtooth";
      osc2.type = "sawtooth";
      osc1.frequency.setValueAtTime(110, ctx.currentTime);
      osc2.frequency.setValueAtTime(112, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.35);
      osc2.stop(ctx.currentTime + 0.35);
    } else if (type === "explosion") {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(90, now);
      osc.frequency.exponentialRampToValueAtTime(8, now + 0.65);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(now + 0.65);
    } else if (type === "aha") {
      const now = ctx.currentTime;
      [440, 554.37, 659.25, 880].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0.08, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.4);
      });
    }
  } catch (e) {
    // Fail silently if AudioContext is blocked or not supported
  }
};

// Premium, lightweight, high-performance CSS confetti particle explosion
const ConfettiBurst = () => {
  const pieces = Array.from({ length: 40 });
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[40]">
      {pieces.map((_, i) => {
        const angle = Math.random() * 360;
        const distance = 40 + Math.random() * 220;
        const delay = Math.random() * 0.12;
        const size = 6 + Math.random() * 8;
        const colors = [
          "bg-emerald-400",
          "bg-yellow-400",
          "bg-cyan-400",
          "bg-rose-500",
          "bg-violet-400",
          "bg-amber-400",
        ];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const rotation = Math.random() * 720;
        return (
          <motion.div
            key={i}
            className={`absolute rounded-sm ${color} shadow-[0_0_8px_rgba(255,255,255,0.2)]`}
            style={{
              left: "50%",
              top: "40%",
              width: size,
              height: size,
              transform: "translate(-50%, -50%)",
            }}
            initial={{ x: 0, y: 0, scale: 0, rotate: 0, opacity: 1 }}
            animate={{
              x: Math.cos((angle * Math.PI) / 180) * distance,
              y: Math.sin((angle * Math.PI) / 180) * distance - 60,
              scale: [0, 1.4, 0.8, 0],
              rotate: rotation,
              opacity: [1, 1, 0.6, 0],
            }}
            transition={{
              duration: 1.3 + Math.random() * 0.4,
              delay,
              ease: [0.1, 0.8, 0.25, 1],
            }}
          />
        );
      })}
    </div>
  );
};

// Snappy Typewriter text engine for explanations
const TypewriterText = ({
  text,
  onComplete,
}: {
  text: string;
  onComplete?: () => void;
}) => {
  const [displayedText, setDisplayedText] = useState("");
  useEffect(() => {
    let index = 0;
    setDisplayedText("");
    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(index));
      index++;
      if (index >= text.length) {
        clearInterval(interval);
        onComplete?.();
      }
    }, 12);
    return () => clearInterval(interval);
  }, [text, onComplete]);

  return <span className="leading-relaxed text-zinc-100">{displayedText}</span>;
};

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function GameModal({
  game,
  isOpen,
  onClose,
  inline = false,
  onBack,
  shareUrl,
}: Props) {
  const back = onBack || onClose;

  // Preload all character reaction images on mount to ensure zero lag and instant rendering
  useEffect(() => {
    if (typeof window !== "undefined") {
      const imagesToPreload = [
        "/hero_nervous_sweating.png",
        "/hero_correct_thumbs_up.png",
        "/hero_wrong_answer_embarrassed.png",
        "/hero_ohh_got_it_thinking.png",
        "/hero_lose.png",
      ];
      imagesToPreload.forEach((src) => {
        const img = new Image();
        img.src = src;
      });
    }
  }, []);

  const [activeQuestions, setActiveQuestions] = useState<GameQuestion[]>(() => {
    const shuffled = [...game.questions];

    // Fisher-Yates shuffle with proper typing
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = shuffled[i]!;
      shuffled[i] = shuffled[j]!;
      shuffled[j] = temp;
    }

    return shuffled.slice(0, 5);
  });

  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(MAX_TIME);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [gameState, setGameState] = useState<GameState>("ticking");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() =>
    Array(activeQuestions.length).fill(null),
  );

  const total = activeQuestions.length;
  const question: GameQuestion = activeQuestions[current]!;
  const isTimeLow = timeLeft <= 2.0;

  // Track the audio play for ticking
  const lastSecRef = useRef<number>(5);

  // Restart handler
  const handleRestart = () => {
    const shuffled = [...game.questions];

    // Fisher-Yates shuffle with proper typing
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = shuffled[i]!;
      shuffled[i] = shuffled[j]!;
      shuffled[j] = temp;
    }

    const selected = shuffled.slice(0, 5);
    setActiveQuestions(selected);
    setCurrent(0);
    setTimeLeft(MAX_TIME);
    setSelectedOption(null);
    setGameState("ticking");
    setScore(0);
    setStreak(0);
    setAnswers(Array(selected.length).fill(null));
    lastSecRef.current = 5;
  };

  // Reset when open/closed, or when game changes
  useEffect(() => {
    handleRestart();
  }, [isOpen, game]);

  // Main countdown timer ticker
  useEffect(() => {
    if (gameState !== "ticking" || !isOpen) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const next = Math.max(0, prev - 0.05);

        // Play sound on each remaining integer second tick
        const currentSec = Math.ceil(next);
        if (currentSec !== lastSecRef.current && currentSec > 0) {
          playSound("tick");
          lastSecRef.current = currentSec;
        }

        if (next <= 0) {
          clearInterval(interval);
          playSound("explosion");
          setGameState("wrong");
          setStreak(0);
          const updated = [...answers];
          updated[current] = -1; // -1 marks a timeout
          setAnswers(updated);
        }
        return next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [gameState, isOpen, current, answers]);

  // Handle select answer
  const handleSelectOption = (idx: number) => {
    if (gameState !== "ticking") return;
    setSelectedOption(idx);

    const isCorrect = idx === question.correct;
    const updated = [...answers];
    updated[current] = idx;
    setAnswers(updated);

    if (isCorrect) {
      playSound("correct");
      setGameState("correct");
      setScore((s) => s + 1);
      setStreak((st) => st + 1);
    } else {
      playSound("wrong");
      setGameState("wrong");
      setStreak(0);
    }
  };

  // Next Question logic
  const handleNext = () => {
    if (current + 1 >= total) {
      setGameState("finished");
    } else {
      setCurrent((c) => c + 1);
      setSelectedOption(null);
      setTimeLeft(MAX_TIME);
      setGameState("ticking");
      lastSecRef.current = 5;
    }
  };

  const currentShareUrl = shareUrl ?? "";
  const pageLink =
    currentShareUrl ||
    (typeof window !== "undefined" ? window.location.href : "");

  const shareToX = () => {
    const text = encodeURIComponent(
      `I diffused ${score}/${total} bombs in the Ticking Bomb Challenge on "${game.title}"! 💣🔥\n\nPlay the bomb challenge on resources here: `,
    );
    const url = encodeURIComponent(pageLink);
    window.open(
      `https://x.com/intent/tweet?text=${text}&url=${url}`,
      "_blank",
      "width=600,height=450",
    );
  };

  const shareToLinkedIn = () => {
    const url = encodeURIComponent(pageLink);
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      "_blank",
      "width=600,height=450",
    );
  };

  if (!isOpen) return null;

  // Custom styling dynamically injected when playing the game for deep distraction-free mode
  const zenModeStyle = (
    <style
      dangerouslySetInnerHTML={{
        __html: `
      header, footer { display: none !important; }
      main { padding-top: 1rem !important; }
    `,
      }}
    />
  );

  const gamePanel = (
    <div
      className="relative w-full max-w-4xl mx-auto z-10 animate-[fadeIn_0.3s_ease-out]"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Golden/Crimson burning border gradient */}
      <div
        className={`absolute -inset-px rounded-2xl transition-all duration-750 ${
          gameState === "correct"
            ? "bg-gradient-to-b from-emerald-500 via-emerald-600/30 to-transparent shadow-[0_0_30px_rgba(16,185,129,0.2)]"
            : gameState === "wrong"
              ? "bg-gradient-to-b from-rose-600 via-rose-700/30 to-transparent shadow-[0_0_30px_rgba(225,29,72,0.2)]"
              : isTimeLow
                ? "bg-gradient-to-b from-amber-500 via-amber-600/30 to-transparent shadow-[0_0_25px_rgba(245,158,11,0.2)] animate-pulse"
                : "bg-gradient-to-b from-zinc-700/60 via-zinc-800/30 to-transparent"
        }`}
      />

      {/* Grid backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.015] rounded-2xl"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />

      {/* Glowing state backdrop blobs */}
      <AnimatePresence>
        {gameState === "correct" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.12 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute -top-1/4 -right-1/4 h-[400px] w-[400px] rounded-full bg-emerald-500 blur-[130px]"
          />
        )}
        {gameState === "wrong" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute -top-1/4 -right-1/4 h-[400px] w-[400px] rounded-full bg-rose-600 blur-[130px]"
          />
        )}
        {gameState === "ticking" && isTimeLow && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute -top-1/4 -right-1/4 h-[400px] w-[400px] rounded-full bg-amber-500 blur-[130px]"
          />
        )}
      </AnimatePresence>

      <div
        className={`relative flex flex-col rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden transition-all duration-500 ${
          gameState === "ticking" && isTimeLow
            ? "shadow-[inset_0_0_40px_rgba(245,158,11,0.06)] bg-zinc-950/98"
            : ""
        }`}
      >
        {/* Game HUD Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-zinc-900 bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 ring-1 ring-amber-500/30">
              <Bomb className="h-5 w-5 text-amber-500 animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-black text-zinc-100 tracking-wide">
                {game.title}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] font-bold text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-950/50 border border-emerald-900/40">
                  {score * XP_PER_CORRECT} XP
                </span>
                {streak >= 2 && (
                  <motion.span
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="flex items-center gap-0.5 text-[11px] font-black text-orange-400 px-1.5 py-0.5 rounded bg-orange-950/50 border border-orange-900/40"
                  >
                    <Flame className="h-3 w-3 fill-orange-500" />
                    {streak} Streak!
                  </motion.span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={back}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300 ring-1 ring-zinc-900 transition-all"
            title="Exit game"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Ticking Time Bar & Progress Dot HUD */}
        {gameState !== "finished" && (
          <div className="w-full bg-zinc-950">
            {/* 5s Ticking Progress Bar */}
            <div className="h-2 w-full bg-zinc-900 overflow-hidden relative">
              <motion.div
                className={`h-full rounded-r-full ${
                  gameState === "correct"
                    ? "bg-emerald-500"
                    : gameState === "wrong"
                      ? "bg-rose-500"
                      : isTimeLow
                        ? "bg-gradient-to-r from-amber-500 to-rose-600"
                        : "bg-gradient-to-r from-emerald-500 to-amber-500"
                }`}
                style={{ width: `${(timeLeft / MAX_TIME) * 100}%` }}
                transition={{ ease: "linear", duration: 0.05 }}
              />
            </div>

            {/* Question indices display */}
            <div className="flex items-center justify-between px-6 pt-3 pb-1 text-xs text-zinc-500">
              <span>
                QUESTION{" "}
                <strong className="text-zinc-300">{current + 1}</strong> OF{" "}
                <strong className="text-zinc-300">{total}</strong>
              </span>
              <div className="flex gap-1.5">
                {answers.map((ans, idx) => {
                  let indicatorClass =
                    "h-1.5 w-4 rounded-full transition-colors ";
                  if (ans === null) {
                    indicatorClass +=
                      idx === current ? "bg-zinc-400" : "bg-zinc-800";
                  } else if (ans === -1) {
                    indicatorClass += "bg-rose-600 animate-pulse";
                  } else {
                    indicatorClass +=
                      ans === activeQuestions[idx]!.correct
                        ? "bg-emerald-500"
                        : "bg-rose-500";
                  }
                  return <div key={idx} className={indicatorClass} />;
                })}
              </div>
            </div>
          </div>
        )}

        {/* Immersive Game Core Screen */}
        <div className="px-4 py-4 md:px-6 md:py-6 flex-1 flex flex-col justify-center min-h-[290px] md:min-h-[360px]">
          {gameState !== "finished" && gameState !== "explanation" ? (
            <div className="w-full flex flex-col justify-between h-full">
              {/* Top Panel: Timer Circle & Question Text */}
              <div className="w-full">
                {gameState === "ticking" && (
                  <div className="flex justify-center mb-4">
                    <motion.div
                      className={`relative flex flex-col items-center justify-center h-16 w-16 rounded-full border-2 transition-colors ${
                        isTimeLow
                          ? "border-rose-500 bg-rose-950/20 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                          : "border-amber-500 bg-amber-950/20 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.15)]"
                      }`}
                      animate={
                        isTimeLow
                          ? { scale: [1, 1.1, 1], rotate: [-2, 2, -2] }
                          : {}
                      }
                      transition={{ repeat: Infinity, duration: 0.35 }}
                    >
                      <Bomb
                        className={`h-4.5 w-4.5 mb-0.5 ${isTimeLow ? "animate-bounce" : ""}`}
                      />
                      <span className="text-xs font-black tracking-tighter">
                        {timeLeft.toFixed(1)}s
                      </span>
                    </motion.div>
                  </div>
                )}

                {/* Correct State banner */}
                {gameState === "correct" && (
                  <div className="flex flex-col items-center justify-center mb-5">
                    <ConfettiBurst />
                    <motion.div
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 ring-2 ring-emerald-500/30 text-emerald-400 text-2xl font-black mb-2 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                    >
                      ✓
                    </motion.div>
                    <h3 className="text-lg font-black text-emerald-400 tracking-wide uppercase">
                      Correct! +10 XP
                    </h3>
                  </div>
                )}

                {/* Wrong/Timeout banner */}
                {gameState === "wrong" && (
                  <div className="flex flex-col items-center justify-center mb-5">
                    <motion.div
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-600/10 ring-2 ring-rose-600/30 text-rose-500 text-2xl font-black mb-2"
                    >
                      ✗
                    </motion.div>
                    <h3 className="text-lg font-black text-rose-500 tracking-wide uppercase">
                      {selectedOption === null
                        ? "💥 BOOM! Time's Up"
                        : "Oops! Wrong Answer"}
                    </h3>

                    {/* View Explanation Button for wrong answers */}
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => {
                        setGameState("explanation");
                        playSound("aha");
                      }}
                      className="mt-4 flex items-center gap-1.5 sm:gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 px-3.5 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-bold shadow-[0_4px_14px_rgba(245,158,11,0.3)] transition-all active:scale-[0.97]"
                    >
                      <span>Explain Concept 💡</span>
                      <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                    </motion.button>
                  </div>
                )}

                {/* Question */}
                <div className="mb-4 text-center max-w-2xl mx-auto">
                  <h2 className="text-lg md:text-xl font-bold text-zinc-100 leading-relaxed">
                    {question.question}
                  </h2>
                </div>
              </div>

              {/* Middle Panel: Options (Meme Choice Buttons) & Character Reaction */}
              <div className="w-full flex flex-col md:flex-row gap-6 md:gap-8 items-center justify-between mt-2">
                {/* 2-Column Meme Button Grid */}
                <div className="flex-1 w-full grid grid-cols-2 gap-3.5 sm:gap-4 md:gap-5">
                  {question.options.map((opt, idx) => {
                    const isSelected = selectedOption === idx;
                    const isCorrect = idx === question.correct;
                    const revealed = gameState !== "ticking";
                    const isLastOdd =
                      question.options.length % 2 !== 0 &&
                      idx === question.options.length - 1;

                    // Meme choice panel styling (more compact on mobile as requested)
                    let plateClass =
                      "group w-full rounded-xl sm:rounded-2xl p-2 pt-3.5 pb-2.5 sm:p-3.5 sm:pt-5 sm:pb-4 flex flex-col items-center justify-between text-center transition-all duration-300 select-none border-t border-l border-r border-b-4 sm:border-b-[6px] relative overflow-hidden ";

                    if (!revealed) {
                      plateClass +=
                        "bg-gradient-to-b from-zinc-50 to-zinc-200 border-t-white border-l-zinc-100 border-r-zinc-300 border-b-zinc-400 text-zinc-900 cursor-pointer shadow-[0_4px_0_rgba(150,150,150,0.85),0_8px_14px_rgba(0,0,0,0.3)] sm:shadow-[0_6px_0_rgba(150,150,150,0.85),0_12px_20px_rgba(0,0,0,0.35)] hover:from-white hover:to-zinc-100 hover:shadow-[0_6px_0_rgba(150,150,150,0.85),0_12px_20px_rgba(0,0,0,0.35)] sm:hover:shadow-[0_8px_0_rgba(150,150,150,0.85),0_16px_24px_rgba(0,0,0,0.4)] active:translate-y-[2.5px] sm:active:translate-y-[4px] active:border-b-[1.5px] sm:active:border-b-[2px] active:shadow-[0_1.5px_0_rgba(150,150,150,0.85),0_4px_8px_rgba(0,0,0,0.25)] sm:active:shadow-[0_2px_0_rgba(150,150,150,0.85),0_6px_12px_rgba(0,0,0,0.3)]";
                    } else if (isCorrect) {
                      plateClass +=
                        "bg-gradient-to-b from-emerald-50 to-emerald-100 border-t-emerald-200 border-l-emerald-100 border-r-emerald-300 border-b-emerald-450 text-emerald-950 shadow-[0_4px_0_#10b981,0_8px_14px_rgba(16,185,129,0.15)] sm:shadow-[0_6px_0_#10b981,0_12px_20px_rgba(16,185,129,0.2)]";
                    } else if (isSelected && !isCorrect) {
                      plateClass +=
                        "bg-gradient-to-b from-rose-50 to-rose-100 border-t-rose-200 border-l-rose-100 border-r-rose-300 border-b-rose-450 text-rose-950 shadow-[0_4px_0_#f43f5e,0_8px_14px_rgba(244,63,94,0.15)] sm:shadow-[0_6px_0_#f43f5e,0_12px_20px_rgba(244,63,94,0.2)] animate-[shake_0.4s_ease-in-out]";
                    } else {
                      plateClass +=
                        "opacity-30 bg-gradient-to-b from-zinc-900 to-zinc-950 border-zinc-800 border-b-zinc-950 text-zinc-500 shadow-none pointer-events-none";
                    }

                    if (isLastOdd) {
                      plateClass += " col-span-2 max-w-md mx-auto";
                    }

                    // 3D mechanical circular red button styling inside the panel (made small & highly proportional as requested)
                    let buttonClass =
                      "w-7 h-7 sm:w-10 sm:h-10 rounded-full transition-all duration-300 relative flex items-center justify-center select-none shrink-0 border-b-[3px] sm:border-b-4 ";

                    if (!revealed) {
                      buttonClass +=
                        "bg-gradient-to-t from-red-700 via-red-500 to-red-400 border-red-800 shadow-[inset_0_2px_3px_rgba(255,255,255,0.45),0_3px_6px_rgba(0,0,0,0.4)] group-hover:from-red-650 group-hover:to-red-350 group-active:translate-y-[2px] group-active:border-b-[1px] group-active:shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.3),0_1.5px_0_#900,0_3px_4px_rgba(0,0,0,0.3)]";
                    } else if (isCorrect) {
                      buttonClass +=
                        "bg-gradient-to-t from-emerald-600 via-emerald-50 to-emerald-450 border-emerald-700 shadow-[inset_0_2px_3px_rgba(255,255,255,0.4),0_1.5px_0_#065f46,0_6px_8px_rgba(16,185,129,0.2)] border-b-[2px] translate-y-[1.5px]";
                    } else if (isSelected && !isCorrect) {
                      buttonClass +=
                        "bg-gradient-to-t from-rose-700 via-rose-500 to-rose-450 border-rose-800 shadow-[inset_0_2px_3px_rgba(255,255,255,0.4),0_1.5px_0_#9f1239,0_6px_8px_rgba(244,63,94,0.2)] border-b-[2px] translate-y-[1.5px]";
                    } else {
                      buttonClass +=
                        "bg-gradient-to-t from-zinc-700 to-zinc-650 border-zinc-800 border-b-[1px] shadow-none opacity-50";
                    }

                    // Screw Heads in the four corners
                    const Screws = () => {
                      const screwColorClass = revealed
                        ? isCorrect
                          ? "bg-emerald-200 border-emerald-300"
                          : isSelected
                            ? "bg-rose-200 border-rose-300"
                            : "bg-zinc-800 border-zinc-750"
                        : "bg-zinc-300 border-zinc-400";
                      const slotColorClass = revealed
                        ? isCorrect
                          ? "bg-emerald-500/60"
                          : isSelected
                            ? "bg-rose-500/60"
                            : "bg-zinc-600/40"
                        : "bg-zinc-500";

                      return (
                        <>
                          <div
                            className={`absolute top-2 left-2 w-2 h-2 rounded-full border shadow-inner flex items-center justify-center ${screwColorClass}`}
                          >
                            <div
                              className={`w-1.5 h-[1px] rotate-45 ${slotColorClass}`}
                            />
                          </div>
                          <div
                            className={`absolute top-2 right-2 w-2 h-2 rounded-full border shadow-inner flex items-center justify-center ${screwColorClass}`}
                          >
                            <div
                              className={`w-1.5 h-[1px] -rotate-45 ${slotColorClass}`}
                            />
                          </div>
                          <div
                            className={`absolute bottom-2 left-2 w-2 h-2 rounded-full border shadow-inner flex items-center justify-center ${screwColorClass}`}
                          >
                            <div
                              className={`w-1.5 h-[1px] -rotate-45 ${slotColorClass}`}
                            />
                          </div>
                          <div
                            className={`absolute bottom-2 right-2 w-2 h-2 rounded-full border shadow-inner flex items-center justify-center ${screwColorClass}`}
                          >
                            <div
                              className={`w-1.5 h-[1px] rotate-45 ${slotColorClass}`}
                            />
                          </div>
                        </>
                      );
                    };

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(idx)}
                        disabled={revealed}
                        className={plateClass}
                      >
                        <Screws />

                        {/* Option text at the top */}
                        <span className="font-extrabold text-[10.5px] xs:text-xs sm:text-sm text-center leading-snug tracking-tight mb-2.5 sm:mb-4 flex-1 flex items-center justify-center">
                          {opt}
                        </span>

                        {/* Circular 3D arcade button at the bottom */}
                        <div className={buttonClass}>
                          {/* Shining glow highlight */}
                          <div className="absolute top-0.5 left-1 sm:left-1.5 w-2 sm:w-2.5 h-[2px] sm:h-[3px] rounded-full bg-white/40 blur-[0.3px]" />
                          <span className="text-white text-[9px] sm:text-xs font-black drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.65)]">
                            {revealed
                              ? isCorrect
                                ? "✓"
                                : isSelected
                                  ? "✗"
                                  : String.fromCharCode(65 + idx)
                              : String.fromCharCode(65 + idx)}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Character Reaction display (scaled up dramatically to be very big) */}
                <div className="w-full md:w-72 flex justify-center items-center h-44 sm:h-56 md:h-64 lg:h-72 relative shrink-0">
                  <AnimatePresence mode="wait">
                    {/* Nervous / Sweating State when timer ticking down */}
                    {gameState === "ticking" && (
                      <motion.img
                        key="sweating"
                        src="/hero_nervous_sweating.png"
                        alt="Nervous Hero"
                        className="h-full object-contain"
                        initial={{ opacity: 0, y: 15 }}
                        animate={
                          isTimeLow
                            ? {
                                opacity: 1,
                                y: 0,
                                x: [0, -1.5, 1.5, -1.5, 1.5, 0],
                                rotate: [0, -0.6, 0.6, -0.6, 0.6, 0],
                              }
                            : { opacity: 1, y: 0 }
                        }
                        exit={{ opacity: 0, y: -15 }}
                        transition={
                          isTimeLow
                            ? {
                                x: { repeat: Infinity, duration: 0.1 },
                                rotate: { repeat: Infinity, duration: 0.1 },
                                opacity: { duration: 0.25 },
                              }
                            : { duration: 0.25 }
                        }
                      />
                    )}

                    {/* Correct Reaction */}
                    {gameState === "correct" && (
                      <motion.img
                        key="thumbsup"
                        src="/hero_correct_thumbs_up.png"
                        alt="Thumbs Up Hero"
                        className="h-full object-contain"
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1.06, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{
                          type: "spring",
                          stiffness: 270,
                          damping: 14,
                        }}
                      />
                    )}

                    {/* Wrong / Embarrassed Reaction */}
                    {gameState === "wrong" && (
                      <motion.img
                        key="embarrassed"
                        src="/hero_wrong_answer_embarrassed.png"
                        alt="Embarrassed Hero"
                        className="h-full object-contain origin-bottom"
                        initial={{ opacity: 0, rotate: -4, y: 15, scale: 0.9 }}
                        animate={{
                          opacity: 1,
                          rotate: 0,
                          y: 0,
                          scale: 1.38, // Scaled up to be extra huge and prominent!
                          x: [0, -4, 4, -4, 4, 0],
                        }}
                        exit={{ opacity: 0, y: -15, scale: 0.9 }}
                        transition={{
                          duration: 0.45,
                          x: { duration: 0.35, ease: "easeOut" },
                          scale: {
                            type: "spring",
                            stiffness: 200,
                            damping: 12,
                          },
                        }}
                      />
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Bottom Row Actions for correct answers */}
              <div className="w-full flex justify-end mt-5 border-t border-zinc-900 pt-3">
                {gameState === "correct" && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={handleNext}
                    className="flex items-center gap-1.5 sm:gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-3.5 py-2 sm:px-6 sm:py-3 text-xs sm:text-base font-bold text-white shadow-lg shadow-emerald-500/10 active:scale-[0.98] transition-all"
                  >
                    <span>
                      {current + 1 === total ? "See Results" : "Next Question"}
                    </span>
                    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                  </motion.button>
                )}
              </div>
            </div>
          ) : gameState === "explanation" ? (
            /* Explanation Screen Layout (Speech bubble above character looking up) */
            <div className="w-full flex flex-col justify-between items-center h-full">
              {/* Typewriter Explanation speech bubble */}
              <motion.div
                initial={{ opacity: 0, y: -15, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-8 shadow-xl"
              >
                {/* Speech Bubble Arrow pointing down to the character */}
                <div className="absolute bottom-[-10px] right-[45%] md:right-[15%] h-5 w-5 rotate-45 bg-zinc-900 border-r border-b border-zinc-800" />

                <div className="flex items-start gap-2.5">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-amber-500/10 text-amber-400 text-xs font-bold mt-0.5">
                    💡
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-amber-400 mb-1 tracking-wider">
                      OHH GOT IT! CONCEPT UNLOCKED
                    </h4>
                    <p className="text-sm text-zinc-200 leading-relaxed font-semibold">
                      <TypewriterText
                        text={
                          question.explanation || "No explanation provided."
                        }
                      />
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Character & Next Button bottom row */}
              <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6 mt-4">
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <Zap className="h-4 w-4 text-zinc-500 animate-pulse" />
                  <span>Superhero learning moment achieved</span>
                </div>

                <div className="flex items-center gap-3 sm:gap-6">
                  {/* Character looking up pose (scaled up to be very large on mobile & desktop) */}
                  <div className="h-32 sm:h-44 md:h-52 flex items-center justify-center shrink-0">
                    <motion.img
                      src="/hero_ohh_got_it_thinking.png"
                      alt="Thinking Hero"
                      className="h-full object-contain origin-bottom"
                      initial={{ y: 20, opacity: 0, scale: 0.9 }}
                      animate={{ y: 0, opacity: 1, scale: 1.18 }} // Extra scaling to show beautifully large
                      transition={{
                        type: "spring",
                        stiffness: 130,
                        damping: 12,
                      }}
                    />
                  </div>

                  {/* Next Button / Got It Button */}
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={handleNext}
                    className="flex items-center gap-1.5 sm:gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-3.5 py-2 sm:px-6 sm:py-3 text-xs sm:text-base font-bold text-zinc-950 shadow-lg shadow-amber-500/15 active:scale-[0.98] transition-all z-10"
                  >
                    <span>
                      {current + 1 === total
                        ? "See Results"
                        : "Got It, Next! 👍"}
                    </span>
                    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                  </motion.button>
                </div>
              </div>
            </div>
          ) : (
            /* Results Screen */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center py-8 px-6 text-center"
            >
              {/* Victory / Defeat character reaction illustration */}
              <div className="h-36 sm:h-44 md:h-52 flex items-center justify-center mb-5 shrink-0">
                <motion.img
                  src={
                    score / total > 0.5
                      ? "/hero_correct_thumbs_up.png"
                      : "/hero_lose.png"
                  }
                  alt={score / total > 0.5 ? "Victory" : "Lose"}
                  className="h-full object-contain origin-bottom"
                  initial={{ scale: 0.8, opacity: 0, y: 15 }}
                  animate={{ scale: 1.05, opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 150, damping: 12 }}
                />
              </div>

              <p className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase mb-1">
                Challenge Finished
              </p>
              <h2
                className={`text-2xl font-black tracking-tight mb-2 ${score / total > 0.5 ? "text-amber-400" : "text-rose-500"}`}
              >
                {score / total > 0.5
                  ? "React Interview Bomb Defused!"
                  : "Oops! The Bomb Exploded!"}
              </h2>

              <p className="text-5xl font-black text-zinc-100 mb-2">
                {score * XP_PER_CORRECT}
                <span className="text-xl font-bold text-zinc-500 ml-1">
                  XP Earned
                </span>
              </p>

              <div className="text-sm text-zinc-400 mb-6 font-semibold">
                You successfully got{" "}
                <span className="text-zinc-200 font-black">{score}</span> out of{" "}
                <span className="text-zinc-200 font-black">{total}</span> bombs
                diffused! 💣
              </div>

              {/* Performance Stats Cards */}
              <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-6">
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3">
                  <div className="text-zinc-500 text-[10px] font-bold uppercase mb-1">
                    Accuracy
                  </div>
                  <div className="text-lg font-black text-zinc-200">
                    {Math.round((score / total) * 100)}%
                  </div>
                </div>
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3">
                  <div className="text-zinc-500 text-[10px] font-bold uppercase mb-1">
                    Performance
                  </div>
                  <div className="text-lg font-black text-zinc-200">
                    {score === total
                      ? "Flawless 👑"
                      : score >= 3
                        ? "Superb ⚡"
                        : "Keep Practicing"}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleRestart}
                  className="flex items-center justify-center gap-2 rounded-xl bg-zinc-900 border border-zinc-800 px-6 py-3 text-sm font-bold text-zinc-200 hover:bg-zinc-800 hover:text-white transition-all active:scale-[0.98]"
                >
                  <RotateCcw className="h-4.5 w-4.5" />
                  Retry Challenge
                </button>
                <button
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-6 py-3 text-sm font-bold text-emerald-400 hover:bg-emerald-500/20 transition-all active:scale-[0.98]"
                >
                  <CheckCircle2 className="h-4.5 w-4.5" />
                  Finish
                </button>
              </div>

              {/* Share actions */}
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center w-full max-w-xs">
                <button
                  type="button"
                  onClick={shareToX}
                  className="flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/60 px-4 py-2.5 text-sm text-zinc-300 transition hover:border-zinc-500 hover:text-white active:scale-[0.98] w-full"
                >
                  <XIcon className="h-4 w-4 shrink-0" />
                  Share on X
                </button>
                <button
                  type="button"
                  onClick={shareToLinkedIn}
                  className="flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/60 px-4 py-2.5 text-sm text-zinc-300 transition hover:border-zinc-500 hover:text-white active:scale-[0.98] w-full"
                >
                  <span className="text-base font-black text-zinc-300">in</span>
                  Share on LinkedIn
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer info (only on active play screens) */}
        {gameState !== "finished" && gameState !== "explanation" && (
          <div className="px-6 py-3 border-t border-zinc-900 bg-zinc-950/40 text-center text-[10px] text-zinc-600">
            High-speed decision zone. Tap a button before the fuse burns out!
          </div>
        )}

        {/* Hidden preloaded assets in DOM to force browser decoding and instant flicker-free swap */}
        <div className="hidden" aria-hidden="true">
          <img src="/hero_nervous_sweating.png" alt="" />
          <img src="/hero_correct_thumbs_up.png" alt="" />
          <img src="/hero_wrong_answer_embarrassed.png" alt="" />
          <img src="/hero_ohh_got_it_thinking.png" alt="" />
          <img src="/hero_lose.png" alt="" />
        </div>
      </div>
    </div>
  );

  if (inline) {
    return (
      <div className="mt-0 sm:mt-6 mx-auto w-full max-w-4xl">
        {zenModeStyle}
        <div className="mb-4 hidden sm:flex items-center justify-between px-4 sm:px-0">
          <button
            onClick={back}
            className="text-sm text-zinc-400 hover:text-zinc-200 underline"
          >
            ← Back to Resource
          </button>
        </div>
        {gamePanel}
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-stretch sm:items-center justify-center p-0 sm:p-6 md:p-8"
      >
        {zenModeStyle}
        <div
          className="absolute inset-0 bg-zinc-950/90 backdrop-blur-sm"
          onClick={onClose}
        />
        {gamePanel}
      </motion.div>
    </AnimatePresence>
  );
}
