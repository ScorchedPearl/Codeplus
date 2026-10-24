import type { Metadata } from "next";
import { requireMember } from "@/lib/auth";
import { PageHeader } from "@/components/admin/PageHeader";
import { EventForm } from "../EventForm";

export const metadata: Metadata = { title: "New event" };

export default async function NewEvent() {
  await requireMember();
  return (
    <>
      <PageHeader title="New event" />
      <EventForm
        initial={{
          name: "",
          slug: "",
          description: "",
          startTime: "",
          endTime: "",
          blogLink: "",
          image: "",
          organizers: "",
          prizes: "",
        }}
      />
    </>
  );
}
