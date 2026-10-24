import { getEventBySlug } from "@/lib/events";
import { site } from "@/lib/site";

const stamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
// RFC 5545 text escaping
const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/[,;]/g, (m) => `\\${m}`);

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const event = await getEventBySlug((await params).slug);
  if (!event) return new Response("Not found", { status: 404 });

  const url = `${site.url}/events/${event.slug}`;
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//CodePlus//Events//EN",
    "BEGIN:VEVENT",
    `UID:${event.id}@codeplus`,
    `DTSTAMP:${stamp(new Date().toISOString())}`,
    `DTSTART:${stamp(event.startTime)}`,
    `DTEND:${stamp(event.endTime)}`,
    `SUMMARY:${esc(event.name)}`,
    `DESCRIPTION:${esc(`${event.description}\n\n${url}`)}`,
    "LOCATION:IIIT Allahabad",
    `URL:${url}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${event.slug}.ics"`,
    },
  });
}
