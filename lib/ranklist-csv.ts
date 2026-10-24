// Parses a Codeforces-style ranklist CSV (e.g. "#, Who, =, Penalty, A, B, …") into one row per handle.
// Kept dependency-free with relative imports only, so the import script can run it directly with Node.

export type RanklistRow = { handle: string; rank: number; points: number; penalty: number; solved: number };

export type RanklistParse = {
  rows: RanklistRow[];
  skipped: { line: number; reason: string }[];
  columns: { rank?: string; handle: string; points?: string; penalty?: string; solved?: string; problems: string[] };
};

const HANDLE_RE = /^[A-Za-z0-9_.-]{2,24}$/;

const matchers = {
  rank: /^(#|rank|place|position|pos)$/i,
  handle: /^(who|handle|participant|user|username|party|contestant|name)$/i,
  points: /^(=|points?|score|total|total points)$/i,
  penalty: /^(penalty|pen\.?|time)$/i,
  solved: /^(solved|problems solved|accepted|ac)$/i,
  problem: /^[A-Z][0-9]?$/,
};

export function splitCsv(text: string): string[][] {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? "";
  const delimiter = [",", ";", "\t"].reduce((best, d) =>
    firstLine.split(d).length > firstLine.split(best).length ? d : best,
  );

  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === delimiter) {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += ch;
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.map((r) => r.map((c) => c.trim())).filter((r) => r.some(Boolean));
}

/** Codeforces marks some participants as "handle: CHEATER"; they're kept, the label is just removed from the handle. */
const CHEATER_RE = /:\s*CHEATER\b/i;

/**
 * "* tourist (Gennady) #" → "tourist", "tourist →to practice" → "tourist".
 * Team names keep their spaces so the handle check rejects them.
 */
export function cleanHandle(raw: string) {
  return raw
    .replace(/→.*$/, "")
    .replace(CHEATER_RE, "")
    .replace(/\(.*?\)/g, "")
    .replace(/^[*\s]+|[#*\s]+$/g, "");
}

function num(s: string | undefined) {
  const n = Number.parseFloat((s ?? "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export function parseRanklist(text: string): RanklistParse {
  const table = splitCsv(text.replace(/^﻿/, ""));
  const headerIdx = table.findIndex((r) => r.some((c) => matchers.handle.test(c)));
  if (headerIdx === -1) {
    throw new Error('Couldn\'t find a handle column. The CSV needs a header like "Who" or "Handle".');
  }

  const header = table[headerIdx];
  const find = (re: RegExp) => header.findIndex((c) => re.test(c));
  const col = {
    rank: find(matchers.rank),
    handle: find(matchers.handle),
    points: find(matchers.points),
    penalty: find(matchers.penalty),
    solved: find(matchers.solved),
  };
  const problemCols = header.flatMap((c, i) => (matchers.problem.test(c) ? [i] : []));

  const byHandle = new Map<string, RanklistRow>();
  const skipped: RanklistParse["skipped"] = [];
  let lastRank = 0;

  table.slice(headerIdx + 1).forEach((cells, i) => {
    const line = headerIdx + i + 2;
    const handle = cleanHandle(cells[col.handle] ?? "");
    if (!handle) return skipped.push({ line, reason: "empty handle" });
    // Codeforces standings end with an "Accepted / Tried" statistics row
    if (/^(accepted|tried)\b/i.test(handle)) return skipped.push({ line, reason: "statistics row" });
    if (!HANDLE_RE.test(handle)) return skipped.push({ line, reason: `"${cells[col.handle]}" isn't a Codeforces handle` });

    const rankCell = col.rank >= 0 ? cells[col.rank] : "";
    const rank = rankCell ? num(rankCell) || lastRank + 1 : lastRank + 1;
    lastRank = rank;

    const solvedFromProblems = problemCols.filter((p) => {
      const v = cells[p] ?? "";
      return v.startsWith("+") || (/^\d/.test(v) && num(v) > 0);
    }).length;

    const row: RanklistRow = {
      handle,
      rank,
      points: col.points >= 0 ? num(cells[col.points]) : solvedFromProblems,
      penalty: col.penalty >= 0 ? Math.round(num(cells[col.penalty])) : 0,
      solved: col.solved >= 0 ? num(cells[col.solved]) : solvedFromProblems,
    };

    const key = handle.toLowerCase();
    const existing = byHandle.get(key);
    if (existing) skipped.push({ line, reason: `duplicate of ${existing.handle}, kept the better rank` });
    if (!existing || row.rank < existing.rank) byHandle.set(key, row);
  });

  return {
    rows: [...byHandle.values()].sort((a, b) => a.rank - b.rank),
    skipped,
    columns: {
      rank: header[col.rank],
      handle: header[col.handle],
      points: header[col.points],
      penalty: header[col.penalty],
      solved: header[col.solved],
      problems: problemCols.map((p) => header[p]),
    },
  };
}
