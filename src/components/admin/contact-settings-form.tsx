"use client";

import { FloppyDiskIcon } from "@phosphor-icons/react";
import { useActionState } from "react";

import type { ContactActionState } from "@/app/admin/(protected)/contato/actions";
import { updateContactSettings } from "@/app/admin/(protected)/contato/actions";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ContactSettings = {
  id: string;
  contact_email: string | null;
  contact_phone: string | null;
  intro_pt: string;
  intro_en: string | null;
  intro_es: string | null;
  social_links: Array<{ label: string; url: string }> | null;
};

export function ContactSettingsForm({
  settings,
}: {
  settings: ContactSettings;
}) {
  const [state, formAction, pending] = useActionState(
    updateContactSettings,
    {} as ContactActionState,
  );

  const socialText = (settings.social_links ?? [])
    .map((item) => `${item.label}|${item.url}`)
    .join("\n");

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="id" value={settings.id} />
      <FieldGroup>
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="contactEmail">E-mail</FieldLabel>
            <Input
              id="contactEmail"
              name="contactEmail"
              type="email"
              defaultValue={settings.contact_email ?? ""}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="contactPhone">Telefone</FieldLabel>
            <Input
              id="contactPhone"
              name="contactPhone"
              defaultValue={settings.contact_phone ?? ""}
            />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="introPt">Introdução (PT)</FieldLabel>
          <Textarea
            id="introPt"
            name="introPt"
            required
            defaultValue={settings.intro_pt}
          />
        </Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="introEn">Introdução (EN)</FieldLabel>
            <Textarea
              id="introEn"
              name="introEn"
              defaultValue={settings.intro_en ?? ""}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="introEs">Introdução (ES)</FieldLabel>
            <Textarea
              id="introEs"
              name="introEs"
              defaultValue={settings.intro_es ?? ""}
            />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="socialLinks">
            Redes sociais (uma por linha: rótulo|url)
          </FieldLabel>
          <Textarea
            id="socialLinks"
            name="socialLinks"
            rows={4}
            defaultValue={socialText}
            placeholder="Instagram|https://instagram.com/..."
          />
        </Field>
      </FieldGroup>
      {state.error && <FieldError>{state.error}</FieldError>}
      {state.success && (
        <p className="text-sm text-muted-foreground">{state.success}</p>
      )}
      <Button type="submit" isDisabled={pending}>
        <FloppyDiskIcon className="size-4" data-icon="inline-start" />
        {pending ? "Salvando..." : "Salvar contato"}
      </Button>
    </form>
  );
}
