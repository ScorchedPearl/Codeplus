// Helpers for admin forms. Form date-times are entered and shown in IST.

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Date → "YYYY-MM-DDTHH:mm" in IST, for <input type="datetime-local"> */
export function toIstInput(d: Date | string | null | undefined) {
  if (!d) return "";
  const ist = new Date(new Date(d).getTime() + 5.5 * 3_600_000);
  return ist.toISOString().slice(0, 16);
}

/** "YYYY-MM-DDTHH:mm" entered as IST → Date, or null if invalid */
export function fromIstInput(v: FormDataEntryValue | null) {
  const s = String(v ?? "");
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s)) return null;
  const d = new Date(`${s}:00+05:30`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** One item per line (or comma for single-line inputs), trimmed, empties dropped */
export function lines(v: FormDataEntryValue | null, splitCommas = false) {
  return String(v ?? "")
    .split(splitCommas ? /[\n,]/ : /\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function optional(v: FormDataEntryValue | null) {
  const s = String(v ?? "").trim();
  return s || null;
}

export function isHttpUrl(s: string) {
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}
