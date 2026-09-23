"use client";

import { FloppyDiskIcon } from "@phosphor-icons/react";
import { useActionState } from "react";

import type { AppearanceActionState } from "@/app/admin/(protected)/aparencia/actions";
import { updateAppearance } from "@/app/admin/(protected)/aparencia/actions";
import { FormFeedback } from "@/components/admin/form-feedback";
import { Button } from "@/components/ui/button";
import type { SiteTheme } from "@/lib/site-theme";
import { cn } from "@/lib/utils";

const OPTIONS: Array<{ value: SiteTheme; label: string; description: string }> =
  [
    {
      value: "light",
      label: "Claro",
      description: "Fundo claro e texto escuro. Recomendado.",
    },
    {
      value: "dark",
      label: "Escuro",
      description: "Fundo escuro e texto claro.",
    },
    {
      value: "system",
      label: "Seguir o sistema",
      description: "Claro ou escuro conforme o aparelho de quem visita.",
    },
  ];

/** A tiny page sketch in the theme's colours. */
function ThemePreview({ theme }: { theme: SiteTheme }) {
  const half = (dark: boolean) => (
    <div
      className={cn(
        "flex h-full flex-1 flex-col gap-1.5 p-2.5",
        dark ? "bg-neutral-900" : "bg-white",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1/2 rounded-sm",
          dark ? "bg-neutral-200" : "bg-neutral-800",
        )}
      />
      <span
        className={cn(
          "h-1 w-3/4 rounded-sm",
          dark ? "bg-neutral-600" : "bg-neutral-300",
        )}
      />
      <span
        className={cn(
          "h-1 w-2/3 rounded-sm",
          dark ? "bg-neutral-600" : "bg-neutral-300",
        )}
      />
      <span className="mt-auto h-2 w-6 rounded-sm bg-primary" />
    </div>
  );

  return (
    <div className="flex h-20 overflow-hidden rounded-md border border-border/80">
      {theme === "dark" ? half(true) : half(false)}
      {theme === "system" ? half(true) : null}
    </div>
  );
}

export function AppearanceForm({ defaultTheme }: { defaultTheme: SiteTheme }) {
  const [state, formAction, pending] = useActionState(
    updateAppearance,
    {} as AppearanceActionState,
  );

  return (
    <form action={formAction} className="max-w-3xl space-y-8">
      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">Tema padrão do site</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer flex-col gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-muted/40 has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/30"
            >
              <input
                type="radio"
                name="defaultTheme"
                value={option.value}
                defaultChecked={option.value === defaultTheme}
                className="sr-only"
              />
              <ThemePreview theme={option.value} />
              <span>
                <span className="block font-medium">{option.label}</span>
                <span className="block text-xs text-muted-foreground">
                  {option.description}
                </span>
              </span>
            </label>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          Vale para quem visita o site pela primeira vez. Quem trocar o tema no
          botão do cabeçalho mantém a própria escolha naquele navegador.
        </p>
      </fieldset>

      <FormFeedback state={state} />
      <Button type="submit" isDisabled={pending}>
        <FloppyDiskIcon className="size-4" data-icon="inline-start" />
        {pending ? "Salvando..." : "Salvar aparência"}
      </Button>
    </form>
  );
}
