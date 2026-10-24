// A small graph that "runs BFS" from the CodePlus mark: each level lights up in turn, then the loop restarts.

const C = 240; // centre of the 480×480 canvas
const LEVEL_DELAY = 0.55; // seconds between BFS levels

type Node = { id: string; x: number; y: number; level: number; parent?: string };

function polar(r: number, deg: number) {
  const a = (deg * Math.PI) / 180;
  return { x: +(C + r * Math.cos(a)).toFixed(1), y: +(C + r * Math.sin(a)).toFixed(1) };
}

const level1 = [-60, 30, 120, 210].map((deg, i) => ({ id: `a${i}`, level: 1, parent: "root", deg, ...polar(108, deg) }));
const level2 = level1.flatMap((p, i) =>
  [-24, 24].map((off, j) => ({ id: `b${i}${j}`, level: 2, parent: p.id, deg: p.deg + off, ...polar(190, p.deg + off) })),
);
const level3 = [level2[1], level2[4], level2[6]].map((p, i) => ({
  id: `c${i}`,
  level: 3,
  parent: p.id,
  ...polar(228, p.deg + 9),
}));

const nodes: Node[] = [{ id: "root", x: C, y: C, level: 0 }, ...level1, ...level2, ...level3];
const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));

// Tree edges light up during the BFS; cross edges stay faint to make it read as a graph, not a tree.
const treeEdges = nodes.filter((n) => n.parent).map((n) => ({ from: byId[n.parent!], to: n }));
const crossEdges = [
  ["b01", "b10"],
  ["b11", "b20"],
  ["b21", "b30"],
  ["b31", "b00"],
  ["a0", "a1"],
  ["a2", "a3"],
].map(([a, b]) => ({ from: byId[a], to: byId[b] }));

const chips = [
  { text: "bfs(root)", className: "left-[2%] top-[14%]", delay: "0s" },
  { text: "dp[i][j]", className: "right-[0%] top-[30%]", delay: "-2s" },
  { text: "O(n log n)", className: "left-[0%] bottom-[22%]", delay: "-4s" },
  { text: "Accepted ✓", className: "right-[6%] bottom-[8%]", delay: "-1s", accent: true },
];

export function HeroGraphic() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[480px]" aria-hidden>
      <svg viewBox="0 0 480 480" className="relative h-full w-full overflow-visible">
        <defs>
          <linearGradient id="hg-brand" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--grad-a)" />
            <stop offset="1" stopColor="var(--grad-b)" />
          </linearGradient>
        </defs>

        {/* orbit rings */}
        <g className="hg-spin" fill="none" stroke="var(--line)">
          <circle cx={C} cy={C} r="108" strokeDasharray="2 6" />
          <circle cx={C} cy={C} r="190" strokeDasharray="2 8" />
          <circle cx={C} cy={C} r="232" strokeDasharray="1 10" opacity="0.7" />
        </g>

        {/* edges */}
        <g stroke="var(--line)" strokeWidth="1.5">
          {[...treeEdges, ...crossEdges].map(({ from, to }) => (
            <line key={`${from.id}-${to.id}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} />
          ))}
        </g>
        <g stroke="url(#hg-brand)" strokeWidth="2" strokeLinecap="round" fill="none">
          {treeEdges.map(({ from, to }) => (
            <path
              key={`lit-${to.id}`}
              d={`M${from.x} ${from.y}L${to.x} ${to.y}`}
              pathLength={1}
              className="hg-edge"
              style={{ animationDelay: `${(to.level - 1) * LEVEL_DELAY + 0.15}s` }}
            />
          ))}
        </g>

        {/* nodes */}
        {nodes
          .filter((n) => n.level > 0)
          .map((n) => {
            const r = n.level === 1 ? 9 : n.level === 2 ? 7 : 5;
            const delay = `${n.level * LEVEL_DELAY}s`;
            return (
              <g key={n.id}>
                <circle cx={n.x} cy={n.y} r={r} fill="var(--bg)" stroke="var(--muted)" strokeOpacity="0.5" strokeWidth="1.5" />
                <circle cx={n.x} cy={n.y} r={r} fill="url(#hg-brand)" className="hg-node" style={{ animationDelay: delay }} />
              </g>
            );
          })}

        {/* root: the "+" from the CodePlus logo */}
        <circle cx={C} cy={C} r="40" fill="var(--card)" stroke="url(#hg-brand)" strokeWidth="2" />
        <path
          fill="url(#hg-brand)"
          transform={`translate(${C - 24.3} ${C - 24}) scale(0.6)`}
          d="M25 0H49V24H81L69 47H49V80L25 68V47H0V24H25Z"
        />
      </svg>

      {chips.map((chip) => (
        <span
          key={chip.text}
          className={`hg-float absolute rounded-full border border-line bg-card/85 px-3 py-1 font-mono text-xs shadow-sm backdrop-blur ${chip.className} ${
            chip.accent ? "text-accent" : "text-ink-soft"
          }`}
          style={{ animationDelay: chip.delay }}
        >
          {chip.text}
        </span>
      ))}
    </div>
  );
}
