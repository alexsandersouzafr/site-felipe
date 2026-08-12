"use client";

import {
  CalendarPlusIcon,
  FloppyDiskIcon,
  NotePencilIcon,
  PaperPlaneTiltIcon,
} from "@phosphor-icons/react";
import { type ReactNode, useState } from "react";

import { DateTimePickerField } from "@/components/admin/date-time-picker-field";
import { SmoothReveal } from "@/components/admin/smooth-reveal";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import type { ContentStatus } from "@/lib/content-visibility";

function PublishingScheduleFields({
  scheduleEnabled,
  setScheduleEnabled,
  publishAt,
}: {
  scheduleEnabled: boolean;
  setScheduleEnabled: (value: boolean) => void;
  publishAt: string;
}) {
  return (
    <div className="rounded-3xl border border-border/80 bg-muted/20 p-4 transition-[padding,box-shadow] duration-300">
      <Field orientation="horizontal" className="items-center justify-between">
        <FieldLabel htmlFor="schedule-publish">Agendar publicação</FieldLabel>
        <Switch
          id="schedule-publish"
          isSelected={scheduleEnabled}
          onChange={setScheduleEnabled}
        />
      </Field>

      <SmoothReveal open={scheduleEnabled} className="mt-0">
        <div className="space-y-2 pt-4">
          <Field>
            <FieldLabel htmlFor="publishAt" required>
              Data e hora da publicação
            </FieldLabel>
            {scheduleEnabled ? (
              <DateTimePickerField
                id="publishAt"
                name="publishAt"
                required
                defaultValue={publishAt}
              />
            ) : null}
            <FieldDescription>
              O conteúdo fica público a partir desta data e hora.
            </FieldDescription>
          </Field>
        </div>
      </SmoothReveal>

      {scheduleEnabled ? null : (
        <input type="hidden" name="publishAt" value="" />
      )}
    </div>
  );
}

function PublishingSubmitButtons({
  mode,
  scheduleEnabled,
  pending,
}: {
  mode: "create" | "edit";
  scheduleEnabled: boolean;
  pending: boolean;
}) {
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
  );
}

export function PublishingControls({
  mode,
  initialStatus = "draft",
  publishAt = "",
  pending = false,
  children,
}: {
  mode: "create" | "edit";
  initialStatus?: ContentStatus;
  publishAt?: string;
  pending?: boolean;
  children: (slots: { schedule: ReactNode; actions: ReactNode }) => ReactNode;
}) {
  const [scheduleEnabled, setScheduleEnabled] = useState(
    initialStatus === "scheduled",
  );

  return children({
    schedule: (
      <PublishingScheduleFields
        scheduleEnabled={scheduleEnabled}
        setScheduleEnabled={setScheduleEnabled}
        publishAt={publishAt}
      />
    ),
    actions: (
      <PublishingSubmitButtons
        mode={mode}
        scheduleEnabled={scheduleEnabled}
        pending={pending}
      />
    ),
  });
}
