import Link from "next/link";
import { notFound } from "next/navigation";

import {
  type EventActionState,
  updateEvent,
} from "@/app/admin/(protected)/agenda/actions";
import { DeleteEventButton } from "@/components/admin/delete-event-button";
import { EventForm } from "@/components/admin/event-form";
import type { EventRecord } from "@/lib/events";
import { toEventFormValues } from "@/lib/events";
import { createClient } from "@/lib/supabase/server";

type EditEventPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!data) {
    notFound();
  }

  const event = data as EventRecord;
  const boundUpdate = updateEvent.bind(null, event.id) as (
    prev: EventActionState,
    formData: FormData,
  ) => Promise<EventActionState>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            <Link href="/admin/agenda" className="underline underline-offset-4">
              Agenda
            </Link>{" "}
            / Editar
          </p>
          <h1 className="font-heading text-3xl tracking-tight">
            {event.title_pt}
          </h1>
        </div>
        <DeleteEventButton id={event.id} />
      </div>
      <EventForm
        action={boundUpdate}
        initialValues={toEventFormValues(event)}
        mode="edit"
      />
    </div>
  );
}
