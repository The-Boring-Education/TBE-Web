import { useCallback, useState } from "react";

const BUCKET_COUNT = 7;

function hash(key: string): number {
  let h = 0;
  for (let i = 0; i < key.length; i += 1)
    h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return h % BUCKET_COUNT;
}

interface Entry {
  key: string;
  value: string;
}

type Highlight = {
  bucket: number | null;
  kind: "insert" | "lookup" | "collision" | null;
};

export default function HashMapOperationsVisualizer() {
  const [buckets, setBuckets] = useState<Entry[][]>(() =>
    Array.from({ length: BUCKET_COUNT }, () => []),
  );
  const [keyInput, setKeyInput] = useState("apple");
  const [valueInput, setValueInput] = useState("🍎");
  const [highlight, setHighlight] = useState<Highlight>({
    bucket: null,
    kind: null,
  });
  const [log, setLog] = useState<string[]>([
    "Ready — insert key/value or look up a key",
  ]);

  const pushLog = useCallback(
    (m: string) => setLog((p) => [m, ...p].slice(0, 6)),
    [],
  );
  const flash = useCallback((b: number, kind: Highlight["kind"]) => {
    setHighlight({ bucket: b, kind });
    setTimeout(() => setHighlight({ bucket: null, kind: null }), 800);
  }, []);

  const handleInsert = () => {
    const k = keyInput.trim();
    if (!k) {
      pushLog("Key required");
      return;
    }
    const b = hash(k);
    const bucket = buckets[b];
    if (!bucket) return;
    const collision = bucket.length > 0 && !bucket.some((e) => e.key === k);
    const existing = bucket.some((e) => e.key === k);
    const next = buckets.map((entries, i) => {
      if (i !== b) return entries;
      if (existing)
        return entries.map((e) =>
          e.key === k ? { key: k, value: valueInput } : e,
        );
      return [...entries, { key: k, value: valueInput }];
    });
    setBuckets(next);
    flash(b, collision ? "collision" : "insert");
    pushLog(
      `hash("${k}") = ${b}${existing ? " → update value" : collision ? " → collision! append to chain" : " → new entry"}`,
    );
  };

  const handleLookup = () => {
    const k = keyInput.trim();
    if (!k) {
      pushLog("Key required");
      return;
    }
    const b = hash(k);
    flash(b, "lookup");
    const bucket = buckets[b] || [];
    const found = bucket.find((e) => e.key === k);
    pushLog(
      found
        ? `Found "${k}" in bucket ${b} → "${found.value}"`
        : `"${k}" not found in bucket ${b}`,
    );
  };

  const handleClear = () => {
    setBuckets(Array.from({ length: BUCKET_COUNT }, () => []));
    setLog(["Cleared"]);
  };

  const bucketColor = (i: number): string => {
    if (highlight.bucket !== i) return "#1f2937";
    if (highlight.kind === "collision") return "#f59e0b";
    if (highlight.kind === "insert") return "#10b981";
    return "#fbbf24";
  };

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
        className="flex flex-wrap items-center gap-3 px-6 py-3"
        style={{ borderBottom: "1px solid #1f2937" }}
      >
        <input
          value={keyInput}
          onChange={(e) => setKeyInput(e.target.value)}
          placeholder="key"
          className="rounded-md px-2 py-1 font-mono text-[12px] w-28"
          style={{
            background: "#0d0d0f",
            border: "1px solid #374151",
            color: "#fff",
          }}
        />
        <input
          value={valueInput}
          onChange={(e) => setValueInput(e.target.value)}
          placeholder="value"
          className="rounded-md px-2 py-1 font-mono text-[12px] w-28"
          style={{
            background: "#0d0d0f",
            border: "1px solid #374151",
            color: "#fff",
          }}
        />
        <button
          onClick={handleInsert}
          className="rounded-lg text-[11px] font-bold text-white cursor-pointer active:scale-95"
          style={{ padding: "6px 12px", background: "#10b981" }}
        >
          Insert
        </button>
        <button
          onClick={handleLookup}
          className="rounded-lg text-[11px] font-bold text-white cursor-pointer active:scale-95"
          style={{ padding: "6px 12px", background: "#3b82f6" }}
        >
          Lookup
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

      <div className="flex-1 px-6 py-6">
        <div className="grid gap-3">
          {buckets.map((entries, i) => (
            <div key={i} className="flex items-center gap-3">
              <div
                className="flex items-center justify-center font-mono font-bold text-[12px]"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 6,
                  background: bucketColor(i),
                  color: "#fff",
                  transition: "background-color 200ms",
                  boxShadow:
                    highlight.bucket === i
                      ? `0 0 12px ${bucketColor(i)}80`
                      : "none",
                }}
              >
                {i}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {entries.length === 0 ? (
                  <span
                    className="text-[11px] font-mono"
                    style={{ color: "#4b5563" }}
                  >
                    ∅
                  </span>
                ) : (
                  entries.map((e, j) => (
                    <div key={e.key} className="flex items-center gap-1">
                      <div
                        className="flex items-center gap-2 rounded-md px-2 py-1"
                        style={{
                          background: "#0d0d0f",
                          border: "1px solid #374151",
                        }}
                      >
                        <span
                          className="text-[10px] font-mono"
                          style={{ color: "#fbbf24" }}
                        >
                          {e.key}
                        </span>
                        <span
                          className="text-[10px]"
                          style={{ color: "#4b5563" }}
                        >
                          →
                        </span>
                        <span
                          className="text-[10px] font-mono"
                          style={{ color: "#d1d5db" }}
                        >
                          {e.value}
                        </span>
                      </div>
                      {j < entries.length - 1 && (
                        <span style={{ color: "#4b5563" }}>→</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
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
