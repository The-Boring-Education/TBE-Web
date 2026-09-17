import { useCallback, useEffect, useRef, useState } from "react";

type Mode = "manual" | "balanced";

interface StackItem {
  id: number;
  value: string;
}

let ID = 1;
const nid = () => ID++;

const PAIRS: Record<string, string> = { ")": "(", "]": "[", "}": "{" };

interface BalancedStep {
  stack: StackItem[];
  cursor: number;
  status: "push" | "pop" | "ok" | "mismatch" | "done";
  description: string;
  ok?: boolean;
}

function generateBalancedSteps(input: string): BalancedStep[] {
  const steps: BalancedStep[] = [];
  const stack: StackItem[] = [];
  steps.push({
    stack: [...stack],
    cursor: -1,
    status: "ok",
    description: `Start — s = "${input}"`,
  });
  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i]!;
    if (ch === "(" || ch === "[" || ch === "{") {
      const item = { id: nid(), value: ch };
      stack.push(item);
      steps.push({
        stack: [...stack],
        cursor: i,
        status: "push",
        description: `Push '${ch}' onto stack`,
      });
    } else if (ch === ")" || ch === "]" || ch === "}") {
      const top = stack[stack.length - 1];
      if (!top || top.value !== PAIRS[ch]) {
        steps.push({
          stack: [...stack],
          cursor: i,
          status: "mismatch",
          description: `Mismatch: got '${ch}', top='${top?.value ?? "∅"}'`,
          ok: false,
        });
        steps.push({
          stack: [...stack],
          cursor: i,
          status: "done",
          description: "✗ Not balanced",
          ok: false,
        });
        return steps;
      }
      stack.pop();
      steps.push({
        stack: [...stack],
        cursor: i,
        status: "pop",
        description: `Match '${ch}' → pop '${top.value}'`,
      });
    }
  }
  const ok = stack.length === 0;
  steps.push({
    stack: [...stack],
    cursor: input.length,
    status: "done",
    description: ok ? "✓ Balanced!" : "✗ Unclosed brackets remain",
    ok,
  });
  return steps;
}

const SPEEDS = [
  { label: "0.5×", ms: 1400 },
  { label: "1×", ms: 700 },
  { label: "2×", ms: 340 },
];
const DEFAULT_EXPR = "({[]})";

export default function StackOperationsVisualizer() {
  const [mode, setMode] = useState<Mode>("manual");
  const [stack, setStack] = useState<StackItem[]>([]);
  const [valueInput, setValueInput] = useState("A");
  const [log, setLog] = useState<string[]>([
    "Ready — push/pop values or switch to balanced parens",
  ]);
  const [flashId, setFlashId] = useState<number | null>(null);

  const [expr, setExpr] = useState(DEFAULT_EXPR);
  const [balancedInput, setBalancedInput] = useState(DEFAULT_EXPR);
  const [steps, setSteps] = useState<BalancedStep[]>(() =>
    generateBalancedSteps(DEFAULT_EXPR),
  );
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const step = steps[idx] || steps[0]!;
  const finished = idx === steps.length - 1;

  const advance = useCallback(() => {
    setIdx((p) => (p >= steps.length - 1 ? (setPlaying(false), p) : p + 1));
  }, [steps.length]);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!playing || mode !== "balanced") return;
    const sp = SPEEDS[speedIdx] || SPEEDS[1]!;
    timerRef.current = setTimeout(advance, sp.ms);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [playing, idx, speedIdx, advance, mode]);

  const pushLog = useCallback(
    (m: string) => setLog((p) => [m, ...p].slice(0, 6)),
    [],
  );

  const handlePush = () => {
    if (!valueInput) {
      pushLog("Value required");
      return;
    }
    const item = { id: nid(), value: valueInput };
    setStack((prev) => [...prev, item]);
    setFlashId(item.id);
    setTimeout(() => setFlashId(null), 500);
    pushLog(`push("${valueInput}") — size ${stack.length + 1}`);
  };
  const handlePop = () => {
    if (stack.length === 0) {
      pushLog("Stack is empty — cannot pop");
      return;
    }
    const top = stack[stack.length - 1]!;
    setFlashId(top.id);
    setTimeout(() => {
      setStack((prev) => prev.slice(0, -1));
      pushLog(`pop() → "${top.value}"`);
      setFlashId(null);
    }, 350);
  };
  const handleClear = () => {
    setStack([]);
    pushLog("Stack cleared");
  };

  const handleLoadExpr = () => {
    setPlaying(false);
    const e = expr.slice(0, 24);
    setBalancedInput(e);
    setSteps(generateBalancedSteps(e));
    setIdx(0);
  };

  const activeStack = mode === "manual" ? stack : step.stack;
  const currentFlashId = mode === "manual" ? flashId : null;

  return (
    <div
      className="w-full rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: "#09090b",
        border: "1px solid #1f2937",
        minHeight: 400,
      }}
    >
      <div
        className="flex items-center gap-2 px-6 py-3"
        style={{ borderBottom: "1px solid #1f2937" }}
      >
        {(["manual", "balanced"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className="rounded-md text-[11px] font-bold cursor-pointer active:scale-95"
            style={{
              padding: "6px 12px",
              background: mode === m ? "#1f2937" : "transparent",
              color: mode === m ? "#fff" : "#6b7280",
              border: "1px solid " + (mode === m ? "#374151" : "transparent"),
            }}
          >
            {m === "manual" ? "Push / Pop" : "Balanced Parens"}
          </button>
        ))}
      </div>

      {mode === "manual" ? (
        <div
          className="flex flex-wrap items-center gap-3 px-6 py-3"
          style={{ borderBottom: "1px solid #111113" }}
        >
          <input
            value={valueInput}
            onChange={(e) => setValueInput(e.target.value)}
            className="rounded-md px-2 py-1 w-20 font-mono text-[12px]"
            style={{
              background: "#0d0d0f",
              border: "1px solid #374151",
              color: "#fff",
            }}
          />
          <button
            onClick={handlePush}
            className="rounded-lg text-[11px] font-bold text-white cursor-pointer active:scale-95"
            style={{ padding: "6px 12px", background: "#10b981" }}
          >
            Push
          </button>
          <button
            onClick={handlePop}
            className="rounded-lg text-[11px] font-bold text-white cursor-pointer active:scale-95"
            style={{ padding: "6px 12px", background: "#ef4444" }}
          >
            Pop
          </button>
          <button
            onClick={handleClear}
            className="rounded-lg text-[11px] font-bold cursor-pointer active:scale-95"
            style={{
              padding: "6px 12px",
              border: "1px solid #374151",
              color: "#9ca3af",
              background: "transparent",
            }}
          >
            Clear
          </button>
        </div>
      ) : (
        <div
          className="flex flex-wrap items-center gap-3 px-6 py-3"
          style={{ borderBottom: "1px solid #111113" }}
        >
          <input
            value={expr}
            onChange={(e) => setExpr(e.target.value)}
            className="rounded-md px-2 py-1 w-40 font-mono text-[12px]"
            style={{
              background: "#0d0d0f",
              border: "1px solid #374151",
              color: "#fff",
            }}
          />
          <button
            onClick={handleLoadExpr}
            className="rounded-lg text-[11px] font-bold text-white cursor-pointer active:scale-95"
            style={{
              padding: "6px 12px",
              background: "#1f2937",
              border: "1px solid #374151",
            }}
          >
            Load
          </button>
        </div>
      )}

      {mode === "balanced" && (
        <div
          className="flex items-center justify-center px-6 py-2"
          style={{ minHeight: 36, borderBottom: "1px solid #111113" }}
        >
          <div className="flex items-center gap-1 font-mono">
            {balancedInput.split("").map((c, i) => (
              <span
                key={i}
                style={{
                  padding: "2px 6px",
                  borderRadius: 4,
                  background:
                    i === step.cursor
                      ? "#fbbf24"
                      : i < step.cursor
                        ? "#1f2937"
                        : "transparent",
                  color: i === step.cursor ? "#000" : "#d1d5db",
                  fontSize: 13,
                  fontWeight: 700,
                  transition: "background-color 200ms",
                }}
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      <div
        className="flex items-center justify-center px-6 py-3"
        style={{ minHeight: 44, borderBottom: "1px solid #111113" }}
      >
        <span
          className="text-[13px] font-semibold text-center"
          style={{
            color:
              mode === "balanced" && finished
                ? step.ok
                  ? "#10b981"
                  : "#f87171"
                : "#9ca3af",
          }}
        >
          {mode === "balanced"
            ? step.description
            : `Stack size: ${stack.length}`}
        </span>
      </div>

      <div
        className="flex-1 flex items-end justify-center px-6 py-6"
        style={{ minHeight: 200 }}
      >
        <div className="flex flex-col-reverse items-center" style={{ gap: 4 }}>
          <div
            className="text-[10px] font-mono px-3 py-1 rounded"
            style={{
              background: "#0d0d0f",
              color: "#4b5563",
              border: "1px solid #1f2937",
            }}
          >
            bottom
          </div>
          {activeStack.map((item, i) => {
            const isTop = i === activeStack.length - 1;
            const flash = currentFlashId === item.id;
            return (
              <div
                key={item.id}
                className="flex items-center justify-center font-bold tabular-nums"
                style={{
                  minWidth: 100,
                  height: 34,
                  padding: "0 12px",
                  background: flash ? "#fbbf24" : isTop ? "#374151" : "#1f2937",
                  color: "#fff",
                  borderRadius: 4,
                  border: "1px solid " + (isTop ? "#4b5563" : "#374151"),
                  transition: "background-color 200ms",
                }}
              >
                {item.value}
              </div>
            );
          })}
          {activeStack.length > 0 && (
            <div className="text-[10px] font-mono" style={{ color: "#ef4444" }}>
              ↑ top
            </div>
          )}
        </div>
      </div>

      {mode === "balanced" && (
        <div
          className="flex items-center justify-center gap-3 px-6 py-4"
          style={{ borderTop: "1px solid #1f2937" }}
        >
          <button
            onClick={() =>
              finished ? handleLoadExpr() : setPlaying((p) => !p)
            }
            className="rounded-lg text-white text-xs font-bold cursor-pointer active:scale-95"
            style={{
              padding: "8px 18px",
              background: finished ? "#059669" : "#ef4444",
            }}
          >
            {finished
              ? "Restart"
              : playing
                ? "Pause"
                : idx === 0
                  ? "Start"
                  : "Resume"}
          </button>
          {SPEEDS.map(({ label }, i) => (
            <button
              key={label}
              onClick={() => setSpeedIdx(i)}
              className="rounded-md text-[11px] font-bold cursor-pointer active:scale-95"
              style={{
                padding: "6px 10px",
                background: speedIdx === i ? "#1f2937" : "transparent",
                color: speedIdx === i ? "#fff" : "#6b7280",
                border:
                  "1px solid " + (speedIdx === i ? "#374151" : "transparent"),
              }}
            >
              {label}
            </button>
          ))}
          <span className="text-[10px] font-mono" style={{ color: "#4b5563" }}>
            Step {idx}/{steps.length - 1}
          </span>
        </div>
      )}

      {mode === "manual" && (
        <div
          className="mx-6 mb-6 rounded-xl overflow-hidden"
          style={{ border: "1px solid #1f2937", background: "#050507" }}
        >
          <div
            className="px-4 py-2"
            style={{ borderBottom: "1px solid #111113" }}
          >
            <span
              className="text-[9px] font-black uppercase tracking-widest"
              style={{ color: "#374151" }}
            >
              Step log
            </span>
          </div>
          {log.map((msg, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-2"
              style={{
                borderBottom: i < log.length - 1 ? "1px solid #0d0d0f" : "none",
              }}
            >
              <span
                className="rounded-full"
                style={{
                  width: 5,
                  height: 5,
                  background: i === 0 ? "#ef4444" : "#1f2937",
                  display: "inline-block",
                }}
              />
              <span
                className="text-[11px] font-mono"
                style={{ color: i === 0 ? "#d1d5db" : "#374151" }}
              >
                {msg}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
