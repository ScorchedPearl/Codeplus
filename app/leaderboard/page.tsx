import type { Metadata } from "next";
import { ComingSoon } from "@/components/ui/ComingSoon";

export const metadata: Metadata = { title: "Leaderboard" };

export default function LeaderboardPage() {
  return (
    <ComingSoon eyebrow="Leaderboard" title="Standings" body="Codeforces results from every CodePlus contest, added up." />
  );
}
