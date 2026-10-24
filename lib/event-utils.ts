export type ClubEvent = {
  id: string;
  slug: string;
  name: string;
  image: string | null;
  description: string;
  blogLink: string | null;
  startTime: string; // ISO
  endTime: string;
  organizers: string[];
  prizes: string[] | null;
};

export type EventStatus = "upcoming" | "ongoing" | "past";

export function eventStatus(e: Pick<ClubEvent, "startTime" | "endTime">, now = new Date()): EventStatus {
  if (new Date(e.endTime) <= now) return "past";
  if (new Date(e.startTime) <= now) return "ongoing";
  return "upcoming";
}

const ist = { timeZone: "Asia/Kolkata" } as const;

export function formatEventDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { ...ist, weekday: "short", day: "numeric", month: "short" });
}

export function formatEventLongDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    ...ist,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatEventTime(start: string, end: string) {
  const t = (iso: string) =>
    new Date(iso).toLocaleTimeString("en-IN", { ...ist, hour: "numeric", minute: "2-digit", hour12: true });
  const sameDay = formatEventDate(start) === formatEventDate(end);
  return sameDay ? `${t(start)} – ${t(end)} IST` : `${t(start)} – ${formatEventDate(end)}, ${t(end)} IST`;
}

/** Date parts for the small calendar tile on event cards. */
export function dateTile(iso: string) {
  const d = new Date(iso);
  const part = (o: Intl.DateTimeFormatOptions) => d.toLocaleDateString("en-IN", { ...ist, ...o });
  return { weekday: part({ weekday: "short" }), day: part({ day: "numeric" }), month: part({ month: "short" }) };
}

export function googleCalendarUrl(e: ClubEvent, pageUrl: string) {
  const fmt = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: e.name,
    dates: `${fmt(e.startTime)}/${fmt(e.endTime)}`,
    details: `${e.description}\n\n${pageUrl}`,
    location: "IIIT Allahabad",
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}
