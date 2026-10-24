import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { ArrowUpRight } from "lucide-react";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { requireMember } from "@/lib/auth";
import { toIstInput } from "@/lib/admin-utils";
import { PageHeader, Panel } from "@/components/admin/PageHeader";
import { SubmitButton } from "@/components/admin/form";
import { EventForm } from "../EventForm";
import { deleteEvent } from "../actions";

export const metadata: Metadata = { title: "Edit event" };

export default async function EditEvent({ params }: { params: Promise<{ id: string }> }) {
  await requireMember();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [e] = await db.select().from(events).where(eq(events.id, id)).limit(1);
  if (!e) notFound();

  return (
    <>
      <PageHeader title="Edit event" />
      <Link href={`/events/${e.slug}`} target="_blank" className="-mt-5 mb-6 inline-flex items-center gap-1 text-sm text-brand hover:underline">
        View public page <ArrowUpRight size={14} />
      </Link>
      <EventForm
        initial={{
          id: e.id,
          name: e.name,
          slug: e.slug,
          description: e.description,
          startTime: toIstInput(e.startTime),
          endTime: toIstInput(e.endTime),
          blogLink: e.blogLink ?? "",
          image: e.image ?? "",
          organizers: e.organizers.join(", "),
          prizes: (e.prizes ?? []).join("\n"),
        }}
      />
      <Panel title="Delete event" className="mt-10">
        <p className="mb-4 text-sm text-muted">This removes the event and its poster from the site. It can&apos;t be undone.</p>
        <form action={deleteEvent}>
          <input type="hidden" name="id" value={e.id} />
          <SubmitButton variant="danger" confirm={`Delete "${e.name}"? This can't be undone.`}>
            Delete event
          </SubmitButton>
        </form>
      </Panel>
    </>
  );
}
