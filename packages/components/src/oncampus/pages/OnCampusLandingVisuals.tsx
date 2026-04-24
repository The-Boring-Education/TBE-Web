import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

/* ─────────────────────────────────────────────
   Types & shared motion helpers
───────────────────────────────────────────── */
interface OnCampusFeatureSectionProps {
  eyebrow: string;
  title: string;
  description: string;
  subheadingLines?: string[];
  reverse?: boolean;
  children: React.ReactNode;
}

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0 },
};

/* ─────────────────────────────────────────────
   Shared VisualCard shell
───────────────────────────────────────────── */
const VisualCard = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#161621] to-[#0d0d14] ${className}`}
  >
    {/* subtle radial red glow in top-right corner */}
    <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-[#ff5757]/8 blur-3xl" />
    {children}
  </div>
);

/* ─────────────────────────────────────────────
   OnCampusFeatureSection  (layout wrapper)
───────────────────────────────────────────── */
export const OnCampusFeatureSection = ({
  eyebrow,
  title,
  description,
  subheadingLines = [],
  reverse = false,
  children,
}: OnCampusFeatureSectionProps) => (
  <motion.section
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, amount: 0.18 }}
    variants={fadeUp}
    transition={{ duration: 0.5, ease: "easeOut" }}
    className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:px-8"
  >
    {/* text column */}
    <div className={reverse ? "lg:order-2" : ""}>
      <span className="inline-block rounded-full border border-[#ff5757]/30 bg-[#ff5757]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#ff8f8f]">
        {eyebrow}
      </span>
      <h3 className="mt-3 text-2xl font-bold leading-tight text-white sm:text-3xl">
        {title}
      </h3>
      <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/65 sm:text-base">
        {description}
      </p>
      {subheadingLines.length ? (
        <ul className="mt-4 inline-flex flex-col space-y-3 text-left text-gray-300">
          {subheadingLines.slice(0, 3).map((line) => (
            <li key={line} className="flex items-center gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span className="text-sm text-white/75">{line}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>

    {/* visual column */}
    <div className={reverse ? "lg:order-1" : ""}>{children}</div>
  </motion.section>
);

/* ─────────────────────────────────────────────
   1. Interview Sheets Visual
───────────────────────────────────────────── */
const SHEETS = [
  { key: "java", label: "Java", category: "Backend", color: "#f89b29" },
  { key: "cpp", label: "C++", category: "Backend", color: "#5c9bd6" },
  { key: "node", label: "Node.js", category: "Backend", color: "#68a063" },
  { key: "python", label: "Python", category: "Backend", color: "#4b8bbe" },
  {
    key: "javascript",
    label: "JavaScript",
    category: "Frontend",
    color: "#f7df1e",
  },
  { key: "react", label: "React", category: "Frontend", color: "#61dafb" },
  {
    key: "database",
    label: "Database",
    category: "Database",
    color: "#ff6b6b",
  },
] as const;

const SHEET_DETAILS: Record<string, string[]> = {
  java: [
    "OOP & Inheritance",
    "Collections Framework",
    "Multithreading & Concurrency",
    "JVM Internals & GC",
  ],
  cpp: [
    "Pointers & Memory",
    "STL Containers",
    "Templates & Generics",
    "RAII & Smart Pointers",
  ],
  node: [
    "Event Loop Deep Dive",
    "Streams & Buffers",
    "Express Middleware Chain",
    "Async / Await Patterns",
  ],
  python: [
    "List Comprehension",
    "Decorators & Closures",
    "GIL & Concurrency",
    "Generators & Itertools",
  ],
  javascript: [
    "Closure & Hoisting",
    "Prototype Chain",
    "Event Loop & Microtasks",
    "ES2024 Features",
  ],
  react: [
    "Hooks Internals",
    "Reconciliation Algorithm",
    "Context API Patterns",
    "Server Components",
  ],
  database: [
    "ACID Properties",
    "Indexing Strategies",
    "SQL Joins & Window Fns",
    "CAP Theorem",
  ],
};

export const InterviewSheetsVisual = () => {
  const [activeKey, setActiveKey] = useState("react");
  const active = (SHEETS.find((s) => s.key === activeKey) || SHEETS[0])!;

  return (
    <VisualCard className="p-5">
      {/* header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#ff5757]/15">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ff7a7a"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </span>
          <span className="text-sm font-semibold text-white">
            Interview Sheets
          </span>
        </div>
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
          style={{ background: `${active.color}22`, color: active.color }}
        >
          {active.category}
        </span>
      </div>

      {/* pill tabs */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {SHEETS.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setActiveKey(s.key)}
            className={`rounded-full border px-3 py-1 text-[11px] font-medium transition-all duration-200 ${
              activeKey === s.key
                ? "border-[#ff5757]/60 bg-[#ff5757]/20 text-white shadow-[0_0_10px_rgba(255,87,87,0.25)]"
                : "border-white/10 bg-white/[0.04] text-white/50 hover:border-white/25 hover:text-white/80"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* content panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeKey}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="mt-4 rounded-xl border border-white/8 bg-white/[0.03] p-4"
        >
          <p
            className="mb-3 text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: active.color }}
          >
            {active.label} — Top Topics
          </p>
          <ul className="space-y-2">
            {SHEET_DETAILS[activeKey]?.map((topic, i) => (
              <li
                key={i}
                className="flex items-center gap-2.5 text-xs text-white/75"
              >
                <span
                  className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
                  style={{ background: active.color }}
                />
                {topic}
              </li>
            ))}
          </ul>
        </motion.div>
      </AnimatePresence>

      {/* CTA row */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-[11px] text-white/35">
          {SHEETS.length} sheets available
        </span>
        <button
          type="button"
          className="rounded-lg border border-[#ff5757]/35 bg-[#ff5757]/12 px-3 py-1.5 text-[11px] font-semibold text-[#ffaaaa] transition hover:bg-[#ff5757]/22 hover:text-white"
        >
          Browse All →
        </button>
      </div>
    </VisualCard>
  );
};

/* ─────────────────────────────────────────────
   2. DSA Preparation Visual
───────────────────────────────────────────── */
const DSA_TOPICS = [
  { label: "Arrays & Strings", problems: 42, done: 31, color: "#ff5757" },
  { label: "Linked Lists", problems: 28, done: 22, color: "#f89b29" },
  { label: "Trees & BST", problems: 35, done: 20, color: "#68a063" },
  { label: "Graphs & BFS/DFS", problems: 30, done: 11, color: "#5c9bd6" },
  { label: "Dynamic Programming", problems: 40, done: 16, color: "#b57bee" },
  { label: "Greedy Algorithms", problems: 20, done: 14, color: "#61dafb" },
];

export const DsaPreparationVisual = () => {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <VisualCard className="p-5">
      {/* header */}
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#ff5757]/15">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ff7a7a"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </span>
        <span className="text-sm font-semibold text-white">
          DSA Preparation
        </span>
        <span className="ml-auto rounded-full bg-[#ff5757]/15 px-2 py-0.5 text-[10px] font-medium text-[#ff8f8f]">
          Roadmap
        </span>
      </div>

      {/* progress bars */}
      <div className="mt-5 space-y-3">
        {DSA_TOPICS.map((topic, i) => {
          const pct = Math.round((topic.done / topic.problems) * 100);
          const isHovered = hovered === i;
          return (
            <div
              key={topic.label}
              className="group cursor-default rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5 transition-colors duration-150 hover:border-white/15 hover:bg-white/[0.06]"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-medium text-white/85">{topic.label}</span>
                <span className="text-white/40">
                  {isHovered
                    ? `${topic.done}/${topic.problems} solved`
                    : `${pct}%`}
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${pct}%` }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.8,
                    delay: i * 0.08,
                    ease: "easeOut",
                  }}
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${topic.color}cc, ${topic.color})`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* summary row */}
      <div className="mt-4 flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2">
        <span className="text-[11px] text-white/45">Total Solved</span>
        <span className="text-sm font-bold text-white">
          {DSA_TOPICS.reduce((s, t) => s + t.done, 0)}
          <span className="text-[11px] font-normal text-white/35">
            /{DSA_TOPICS.reduce((s, t) => s + t.problems, 0)}
          </span>
        </span>
      </div>
    </VisualCard>
  );
};

/* ─────────────────────────────────────────────
   3. Quizzes Visual
───────────────────────────────────────────── */
const QUIZ_QUESTIONS = [
  {
    q: "What is the time complexity of binary search?",
    options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
    correct: 1,
  },
  {
    q: "Which data structure uses LIFO order?",
    options: ["Queue", "Heap", "Stack", "Linked List"],
    correct: 2,
  },
  {
    q: "What does HTTP stand for?",
    options: [
      "HyperText Transfer Protocol",
      "High Transfer Text Protocol",
      "Hyperlink Text Transfer Protocol",
      "HyperText Transit Protocol",
    ],
    correct: 0,
  },
];

export const QuizzesVisual = () => {
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const current = QUIZ_QUESTIONS[qIdx]!;

  const handleSelect = (i: number) => {
    if (answered) return;
    setSelected(i);
    setAnswered(true);
  };

  const handleNext = () => {
    const next = (qIdx + 1) % QUIZ_QUESTIONS.length;
    setQIdx(next);
    setSelected(null);
    setAnswered(false);
  };

  return (
    <VisualCard className="p-5">
      {/* header */}
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#ff5757]/15">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ff7a7a"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </span>
        <span className="text-sm font-semibold text-white">Daily Quiz</span>
        <div className="ml-auto flex items-center gap-1.5">
          {QUIZ_QUESTIONS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-5 rounded-full transition-all duration-300 ${
                i === qIdx
                  ? "bg-[#ff5757]"
                  : i < qIdx
                    ? "bg-[#ff5757]/40"
                    : "bg-white/15"
              }`}
            />
          ))}
        </div>
      </div>

      {/* question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={qIdx}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.22 }}
        >
          <p className="mt-4 text-sm font-medium leading-relaxed text-white/90">
            <span className="mr-2 text-[10px] font-bold uppercase tracking-wider text-[#ff7a7a]">
              Q{qIdx + 1}.
            </span>
            {current.q}
          </p>

          {/* options */}
          <div className="mt-4 space-y-2">
            {current.options.map((opt, i) => {
              const isSelected = selected === i;
              const isCorrect = i === current.correct;
              let style =
                "border-white/10 bg-white/[0.04] text-white/70 hover:border-white/25 hover:bg-white/[0.07]";

              if (answered) {
                if (isCorrect) {
                  style =
                    "border-emerald-400/50 bg-emerald-500/12 text-emerald-300";
                } else if (isSelected && !isCorrect) {
                  style = "border-red-400/50 bg-red-500/12 text-red-300";
                } else {
                  style = "border-white/5 bg-white/[0.02] text-white/30";
                }
              }

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelect(i)}
                  className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-xs transition-all duration-200 ${style} ${answered ? "cursor-default" : "cursor-pointer"}`}
                >
                  <span
                    className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border text-[10px] font-bold ${
                      answered && isCorrect
                        ? "border-emerald-400/60 text-emerald-400"
                        : answered && isSelected
                          ? "border-red-400/60 text-red-400"
                          : "border-white/20 text-white/40"
                    }`}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                  {answered && isCorrect && (
                    <span className="ml-auto text-emerald-400">✓</span>
                  )}
                  {answered && isSelected && !isCorrect && (
                    <span className="ml-auto text-red-400">✗</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* next button */}
          {answered && (
            <motion.button
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              type="button"
              onClick={handleNext}
              className="mt-4 w-full rounded-xl border border-[#ff5757]/35 bg-[#ff5757]/12 py-2 text-xs font-semibold text-[#ffaaaa] transition hover:bg-[#ff5757]/22 hover:text-white"
            >
              Next Question →
            </motion.button>
          )}
        </motion.div>
      </AnimatePresence>
    </VisualCard>
  );
};

/* ─────────────────────────────────────────────
   4. Aptitude Practice Visual
───────────────────────────────────────────── */
const APTITUDE_QS = [
  {
    question:
      "A train travels 360 km at a uniform speed. If the speed had been 10 km/h more, it would have taken 1 hour less. Find the speed.",
    options: [
      { id: "A", text: "50 km/h" },
      { id: "B", text: "60 km/h" },
      { id: "C", text: "72 km/h" },
      { id: "D", text: "45 km/h" },
    ],
    correct: "C",
    explanation:
      "Let speed = v. Time = 360/v. (v+10): 360/(v+10) = 360/v − 1. Solving: v² + 10v − 3600 = 0 → v = 60 km/h.",
  },
  {
    question: "If average of 5 numbers is 45, what is their total?",
    options: [
      { id: "A", text: "200" },
      { id: "B", text: "225" },
      { id: "C", text: "250" },
      { id: "D", text: "215" },
    ],
    correct: "B",
    explanation: "Average = Sum / Count → Sum = 45 × 5 = 225.",
  },
  {
    question:
      "A pipe fills a tank in 6 hours, another in 4 hours. Together, how long to fill the tank?",
    options: [
      { id: "A", text: "2.4 hours" },
      { id: "B", text: "3 hours" },
      { id: "C", text: "2 hours" },
      { id: "D", text: "1.5 hours" },
    ],
    correct: "A",
    explanation:
      "Combined rate = 1/6 + 1/4 = 5/12 per hour → time = 12/5 = 2.4 hours.",
  },
];

export const AptitudeAnswerVisual = () => {
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const current = APTITUDE_QS[qIdx]!;
  const isCorrect = selected === current.correct;

  const handleNext = () => {
    const next = (qIdx + 1) % APTITUDE_QS.length;
    setQIdx(next);
    setSelected(null);
    setShowExplanation(false);
  };

  return (
    <VisualCard className="p-5">
      {/* header */}
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#ff5757]/15">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ff7a7a"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
        </span>
        <span className="text-sm font-semibold text-white">
          Aptitude Practice
        </span>
        <span className="ml-auto text-[11px] text-white/35">
          {qIdx + 1}/{APTITUDE_QS.length}
        </span>
      </div>

      {/* question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={qIdx}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22 }}
        >
          <div className="mt-4 rounded-xl border border-white/8 bg-white/[0.04] p-3">
            <p className="text-xs leading-relaxed text-white/85">
              {current.question}
            </p>
          </div>

          {/* options */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            {current.options.map((opt) => {
              const isSel = selected === opt.id;
              const isAns = opt.id === current.correct;
              let style =
                "border-white/10 bg-white/[0.04] text-white/70 hover:border-white/25";

              if (selected !== null) {
                if (isAns) {
                  style =
                    "border-emerald-400/50 bg-emerald-500/12 text-emerald-300";
                } else if (isSel) {
                  style = "border-red-400/45 bg-red-500/10 text-red-300";
                } else {
                  style = "border-white/5 bg-white/[0.02] text-white/25";
                }
              }

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    if (selected) return;
                    setSelected(opt.id);
                  }}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-medium transition-all duration-200 ${style} ${selected ? "cursor-default" : "cursor-pointer"}`}
                >
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-current text-[10px] font-bold opacity-70">
                    {opt.id}
                  </span>
                  {opt.text}
                </button>
              );
            })}
          </div>

          {/* result */}
          <AnimatePresence>
            {selected !== null && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div
                  className={`mt-3 rounded-xl border p-3 text-xs leading-relaxed ${
                    isCorrect
                      ? "border-emerald-400/35 bg-emerald-500/10 text-emerald-300"
                      : "border-amber-400/35 bg-amber-500/8 text-amber-300"
                  }`}
                >
                  <p className="font-semibold">
                    {isCorrect
                      ? "✓ Correct!"
                      : `✗ Incorrect — Answer is ${current.correct}`}
                  </p>
                  {showExplanation ? (
                    <p className="mt-1 text-[11px] opacity-80">
                      {current.explanation}
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowExplanation(true)}
                      className="mt-1 text-[11px] underline underline-offset-2 opacity-70 hover:opacity-100"
                    >
                      See explanation →
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  className="mt-3 w-full rounded-xl border border-[#ff5757]/35 bg-[#ff5757]/12 py-2 text-xs font-semibold text-[#ffaaaa] transition hover:bg-[#ff5757]/22 hover:text-white"
                >
                  Next Question →
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </VisualCard>
  );
};
