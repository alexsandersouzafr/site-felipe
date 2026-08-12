import Link from "next/link";

import { createEvent } from "@/app/admin/(protected)/agenda/actions";
import { EventForm } from "@/components/admin/event-form";

export default function NewEventPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          <Link href="/admin/agenda" className="underline underline-offset-4">
            Agenda
          </Link>{" "}
          / Novo evento
        </p>
        <h1 className="font-heading text-3xl tracking-tight">Novo evento</h1>
      </div>
      <EventForm action={createEvent} mode="create" />
    </div>
  );
}
