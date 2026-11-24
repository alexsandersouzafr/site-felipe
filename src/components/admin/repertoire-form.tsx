"use client";

import { FloppyDiskIcon, PlusIcon } from "@phosphor-icons/react";
import { useActionState, useEffect, useState } from "react";

import type { RepertoireActionState } from "@/app/admin/(protected)/repertorio/actions";
import { FormFeedback } from "@/components/admin/form-feedback";
import { submitKeepingValues } from "@/components/admin/submit-keeping-values";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  MAX_REPERTOIRE_TEXT,
  REPERTOIRE_GENRE_LABELS,
  REPERTOIRE_GENRES,
  type RepertoireGenre,
} from "@/lib/repertoire";

const GENRE_HINTS: Record<RepertoireGenre, string> = {
  classical: "Coluna da esquerda na página.",
  popular: "Coluna da direita na página.",
};

export function RepertoireForm({
  action,
  mode,
  composers,
  initialValues,
}: {
  action: (
    prev: RepertoireActionState,
    formData: FormData,
  ) => Promise<RepertoireActionState>;
  mode: "create" | "edit";
  /** Names already in use, offered as the composer is typed. */
  composers: string[];
  initialValues?: {
    title?: string;
    composer?: string;
    genre?: RepertoireGenre;
  };
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const genre = initialValues?.genre ?? "classical";
  // Enter in a field submits with the first button, "Salvar".
  const [pressed, setPressed] = useState<"save" | "another" | null>(null);
  const busy = pressed ?? "save";

  useEffect(() => {
    if (!pending) {
      setPressed(null);
    }
  }, [pending]);

  return (
    <form
      onSubmit={(event) => submitKeepingValues(event, formAction)}
      className="max-w-3xl space-y-8"
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="title" required>
            Obra
          </FieldLabel>
          <Input
            id="title"
            name="title"
            required
            maxLength={MAX_REPERTOIRE_TEXT}
            defaultValue={initialValues?.title}
            // The composer is usually carried over from the last work saved.
            autoFocus={mode === "create" && Boolean(initialValues?.composer)}
            placeholder="Ex.: Sinfonia nº 5 em dó menor"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="composer" required>
            Compositor
          </FieldLabel>
          <Input
            id="composer"
            name="composer"
            list="repertoire-composers"
            required
            maxLength={MAX_REPERTOIRE_TEXT}
            defaultValue={initialValues?.composer}
            autoComplete="off"
            placeholder="Ex.: Ludwig van Beethoven"
          />
          <datalist id="repertoire-composers">
            {composers.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
          <FieldDescription>
            As obras são agrupadas pelo nome do compositor: escreva-o sempre do
            mesmo jeito. Os nomes já cadastrados aparecem como sugestão.
          </FieldDescription>
        </Field>

        <fieldset className="space-y-2">
          <legend className="flex gap-1 text-sm font-medium">
            Gênero
            <span className="text-destructive" aria-hidden="true">
              *
            </span>
          </legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {REPERTOIRE_GENRES.map((option) => (
              <label
                key={option}
                className="flex cursor-pointer flex-col gap-1 rounded-xl border border-border p-4 transition-colors hover:bg-muted/40 has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/30"
              >
                <input
                  type="radio"
                  name="genre"
                  value={option}
                  required
                  defaultChecked={genre === option}
                  className="sr-only"
                />
                <span className="font-medium">
                  {REPERTOIRE_GENRE_LABELS[option]}
                </span>
                <span className="text-xs text-muted-foreground">
                  {GENRE_HINTS[option]}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </FieldGroup>

      <FormFeedback state={state} />
      <div className="flex flex-wrap gap-3">
        <Button
          type="submit"
          onPress={() => setPressed("save")}
          isPending={pending && busy === "save"}
          isDisabled={pending && busy !== "save"}
        >
          <FloppyDiskIcon className="size-4" data-icon="inline-start" />
          {pending && busy === "save"
            ? "Salvando..."
            : mode === "create"
              ? "Salvar"
              : "Salvar alterações"}
        </Button>
        {mode === "create" ? (
          <Button
            type="submit"
            variant="outline"
            name="next"
            value="another"
            onPress={() => setPressed("another")}
            isPending={pending && busy === "another"}
            isDisabled={pending && busy !== "another"}
          >
            <PlusIcon className="size-4" data-icon="inline-start" />
            {pending && busy === "another"
              ? "Salvando..."
              : "Salvar e adicionar outra"}
          </Button>
        ) : null}
      </div>
    </form>
  );
}
