import type { Metadata } from "next";
import { ComingSoon } from "@/components/ui/ComingSoon";

export const metadata: Metadata = { title: "Calendar" };

export default function CalendarPage() {
  return (
    <ComingSoon eyebrow="Calendar" title="Class timetable" body="Pick your batch and see when the next CodePlus class happens." />
  );
}
