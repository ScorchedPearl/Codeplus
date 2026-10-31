"use client";

import { useActionState, useState } from "react";
import clsx from "clsx";
import { Star } from "lucide-react";
import { Field, FormMessage, inputClass, SubmitButton } from "@/components/admin/form";
import { submitFeedback, type FeedbackState } from "./actions";

const paces = [
  { value: "slow", label: "Too slow" },
  { value: "right", label: "Just right" },
  { value: "fast", label: "Too fast" },
];

export function FeedbackThanks() {
  return (
    <div className="rounded-2xl border border-brand/30 bg-brand-tint/40 p-6 text-center">
      <p className="font-serif text-xl text-ink">Thanks for your feedback!</p>
      <p className="mt-1.5 text-sm text-muted">It goes straight to the CodePlus team and helps us improve the next class.</p>
    </div>
  );
}

export function FeedbackForm({ classId, day }: { classId: string; day: string }) {
  const [state, action] = useActionState<FeedbackState, FormData>(submitFeedback, {});
  const [rating, setRating] = useState(0);

  if (state.sent) return <FeedbackThanks />;

  return (
    <form action={action} className="space-y-5 rounded-2xl border border-line bg-card/60 p-5 sm:p-6">
      <input type="hidden" name="classId" value={classId} />
      <input type="hidden" name="day" value={day} />
      {/* Honeypot: hidden from people, bots tend to fill it in */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] size-0" />

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-ink-soft">How was this class?</legend>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="cursor-pointer rounded-lg p-1 hover:bg-surface has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-sky">
              <input
                type="radio"
                name="rating"
                value={n}
                required
                checked={rating === n}
                onChange={() => setRating(n)}
                className="sr-only"
                aria-label={`${n} out of 5`}
              />
              <Star size={28} className={clsx("transition", n <= rating ? "fill-accent text-accent" : "text-muted")} />
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-ink-soft">How was the pace?</legend>
        <div className="flex flex-wrap gap-2">
          {paces.map((p) => (
            <label
              key={p.value}
              className="cursor-pointer rounded-full border border-line px-4 py-1.5 text-sm text-ink-soft transition hover:bg-surface has-[:checked]:border-brand/50 has-[:checked]:bg-brand-tint has-[:checked]:text-brand has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-sky"
            >
              <input type="radio" name="pace" value={p.value} className="sr-only" />
              {p.label}
            </label>
          ))}
        </div>
      </fieldset>

      <Field label="What worked well?">
        <textarea name="liked" rows={3} maxLength={2000} className={inputClass} />
      </Field>
      <Field label="What could be better?" hint="Be specific and kind: what was confusing, and what would have helped?">
        <textarea name="improve" rows={3} maxLength={2000} className={inputClass} />
      </Field>
      <Field label="Your name (optional)" hint="Leave this empty to stay anonymous.">
        <input name="name" maxLength={80} autoComplete="off" className={inputClass} />
      </Field>

      <FormMessage state={{ error: state.error }} />
      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton>Send feedback</SubmitButton>
        <p className="text-xs text-muted">Only the CodePlus team can read this. It&apos;s never shown publicly.</p>
      </div>
    </form>
  );
}
