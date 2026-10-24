import type { Metadata } from "next";
import Link from "next/link";
import { requireMember } from "@/lib/auth";
import { getBatches } from "@/lib/classes";
import { getContests } from "@/lib/leaderboard";
import { dayKey, formatDay } from "@/lib/calendar-utils";
import { PageHeader, Panel } from "@/components/admin/PageHeader";
import { SubmitButton } from "@/components/admin/form";
import { UploadForm } from "./UploadForm";
import { deleteContest } from "./actions";

export const metadata: Metadata = { title: "Leaderboard" };

export default async function AdminLeaderboard({
  searchParams,
}: {
  searchParams: Promise<{ imported?: string; n?: string }>;
}) {
  await requireMember();
  const { imported, n } = await searchParams;
  const [batches, list] = await Promise.all([getBatches(), getContests()]);
  const batchName = Object.fromEntries(batches.map((b) => [b.id, b.name]));

  return (
    <>
      <PageHeader title="Leaderboard" intro="Upload a Codeforces ranklist after each contest. Scores are taken from it as-is." />
      {imported && (
        <p className="mb-6 rounded-lg bg-brand-tint px-3 py-2 text-sm text-brand">
          Added &ldquo;{imported}&rdquo; with {n} participants.{" "}
          <Link href="/leaderboard" className="underline">
            See the leaderboard
          </Link>
        </p>
      )}

      <Panel title="Upload a ranklist">
        <UploadForm batches={batches} today={dayKey(new Date())} />
      </Panel>

      <Panel title="Contests" className="mt-6">
        {list.length === 0 ? (
          <p className="text-sm text-muted">No contests yet.</p>
        ) : (
          <ul className="divide-y divide-line">
            {list.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-ink">{c.name}</p>
                  <p className="mt-0.5 font-mono text-xs text-muted">
                    {formatDay(c.heldOn, { day: "numeric", month: "short", year: "numeric" })} · {c.participants} participants ·{" "}
                    {c.batchId ? batchName[c.batchId] : "All batches"}
                  </p>
                </div>
                <form action={deleteContest}>
                  <input type="hidden" name="id" value={c.id} />
                  <SubmitButton variant="danger" className="px-3.5 py-1.5" confirm={`Remove "${c.name}" and its results from the leaderboard?`}>
                    Delete
                  </SubmitButton>
                </form>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}
