import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface TreeNode {
  id: string;
  n: number;
  depth: number;
  x: number;
  parentId: string | null;
  value: number | null;
}

interface Step {
  activeId: string | null;
  resolvedIds: string[];
  description: string;
}

function buildTree(n: number): { nodes: TreeNode[]; steps: Step[] } {
  const nodes: TreeNode[] = [];
  const steps: Step[] = [];
  const resolved = new Set<string>();
  let counter = 0;
  const nextId = () => `n${counter++}`;

  const memo = new Map<number, number>();
  const build = (
    val: number,
    depth: number,
    parentId: string | null,
  ): TreeNode => {
    const id = nextId();
    const node: TreeNode = {
      id,
      n: val,
      depth,
      x: nodes.length,
      parentId,
      value: null,
    };
    nodes.push(node);
    steps.push({
      activeId: id,
      resolvedIds: Array.from(resolved),
      description: `Call fib(${val})`,
    });
    if (val < 2) {
      node.value = val;
      resolved.add(id);
      memo.set(val, val);
      steps.push({
        activeId: id,
        resolvedIds: Array.from(resolved),
        description: `Return fib(${val}) = ${val}`,
      });
      return node;
    }
    const left = build(val - 1, depth + 1, id);
    const right = build(val - 2, depth + 1, id);
    node.value = (left.value ?? 0) + (right.value ?? 0);
    resolved.add(id);
    steps.push({
      activeId: id,
      resolvedIds: Array.from(resolved),
      description: `fib(${val}) = fib(${val - 1}) + fib(${val - 2}) = ${node.value}`,
    });
    return node;
  };
  build(n, 0, null);

  // assign x positions based on in-order traversal
  const leaves = nodes.filter((_, i) => {
    const kids = nodes.filter((c) => c.parentId === nodes[i]!.id);
    return kids.length === 0;
  });
  leaves.forEach((leaf, i) => {
    leaf.x = i;
  });
  // propagate parent x as avg of children
  for (let d = Math.max(...nodes.map((n2) => n2.depth)); d >= 0; d -= 1) {
    nodes
      .filter((n2) => n2.depth === d)
      .forEach((node) => {
        const kids = nodes.filter((c) => c.parentId === node.id);
        if (kids.length > 0) {
          const sum = kids.reduce((s, k) => s + k.x, 0);
          node.x = sum / kids.length;
        }
      });
  }

  return { nodes, steps };
}

const SPEEDS = [
  { label: "0.5×", ms: 1400 },
  { label: "1×", ms: 700 },
  { label: "2×", ms: 340 },
];

export default function RecursionTreeVisualizer() {
  const [n, setN] = useState(4);
  const [{ nodes, steps }, setData] = useState(() => buildTree(4));
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
    if (!playing) return;
    const sp = SPEEDS[speedIdx] || SPEEDS[1]!;
    timerRef.current = setTimeout(advance, sp.ms);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [playing, idx, speedIdx, advance]);

  const handleLoad = (val: number) => {
    setPlaying(false);
    setN(val);
    setData(buildTree(val));
    setIdx(0);
  };

  const { visibleNodes, resolvedSet, activeId } = useMemo(() => {
    const shown = new Set<string>();
    const currentStep = step;
    for (let i = 0; i <= idx; i += 1) {
      const s = steps[i];
      if (s?.activeId) shown.add(s.activeId);
    }
    return {
      visibleNodes: nodes.filter((nd) => shown.has(nd.id)),
      resolvedSet: new Set(currentStep.resolvedIds),
      activeId: currentStep.activeId,
    };
  }, [idx, nodes, steps, step]);

  const xs = visibleNodes.map((n2) => n2.x);
  const minX = xs.length > 0 ? Math.min(...xs) : 0;
  const maxX = xs.length > 0 ? Math.max(...xs) : 0;
  const spanX = Math.max(1, maxX - minX);
  const maxDepth = Math.max(1, ...nodes.map((n2) => n2.depth));
  const W = 640;
  const H = 60 + maxDepth * 70;
  const px = (x: number) => 40 + ((x - minX) / spanX) * (W - 80);
  const py = (d: number) => 40 + d * 70;

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
        <span className="text-[11px] font-mono" style={{ color: "#9ca3af" }}>
          fib(n)
        </span>
        <input
          type="number"
          value={n}
          min={0}
          max={6}
          onChange={(e) =>
            handleLoad(Math.max(0, Math.min(6, Number(e.target.value) || 0)))
          }
          className="rounded-md px-2 py-1 w-20 font-mono text-[12px]"
          style={{
            background: "#0d0d0f",
            border: "1px solid #374151",
            color: "#fff",
          }}
        />
        <span className="text-[10px]" style={{ color: "#4b5563" }}>
          (max 6 for readability)
        </span>
      </div>

      <div
        className="flex items-center justify-center px-6 py-3"
        style={{ minHeight: 44, borderBottom: "1px solid #111113" }}
      >
        <span
          className="text-[13px] font-semibold text-center"
          style={{ color: finished ? "#10b981" : "#fbbf24" }}
        >
          {step.description}
        </span>
      </div>

      <div className="px-6 py-4 overflow-auto">
        <svg
          width={W}
          height={H}
          style={{ display: "block", margin: "0 auto" }}
        >
          {visibleNodes.map((nd) => {
            if (!nd.parentId) return null;
            const parent = nodes.find((p) => p.id === nd.parentId);
            if (!parent || !visibleNodes.includes(parent)) return null;
            return (
              <line
                key={`e-${nd.id}`}
                x1={px(parent.x)}
                y1={py(parent.depth) + 16}
                x2={px(nd.x)}
                y2={py(nd.depth) - 16}
                stroke="#374151"
                strokeWidth={1.5}
              />
            );
          })}
          {visibleNodes.map((nd) => {
            const isActive = nd.id === activeId;
            const isResolved = resolvedSet.has(nd.id);
            const fill = isActive
              ? "#fbbf24"
              : isResolved
                ? "#10b981"
                : "#1f2937";
            return (
              <g
                key={nd.id}
                transform={`translate(${px(nd.x)}, ${py(nd.depth)})`}
              >
                <circle r={18} fill={fill} stroke="#374151" strokeWidth={1} />
                <text
                  textAnchor="middle"
                  dy={-2}
                  fontSize={10}
                  fill="#fff"
                  fontFamily="monospace"
                >
                  fib({nd.n})
                </text>
                <text
                  textAnchor="middle"
                  dy={10}
                  fontSize={9}
                  fill={isResolved ? "#052e16" : "#9ca3af"}
                  fontFamily="monospace"
                >
                  {isResolved ? `=${nd.value}` : "…"}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="flex items-center justify-center gap-3 px-6 py-4">
        <button
          onClick={() => (finished ? handleLoad(n) : setPlaying((p) => !p))}
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
    </div>
  );
}
