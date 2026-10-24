// Calendar dates are IST day keys ("YYYY-MM-DD"). IST has no DST, so adding whole days in ms is safe.

const TZ = "Asia/Kolkata";
const DAY_MS = 86_400_000;

export type Batch = { id: string; slug: string; name: string };

export type ClassRow = {
  id: string;
  batchId: string;
  topic: string;
  description: string | null;
  tas: string[];
  venue: string | null;
  link: string | null;
  startTime: Date;
  endTime: Date;
  repeatUntil: string | null;
  cancelledDates: string[];
};

export type Session = {
  key: string; // class id + date, unique per occurrence
  classId: string;
  batchId: string;
  topic: string;
  description: string | null;
  tas: string[];
  venue: string | null;
  link: string | null;
  start: string; // ISO
  end: string;
  day: string; // IST day key
  cancelled: boolean;
};

export function dayKey(d: Date) {
  return d.toLocaleDateString("en-CA", { timeZone: TZ });
}

export function dayStart(key: string) {
  return new Date(`${key}T00:00:00+05:30`);
}

export function addDays(key: string, n: number) {
  const d = new Date(`${key}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function isDayKey(s: string | undefined): s is string {
  return !!s && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(dayStart(s).getTime());
}

/** Monday of the IST week containing `key`. */
export function weekOf(key: string) {
  const weekday = new Date(`${key}T00:00:00Z`).getUTCDay(); // 0 = Sunday
  return addDays(key, -((weekday + 6) % 7));
}

/** Expand classes into the sessions that fall within [from, to) IST days. */
export function sessionsBetween(rows: ClassRow[], from: string, to: string): Session[] {
  const windowStart = dayStart(from).getTime();
  const windowEnd = dayStart(to).getTime();
  const out: Session[] = [];

  for (const c of rows) {
    const first = c.startTime.getTime();
    const duration = c.endTime.getTime() - first;
    const step = 7 * DAY_MS;
    const last = c.repeatUntil ? dayStart(addDays(c.repeatUntil, 1)).getTime() : first + 1;

    let k = c.repeatUntil ? Math.max(0, Math.floor((windowStart - first - duration) / step)) : 0;
    for (let t = first + k * step; t < last && t < windowEnd; t = first + ++k * step) {
      if (t + duration <= windowStart) continue;
      const day = dayKey(new Date(t));
      out.push({
        key: `${c.id}:${day}`,
        classId: c.id,
        batchId: c.batchId,
        topic: c.topic,
        description: c.description,
        tas: c.tas,
        venue: c.venue,
        link: c.link,
        start: new Date(t).toISOString(),
        end: new Date(t + duration).toISOString(),
        day,
        cancelled: c.cancelledDates.includes(day),
      });
      if (!c.repeatUntil) break;
    }
  }

  return out.sort((a, b) => a.start.localeCompare(b.start));
}

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", { timeZone: TZ, hour: "numeric", minute: "2-digit", hour12: true });
}

export function formatDay(key: string, opts: Intl.DateTimeFormatOptions) {
  return dayStart(key).toLocaleDateString("en-IN", { timeZone: TZ, ...opts });
}

export function formatWeekRange(monday: string) {
  const sunday = addDays(monday, 6);
  const sameMonth = monday.slice(0, 7) === sunday.slice(0, 7);
  const a = formatDay(monday, sameMonth ? { day: "numeric" } : { day: "numeric", month: "short" });
  const b = formatDay(sunday, { day: "numeric", month: "short", year: "numeric" });
  return `${a} – ${b}`;
}

/** "Every Tuesday, 6:00 pm – 7:30 pm · 13 Oct → 15 Dec" or "Thu, 29 Oct, 5:00 pm – 6:30 pm" */
export function scheduleSummary(c: { startTime: Date; endTime: Date; repeatUntil: string | null }) {
  const time = `${formatTime(c.startTime.toISOString())} – ${formatTime(c.endTime.toISOString())}`;
  const first = dayKey(c.startTime);
  if (!c.repeatUntil) return `${formatDay(first, { weekday: "short", day: "numeric", month: "short" })}, ${time}`;
  const range = `${formatDay(first, { day: "numeric", month: "short" })} → ${formatDay(c.repeatUntil, { day: "numeric", month: "short" })}`;
  return `Every ${formatDay(first, { weekday: "long" })}, ${time} · ${range}`;
}
