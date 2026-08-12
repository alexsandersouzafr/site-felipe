"use client";

import { useActionState } from "react";

import { type AuthActionState, updatePassword } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const initialState: AuthActionState = {};

export function UpdatePasswordForm() {
  const [state, formAction, pending] = useActionState(
    updatePassword,
    initialState,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nova senha</CardTitle>
        <CardDescription>
          Defina uma nova senha para continuar no painel.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="password" required>
                Nova senha
              </FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="confirmPassword" required>
                Confirmar senha
              </FieldLabel>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
              />
            </Field>
          </FieldGroup>
          {state.error && <FieldError>{state.error}</FieldError>}
          <Button type="submit" className="w-full" isDisabled={pending}>
            {pending ? "Salvando..." : "Atualizar senha"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
