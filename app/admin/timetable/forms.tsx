"use client";

import { useActionState, useState } from "react";
import { Field, FormMessage, inputClass, SubmitButton } from "@/components/admin/form";
import { saveBatch, saveClass, type FormState } from "./actions";

export function BatchForm({
  batch,
  nextOrder = 0,
}: {
  batch?: { id: string; name: string; sortOrder: number };
  nextOrder?: number;
}) {
  const [state, action] = useActionState<FormState, FormData>(saveBatch, {});
  return (
    <form action={action} className="flex flex-wrap items-end gap-3">
      {batch && <input type="hidden" name="id" value={batch.id} />}
      <Field label={batch ? "Name" : "New batch"} className="min-w-40 flex-1">
        <input name="name" required defaultValue={batch?.name} placeholder="e.g. 2025 batch" className={inputClass} />
      </Field>
      <Field label="Order" className="w-20">
        <input name="sortOrder" type="number" defaultValue={batch?.sortOrder ?? nextOrder} className={inputClass} />
      </Field>
      <SubmitButton variant={batch ? "secondary" : "primary"}>{batch ? "Save" : "Add batch"}</SubmitButton>
      {(state.error || state.ok) && (
        <div className="w-full">
          <FormMessage state={state} />
        </div>
      )}
    </form>
  );
}

export type ClassFormValues = {
  id?: string;
  batchId: string;
  topic: string;
  description: string;
  tas: string;
  venue: string;
  link: string;
  startTime: string;
  endTime: string;
  repeatUntil: string;
};

export function ClassForm({ initial, batches }: { initial: ClassFormValues; batches: { id: string; name: string }[] }) {
  const [state, action] = useActionState<FormState, FormData>(saveClass, {});
  const [repeats, setRepeats] = useState(!!initial.repeatUntil || !initial.id);

  return (
    <form action={action} className="space-y-6">
      {initial.id && <input type="hidden" name="id" value={initial.id} />}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Batch">
          <select name="batchId" required defaultValue={initial.batchId} className={inputClass}>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Topic">
          <input name="topic" required defaultValue={initial.topic} placeholder="Binary search" className={inputClass} />
        </Field>
        <Field label="First class starts (IST)">
          <input type="datetime-local" name="startTime" required defaultValue={initial.startTime} className={inputClass} />
        </Field>
        <Field label="First class ends (IST)">
          <input type="datetime-local" name="endTime" required defaultValue={initial.endTime} className={inputClass} />
        </Field>
      </div>

      <div className="rounded-2xl border border-line p-5">
        <label className="flex items-center gap-2.5 text-sm font-medium text-ink-soft">
          <input
            type="checkbox"
            name="repeats"
            checked={repeats}
            onChange={(e) => setRepeats(e.target.checked)}
            className="size-4 accent-[#2f4fa3]"
          />
          Repeats every week at the same time
        </label>
        {repeats && (
          <Field label="Last class on" hint="Inclusive. You can cancel single weeks after saving." className="mt-4 max-w-xs">
            <input type="date" name="repeatUntil" required defaultValue={initial.repeatUntil} className={inputClass} />
          </Field>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Venue">
          <input name="venue" defaultValue={initial.venue} placeholder="CC3 Lab, or Online" className={inputClass} />
        </Field>
        <Field label="TAs" hint="Comma-separated.">
          <input name="tas" defaultValue={initial.tas} className={inputClass} />
        </Field>
        <Field label="Material link (optional)" className="sm:col-span-2">
          <input type="url" name="link" defaultValue={initial.link} placeholder="https://" className={inputClass} />
        </Field>
        <Field label="Description (optional)" className="sm:col-span-2">
          <textarea name="description" rows={3} defaultValue={initial.description} className={inputClass} />
        </Field>
      </div>

      <FormMessage state={state} />
      <SubmitButton>{initial.id ? "Save changes" : "Add class"}</SubmitButton>
    </form>
  );
}
