import Link from "next/link";
import clsx from "clsx";
import { Check, Trophy } from "lucide-react";
import { formatDay } from "@/lib/calendar-utils";
import type { PlanWeek } from "@/lib/course-plan";

const ROW_H = 200; // px per row of stops
const NODE_Y = 28; // centre of a stop, from the top of its row
const VIEW_W = 1000; // the svg's x units; it stretches to the container's width

/**
 * The plan as a winding path: stops run left to right, then right to left on the next row.
 * The part of the path already travelled is drawn in the brand gradient.
 */
export function CourseMap({ weeks, cols, className }: { weeks: PlanWeek[]; cols: number; className?: string }) {
  const rows = Math.ceil(weeks.length / cols);
  const height = rows * ROW_H;
  const spot = (i: number) => {
    const row = Math.floor(i / cols);
    const col = row % 2 === 0 ? i % cols : cols - 1 - (i % cols);
    return { row, col, x: ((col + 0.5) * VIEW_W) / cols, y: row * ROW_H + NODE_Y };
  };

  // One path segment per gap between stops; a row change is a U-turn outside the last column
  const turn = (VIEW_W / cols) * 0.42;
  const segment = (i: number) => {
    const a = spot(i);
    const b = spot(i + 1);
    if (a.row === b.row) return `L${b.x} ${b.y}`;
    const dx = a.col === cols - 1 ? turn : -turn;
    return `C${a.x + dx} ${a.y} ${b.x + dx} ${b.y} ${b.x} ${b.y}`;
  };
  const pathTo = (n: number) => {
    const start = spot(0);
    return `M${start.x} ${start.y}` + Array.from({ length: n }, (_, i) => segment(i)).join("");
  };

  const reached = weeks.findLastIndex((w) => w.status === "done" || w.status === "current");
  const dateRange = (w: PlanWeek) =>
    w.firstDay === w.lastDay
      ? formatDay(w.firstDay, { day: "numeric", month: "short" })
      : `${formatDay(w.firstDay, { day: "numeric", month: "short" })} – ${formatDay(w.lastDay, { day: "numeric", month: "short" })}`;

  return (
    <div className={clsx("relative", className)} style={{ height }}>
      <svg
        viewBox={`0 0 ${VIEW_W} ${height}`}
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full overflow-visible"
        aria-hidden
      >
        <defs>
          {/* userSpaceOnUse: a bounding-box gradient on a perfectly straight path draws nothing */}
          <linearGradient id={`course-progress-${cols}`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={VIEW_W} y2={height}>
            <stop offset="0" stopColor="var(--grad-a)" />
            <stop offset="1" stopColor="var(--grad-b)" />
          </linearGradient>
        </defs>
        <path
          d={pathTo(weeks.length - 1)}
          fill="none"
          stroke="var(--line)"
          strokeWidth="3"
          strokeDasharray="2 8"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        {reached > 0 && (
          <path
            d={pathTo(reached)}
            fill="none"
            stroke={`url(#course-progress-${cols})`}
            strokeWidth="4"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            pathLength={1}
            className="course-progress"
          />
        )}
      </svg>

      {weeks.map((w, i) => {
        const p = spot(i);
        return (
          <Link
            key={w.key}
            href={w.href}
            className="group absolute flex -translate-x-1/2 flex-col items-center text-center"
            style={{ left: `${(p.x / VIEW_W) * 100}%`, top: p.row * ROW_H, width: `calc(${100 / cols}% - 12px)` }}
          >
            <span className="relative">
              {(w.status === "current" || w.status === "next") && (
                <span
                  className={clsx(
                    "absolute -top-6 left-1/2 -translate-x-1/2 rounded-full px-2 py-0.5 font-mono text-[10px] tracking-wider whitespace-nowrap uppercase",
                    w.status === "current" ? "bg-accent-tint text-accent-ink" : "bg-brand-tint text-brand",
                  )}
                >
                  {w.status === "current" ? "This week" : "Up next"}
                </span>
              )}
              <span
                className={clsx(
                  "relative z-10 flex size-14 items-center justify-center rounded-full transition group-hover:scale-110",
                  w.status === "done" && "bg-[#3a5dab] text-white",
                  w.status === "current" && "border-[3px] border-accent bg-card text-accent-ink",
                  w.status === "next" && "border-2 border-brand/70 bg-card text-brand",
                  w.status === "upcoming" && "border-2 border-line bg-card text-muted",
                )}
              >
                {w.status === "done" ? (
                  <Check size={26} strokeWidth={3} />
                ) : w.isContest ? (
                  <Trophy size={24} strokeWidth={2} />
                ) : (
                  <span className="font-serif text-2xl">{w.number ?? i + 1}</span>
                )}
              </span>
            </span>
            <span className="mt-3 font-mono text-[11px] tracking-wider text-muted uppercase">
              Week {w.number ?? i + 1}
              {w.status === "done" && <span className="text-brand"> · Done</span>}
            </span>
            <span
              className={clsx(
                "mt-1 line-clamp-2 font-serif text-[15px] leading-snug sm:text-base",
                w.status === "done" ? "text-muted" : "text-ink group-hover:text-brand",
              )}
            >
              {w.title}
            </span>
            <span className="mt-1 text-xs text-muted">{dateRange(w)}</span>
          </Link>
        );
      })}
    </div>
  );
}
