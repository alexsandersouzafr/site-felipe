"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  type AuthActionState,
  requestPasswordReset,
} from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    requestPasswordReset,
    initialState,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recuperar senha</CardTitle>
        <CardDescription>
          Enviaremos um link de redefinição para o e-mail da conta.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">E-mail</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
              />
            </Field>
          </FieldGroup>
          {state.error && <FieldError>{state.error}</FieldError>}
          {state.success && (
            <p className="text-sm text-muted-foreground">{state.success}</p>
          )}
          <Button type="submit" className="w-full" isDisabled={pending}>
            {pending ? "Enviando..." : "Enviar link"}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <Link
          href="/admin/login"
          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          Voltar ao login
        </Link>
      </CardFooter>
    </Card>
  );
}
