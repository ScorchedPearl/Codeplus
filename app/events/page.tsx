import type { Metadata } from "next";
import { ComingSoon } from "@/components/ui/ComingSoon";

export const metadata: Metadata = { title: "Events" };

export default function EventsPage() {
  return (
    <ComingSoon
      eyebrow="Events"
      title="Contests, workshops & more"
      body="Upcoming, ongoing and past CodePlus events will live here."
    />
  );
}
