import { useCallback, useState } from "react";

interface Node {
  id: number;
  value: number;
}

let ID = 1;
const nextId = () => ID++;

const INITIAL: Node[] = [
  { id: nextId(), value: 10 },
  { id: nextId(), value: 20 },
  { id: nextId(), value: 30 },
];

type Highlight = {
  id: number | null;
  kind: "insert" | "delete" | "reverse" | null;
};

export default function LinkedListBasicsVisualizer() {
  const [list, setList] = useState<Node[]>(INITIAL);
  const [valueInput, setValueInput] = useState("42");
  const [highlight, setHighlight] = useState<Highlight>({
    id: null,
    kind: null,
  });
  const [log, setLog] = useState<string[]>([
    "Ready — insert / delete / reverse",
  ]);

  const pushLog = useCallback(
    (m: string) => setLog((p) => [m, ...p].slice(0, 6)),
    [],
  );
  const flash = useCallback((id: number, kind: Highlight["kind"]) => {
    setHighlight({ id, kind });
    setTimeout(() => setHighlight({ id: null, kind: null }), 800);
  }, []);

  const parsedValue = () => {
    const v = Number.parseInt(valueInput, 10);
    return Number.isFinite(v) ? v : null;
  };

  const handleInsertHead = () => {
    const v = parsedValue();
    if (v === null) {
      pushLog("Invalid value");
      return;
    }
    const node = { id: nextId(), value: v };
    setList((prev) => [node, ...prev]);
    flash(node.id, "insert");
    pushLog(`Insert ${v} at head → new node points to previous head`);
  };

  const handleInsertTail = () => {
    const v = parsedValue();
    if (v === null) {
      pushLog("Invalid value");
      return;
    }
    const node = { id: nextId(), value: v };
    setList((prev) => [...prev, node]);
    flash(node.id, "insert");
    pushLog(`Insert ${v} at tail → walk to end, set .next`);
  };

  const handleDeleteHead = () => {
    if (list.length === 0) {
      pushLog("List is empty");
      return;
    }
    const head = list[0]!;
    flash(head.id, "delete");
    setTimeout(() => {
      setList((prev) => prev.slice(1));
      pushLog(`Delete head (${head.value}) → head = head.next`);
    }, 400);
  };

  const handleReverse = () => {
    if (list.length < 2) {
      pushLog("Need at least 2 nodes to reverse");
      return;
    }
    setList((prev) => [...prev].reverse());
    pushLog(`Reverse in place — swap each node's .next pointer`);
    if (list[0]) flash(list[0].id, "reverse");
  };

  const handleReset = () => {
    ID = 1;
    setList([
      { id: nextId(), value: 10 },
      { id: nextId(), value: 20 },
      { id: nextId(), value: 30 },
    ]);
    setLog(["Reset"]);
  };

  const colorFor = (id: number): string => {
    if (highlight.id !== id) return "#1f2937";
    if (highlight.kind === "insert") return "#10b981";
    if (highlight.kind === "delete") return "#f87171";
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
          onClick={handleInsertHead}
          className="rounded-lg text-[11px] font-bold text-white cursor-pointer active:scale-95"
          style={{ padding: "6px 12px", background: "#10b981" }}
        >
          Insert Head
        </button>
        <button
          onClick={handleInsertTail}
          className="rounded-lg text-[11px] font-bold text-white cursor-pointer active:scale-95"
          style={{ padding: "6px 12px", background: "#059669" }}
        >
          Insert Tail
        </button>
        <button
          onClick={handleDeleteHead}
          className="rounded-lg text-[11px] font-bold text-white cursor-pointer active:scale-95"
          style={{ padding: "6px 12px", background: "#ef4444" }}
        >
          Delete Head
        </button>
        <button
          onClick={handleReverse}
          className="rounded-lg text-[11px] font-bold text-white cursor-pointer active:scale-95"
          style={{ padding: "6px 12px", background: "#3b82f6" }}
        >
          Reverse
        </button>
        <button
          onClick={handleReset}
          className="rounded-lg text-[11px] font-bold cursor-pointer active:scale-95"
          style={{
            padding: "6px 12px",
            border: "1px solid #374151",
            color: "#9ca3af",
            background: "transparent",
          }}
        >
          Reset
        </button>
      </div>

      <div className="flex items-center px-6 py-10 overflow-x-auto">
        <div className="flex items-center" style={{ gap: 6 }}>
          <span className="text-[10px] font-mono" style={{ color: "#ef4444" }}>
            head
          </span>
          <span style={{ color: "#4b5563" }}>→</span>
          {list.length === 0 ? (
            <span
              className="text-[11px] font-mono"
              style={{ color: "#4b5563" }}
            >
              null
            </span>
          ) : (
            list.map((n, i) => (
              <div key={n.id} className="flex items-center" style={{ gap: 6 }}>
                <div
                  className="flex items-center justify-center font-bold tabular-nums"
                  style={{
                    minWidth: 56,
                    height: 42,
                    padding: "0 10px",
                    borderRadius: 6,
                    background: colorFor(n.id),
                    color: "#fff",
                    border: "1px solid #374151",
                    transition: "background-color 200ms",
                    boxShadow:
                      highlight.id === n.id
                        ? `0 0 12px ${colorFor(n.id)}80`
                        : "none",
                  }}
                >
                  {n.value}
                </div>
                <span style={{ color: "#4b5563" }}>→</span>
                {i === list.length - 1 && (
                  <span
                    className="text-[11px] font-mono"
                    style={{ color: "#4b5563" }}
                  >
                    null
                  </span>
                )}
              </div>
            ))
          )}
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
