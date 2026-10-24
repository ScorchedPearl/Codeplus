"use client";

import { useActionState, useMemo, useState } from "react";
import { FileSpreadsheet } from "lucide-react";
import { Field, FormMessage, inputClass, SubmitButton } from "@/components/admin/form";
import { parseRanklist, type RanklistParse } from "@/lib/ranklist-csv";
import { importContest, type FormState } from "./actions";

export function UploadForm({ batches, today }: { batches: { id: string; name: string }[]; today: string }) {
  const [state, action] = useActionState<FormState, FormData>(importContest, {});
  const [csv, setCsv] = useState("");
  const [fileName, setFileName] = useState("");

  const parsed = useMemo((): { ok: RanklistParse } | { error: string } | null => {
    if (!csv) return null;
    try {
      return { ok: parseRanklist(csv) };
    } catch (e) {
      return { error: (e as Error).message };
    }
  }, [csv]);

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="csv" value={csv} />

      <label className="flex cursor-pointer flex-col items-center rounded-2xl border border-dashed border-line px-6 py-8 text-center transition hover:border-brand/40 hover:bg-surface/50">
        <FileSpreadsheet size={26} className="text-brand" />
        <span className="mt-3 text-sm text-ink">{fileName || "Choose the Codeforces ranklist CSV"}</span>
        <span className="mt-1 text-xs text-muted">
          Columns like <code className="font-mono">#, Who, =, Penalty, A, B…</code> or <code className="font-mono">Rank, Handle, Points</code>
        </span>
        <input
          type="file"
          accept=".csv,text/csv,text/plain"
          className="sr-only"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            setFileName(f.name);
            setCsv(await f.text());
          }}
        />
      </label>

      {parsed && "error" in parsed && <FormMessage state={{ error: parsed.error }} />}

      {parsed && "ok" in parsed && (
        <div className="rounded-2xl border border-line bg-card/60 p-5">
          <p className="text-sm text-ink">
            <strong>{parsed.ok.rows.length}</strong> participants found
            {parsed.ok.skipped.length > 0 && <span className="text-muted"> · {parsed.ok.skipped.length} lines skipped</span>}
          </p>
          <p className="mt-1 font-mono text-xs text-muted">
            handle ← {parsed.ok.columns.handle}
            {parsed.ok.columns.rank && ` · rank ← ${parsed.ok.columns.rank}`}
            {parsed.ok.columns.points && ` · points ← ${parsed.ok.columns.points}`}
            {parsed.ok.columns.penalty && ` · penalty ← ${parsed.ok.columns.penalty}`}
            {!parsed.ok.columns.solved && parsed.ok.columns.problems.length > 0 && ` · solved ← ${parsed.ok.columns.problems.join(" ")}`}
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left font-mono text-[11px] tracking-wider text-muted uppercase">
                  <th className="py-1.5 pr-4 font-normal">Rank</th>
                  <th className="py-1.5 pr-4 font-normal">Handle</th>
                  <th className="py-1.5 pr-4 text-right font-normal">Solved</th>
                  <th className="py-1.5 pr-4 text-right font-normal">Penalty</th>
                  <th className="py-1.5 text-right font-normal">Points</th>
                </tr>
              </thead>
              <tbody>
                {parsed.ok.rows.slice(0, 8).map((r) => (
                  <tr key={r.handle} className="border-t border-line">
                    <td className="py-1.5 pr-4 font-mono text-muted">{r.rank}</td>
                    <td className="py-1.5 pr-4 text-ink">{r.handle}</td>
                    <td className="py-1.5 pr-4 text-right">{r.solved}</td>
                    <td className="py-1.5 pr-4 text-right">{r.penalty}</td>
                    <td className="py-1.5 text-right text-ink">{r.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {parsed.ok.rows.length > 8 && <p className="mt-2 text-xs text-muted">…and {parsed.ok.rows.length - 8} more</p>}
          </div>
          {parsed.ok.skipped.length > 0 && (
            <details className="mt-4 text-sm">
              <summary className="cursor-pointer text-muted">Skipped lines</summary>
              <ul className="mt-2 space-y-1 font-mono text-xs text-muted">
                {parsed.ok.skipped.map((s) => (
                  <li key={s.line}>
                    line {s.line}: {s.reason}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Contest name" className="sm:col-span-2">
          <input name="name" required placeholder="CodePlus Weekly Contest #1" className={inputClass} />
        </Field>
        <Field label="Held on">
          <input type="date" name="heldOn" required defaultValue={today} className={inputClass} />
        </Field>
        <Field label="Batch">
          <select name="batchId" defaultValue="" className={inputClass}>
            <option value="">Open to all batches</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Codeforces link (optional)" className="sm:col-span-2">
          <input type="url" name="url" placeholder="https://codeforces.com/group/…/contest/…" className={inputClass} />
        </Field>
      </div>

      <FormMessage state={state} />
      <SubmitButton>Add to leaderboard</SubmitButton>
    </form>
  );
}
