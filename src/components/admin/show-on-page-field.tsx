"use client";

import { useId, useState } from "react";

import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";

export function ShowOnPageField({
  defaultSelected = false,
  help,
}: {
  defaultSelected?: boolean;
  help: string;
}) {
  const id = useId();
  const [selected, setSelected] = useState(defaultSelected);

  return (
    <div className="space-y-2 rounded-3xl border border-border/80 bg-muted/20 p-4">
      <input
        type="hidden"
        name="showOnPage"
        value={selected ? "true" : "false"}
      />
      <Field orientation="horizontal" className="items-center justify-between">
        <FieldLabel htmlFor={id}>Exibir na página</FieldLabel>
        <Switch id={id} isSelected={selected} onChange={setSelected} />
      </Field>
      <FieldDescription>{help}</FieldDescription>
    </div>
  );
}
