import type { Metadata } from "next";
import { ComingSoon } from "@/components/ui/ComingSoon";

export const metadata: Metadata = { title: "Resources" };

export default function ResourcesPage() {
  return (
    <ComingSoon eyebrow="Resources & blogs" title="Learn at your own pace" body="A topic-by-topic path through CP, with problems, articles and blog posts." />
  );
}
