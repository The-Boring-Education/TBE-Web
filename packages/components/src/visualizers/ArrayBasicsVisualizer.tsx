import { useCallback, useState } from "react";

const CONTAINER: React.CSSProperties = {
  background: "#09090b",
  border: "1px solid #1f2937",
  minHeight: 400,
};

const INITIAL: number[] = [12, 27, 33, 41, 58];

type Highlight = {
  index: number | null;
  kind: "insert" | "delete" | "access" | null;
};

export default function ArrayBasicsVisualizer() {
  const [arr, setArr] = useState<number[]>(INITIAL);
  const [indexInput, setIndexInput] = useState("2");
  const [valueInput, setValueInput] = useState("99");
  const [highlight, setHighlight] = useState<Highlight>({
    index: null,
    kind: null,
  });
  const [log, setLog] = useState<string[]>([
    "Ready — pick an index and a value",
  ]);

  const pushLog = useCallback((msg: string) => {
    setLog((prev) => [msg, ...prev].slice(0, 6));
  }, []);

  const flash = useCallback((index: number, kind: Highlight["kind"]) => {
    setHighlight({ index, kind });
    setTimeout(() => setHighlight({ index: null, kind: null }), 700);
  }, []);

  const parsedIndex = () => {
    const n = Number.parseInt(indexInput, 10);
    return Number.isFinite(n) ? n : null;
  };

  const handleInsert = () => {
    const i = parsedIndex();
    const v = Number.parseInt(valueInput, 10);
    if (i === null || i < 0 || i > arr.length || !Number.isFinite(v)) {
      pushLog("Invalid index or value");
      return;
    }
    const next = [...arr.slice(0, i), v, ...arr.slice(i)];
    setArr(next);
    flash(i, "insert");
    pushLog(
      `Insert ${v} at index ${i} — shifted ${arr.length - i} element(s) right`,
    );
  };

  const handleDelete = () => {
    const i = parsedIndex();
    if (i === null || i < 0 || i >= arr.length) {
      pushLog("Invalid index");
      return;
    }
    flash(i, "delete");
    setTimeout(() => {
      setArr((prev) => [...prev.slice(0, i), ...prev.slice(i + 1)]);
      pushLog(
        `Delete at index ${i} — shifted ${arr.length - i - 1} element(s) left`,
      );
    }, 300);
  };

  const handleAccess = () => {
    const i = parsedIndex();
    if (i === null || i < 0 || i >= arr.length) {
      pushLog("Invalid index");
      return;
    }
    flash(i, "access");
    pushLog(`arr[${i}] = ${arr[i]} (O(1) access)`);
  };

  const handleReset = () => {
    setArr(INITIAL);
    setLog(["Reset to default array"]);
  };

  const colorFor = (i: number): string => {
    if (highlight.index !== i) return "#374151";
    if (highlight.kind === "insert") return "#10b981";
    if (highlight.kind === "delete") return "#f87171";
    return "#fbbf24";
  };

  return (
    <div
      className="w-full rounded-2xl overflow-hidden flex flex-col"
      style={CONTAINER}
    >
      <div className="px-6 py-3" style={{ borderBottom: "1px solid #1f2937" }}>
        <span
          className="text-[13px] font-semibold"
          style={{ color: "#d1d5db" }}
        >
          Array Operations — insert / delete / access
        </span>
      </div>

      <div className="flex items-center justify-center px-6 py-10">
        <div className="flex items-end" style={{ gap: 8 }}>
          {arr.map((val, i) => (
            <div key={`${i}-${val}`} className="flex flex-col items-center">
              <span
                className="text-[10px] font-mono mb-1"
                style={{ color: highlight.index === i ? "#fff" : "#4b5563" }}
              >
                [{i}]
              </span>
              <div
                className="flex items-center justify-center font-bold tabular-nums"
                style={{
                  width: 52,
                  height: 52,
                  background: colorFor(i),
                  color: "#fff",
                  borderRadius: 6,
                  boxShadow:
                    highlight.index === i
                      ? `0 0 12px ${colorFor(i)}80`
                      : "none",
                  transition:
                    "background-color 200ms, box-shadow 200ms, transform 200ms",
                  transform:
                    highlight.index === i ? "translateY(-4px)" : "none",
                }}
              >
                {val}
              </div>
            </div>
          ))}
          {arr.length === 0 && (
            <span className="text-[12px]" style={{ color: "#4b5563" }}>
              Empty array
            </span>
          )}
        </div>
      </div>

      <div
        className="flex flex-wrap items-center gap-3 px-6 py-4"
        style={{ borderTop: "1px solid #1f2937" }}
      >
        <label className="text-[11px] font-mono" style={{ color: "#9ca3af" }}>
          index
          <input
            value={indexInput}
            onChange={(e) => setIndexInput(e.target.value)}
            className="ml-2 rounded-md px-2 py-1 w-14 font-mono text-[12px]"
            style={{
              background: "#0d0d0f",
              border: "1px solid #374151",
              color: "#fff",
            }}
          />
        </label>
        <label className="text-[11px] font-mono" style={{ color: "#9ca3af" }}>
          value
          <input
            value={valueInput}
            onChange={(e) => setValueInput(e.target.value)}
            className="ml-2 rounded-md px-2 py-1 w-16 font-mono text-[12px]"
            style={{
              background: "#0d0d0f",
              border: "1px solid #374151",
              color: "#fff",
            }}
          />
        </label>
        <button
          onClick={handleInsert}
          className="rounded-lg text-[11px] font-bold text-white cursor-pointer active:scale-95 transition-all"
          style={{ padding: "8px 14px", background: "#10b981" }}
        >
          Insert
        </button>
        <button
          onClick={handleDelete}
          className="rounded-lg text-[11px] font-bold text-white cursor-pointer active:scale-95 transition-all"
          style={{ padding: "8px 14px", background: "#ef4444" }}
        >
          Delete
        </button>
        <button
          onClick={handleAccess}
          className="rounded-lg text-[11px] font-bold text-white cursor-pointer active:scale-95 transition-all"
          style={{ padding: "8px 14px", background: "#f59e0b" }}
        >
          Access
        </button>
        <button
          onClick={handleReset}
          className="rounded-lg text-[11px] font-bold cursor-pointer active:scale-95 transition-all"
          style={{
            padding: "8px 14px",
            border: "1px solid #374151",
            color: "#9ca3af",
            background: "transparent",
          }}
        >
          Reset
        </button>
      </div>

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
    </div>
  );
}
