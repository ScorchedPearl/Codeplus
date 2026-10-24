"use client";

import { useActionState, useState } from "react";
import { Field, FormMessage, inputClass, SubmitButton } from "@/components/admin/form";
import { slugify } from "@/lib/admin-utils";
import { saveEvent, type FormState } from "./actions";

export type EventFormValues = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  startTime: string; // IST input value
  endTime: string;
  blogLink: string;
  image: string;
  organizers: string;
  prizes: string;
};

export function EventForm({ initial }: { initial: EventFormValues }) {
  const [state, action] = useActionState<FormState, FormData>(saveEvent, {});
  const [name, setName] = useState(initial.name);
  const [slug, setSlug] = useState(initial.slug);
  const [slugTouched, setSlugTouched] = useState(!!initial.id);
  const [preview, setPreview] = useState(initial.image);
  const uploaded = initial.image.startsWith("/api/images/");

  return (
    <form action={action} className="space-y-6">
      {initial.id && <input type="hidden" name="id" value={initial.id} />}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" className="sm:col-span-2">
          <input
            name="name"
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
            className={inputClass}
            placeholder="CodePlus Weekly Contest #1"
          />
        </Field>
        <Field label="URL name" hint={`codeplus/events/${slug || "…"}`} className="sm:col-span-2">
          <input
            name="slug"
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            className={inputClass}
          />
        </Field>
        <Field label="Starts (IST)">
          <input type="datetime-local" name="startTime" required defaultValue={initial.startTime} className={inputClass} />
        </Field>
        <Field label="Ends (IST)">
          <input type="datetime-local" name="endTime" required defaultValue={initial.endTime} className={inputClass} />
        </Field>
      </div>

      <Field label="Description" hint="Line breaks are kept.">
        <textarea name="description" required rows={6} defaultValue={initial.description} className={inputClass} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Organisers" hint="Comma-separated or one per line.">
          <textarea name="organizers" rows={3} defaultValue={initial.organizers} className={inputClass} />
        </Field>
        <Field label="Prizes (optional)" hint="One per line.">
          <textarea name="prizes" rows={3} defaultValue={initial.prizes} className={inputClass} />
        </Field>
        <Field label="Blog link (optional)" className="sm:col-span-2">
          <input type="url" name="blogLink" defaultValue={initial.blogLink} placeholder="https://" className={inputClass} />
        </Field>
      </div>

      <fieldset className="rounded-2xl border border-line p-5">
        <legend className="px-1 text-sm font-medium text-ink-soft">Poster (optional)</legend>
        <div className="grid gap-5 sm:grid-cols-[1fr_200px]">
          <div className="space-y-4">
            <Field label="Upload an image" hint="JPG, PNG, WebP or GIF, up to 4 MB.">
              <input
                type="file"
                name="imageFile"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setPreview(URL.createObjectURL(f));
                }}
                className="block w-full text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-surface file:px-4 file:py-2 file:text-sm file:text-ink hover:file:bg-surface-2"
              />
            </Field>
            <Field label="…or paste an image link">
              <input
                type="url"
                name="imageUrl"
                defaultValue={uploaded ? "" : initial.image}
                placeholder="https://"
                onChange={(e) => setPreview(e.target.value)}
                className={inputClass}
              />
            </Field>
            {initial.image && (
              <label className="flex items-center gap-2 text-sm text-ink-soft">
                <input type="checkbox" name="removeImage" className="accent-[#e5383b]" /> Remove the current poster
              </label>
            )}
          </div>
          {preview ? (
            // Preview of a local file or any URL
            <img src={preview} alt="" className="aspect-video w-full rounded-xl border border-line object-cover" />
          ) : (
            <div className="flex aspect-video items-center justify-center rounded-xl border border-dashed border-line text-xs text-muted">
              No poster
            </div>
          )}
        </div>
      </fieldset>

      <FormMessage state={state} />
      <div className="flex gap-3">
        <SubmitButton>{initial.id ? "Save changes" : "Create event"}</SubmitButton>
      </div>
    </form>
  );
}
