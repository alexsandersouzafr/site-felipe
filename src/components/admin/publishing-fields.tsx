"use client";

import {
  CalendarPlusIcon,
  FloppyDiskIcon,
  NotePencilIcon,
  PaperPlaneTiltIcon,
} from "@phosphor-icons/react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { ContentStatus } from "@/lib/content-visibility";

export function PublishingControls({
  mode,
  initialStatus = "draft",
  publishAt = "",
  pending = false,
}: {
  mode: "create" | "edit";
  initialStatus?: ContentStatus;
  publishAt?: string;
  pending?: boolean;
}) {
  const [scheduleEnabled, setScheduleEnabled] = useState(
    initialStatus === "scheduled",
  );

  const primaryIntent = scheduleEnabled ? "schedule" : "publish";
  const primaryLabel =
    mode === "edit"
      ? "Salvar"
      : scheduleEnabled
        ? "Agendar publicação"
        : "Publicar";

  const PrimaryIcon =
    mode === "edit"
      ? FloppyDiskIcon
      : scheduleEnabled
        ? CalendarPlusIcon
        : PaperPlaneTiltIcon;

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-3xl border border-border/80 bg-muted/20 p-4">
        <Field
          orientation="horizontal"
          className="items-center justify-between"
        >
          <FieldLabel htmlFor="schedule-publish">Agendar publicação</FieldLabel>
          <Switch
            id="schedule-publish"
            isSelected={scheduleEnabled}
            onChange={setScheduleEnabled}
          />
        </Field>

        {scheduleEnabled ? (
          <Field>
            <FieldLabel htmlFor="publishAt">
              Data e hora da publicação
            </FieldLabel>
            <Input
              id="publishAt"
              name="publishAt"
              type="datetime-local"
              required
              defaultValue={publishAt}
            />
            <FieldDescription>
              O conteúdo fica público a partir desta data e hora.
            </FieldDescription>
          </Field>
        ) : (
          <input type="hidden" name="publishAt" value="" />
        )}
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="submit"
          name="intent"
          value="draft"
          variant="outline"
          isDisabled={pending}
        >
          <NotePencilIcon className="size-4" data-icon="inline-start" />
          Salvar rascunho
        </Button>
        <Button
          type="submit"
          name="intent"
          value={primaryIntent}
          isDisabled={pending}
        >
          <PrimaryIcon className="size-4" data-icon="inline-start" />
          {pending ? "Salvando..." : primaryLabel}
        </Button>
      </div>
    </div>
  );
}
