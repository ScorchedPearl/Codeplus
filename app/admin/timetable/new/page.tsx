import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireMember } from "@/lib/auth";
import { getBatches } from "@/lib/classes";
import { PageHeader } from "@/components/admin/PageHeader";
import { ClassForm } from "../forms";

export const metadata: Metadata = { title: "New class" };

export default async function NewClass({ searchParams }: { searchParams: Promise<{ batch?: string }> }) {
  await requireMember();
  const batches = await getBatches();
  if (batches.length === 0) redirect("/admin/timetable");
  const { batch } = await searchParams;

  return (
    <>
      <PageHeader title="New class" />
      <ClassForm
        batches={batches}
        initial={{
          batchId: batches.find((b) => b.id === batch)?.id ?? batches[0].id,
          topic: "",
          description: "",
          tas: "",
          venue: "",
          link: "",
          startTime: "",
          endTime: "",
          repeatUntil: "",
        }}
      />
    </>
  );
}
