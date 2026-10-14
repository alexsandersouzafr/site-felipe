"use client";

import Link from "next/link";
import { useActionState } from "react";

import { type AuthActionState, signIn } from "@/app/admin/actions";
import { submitKeepingValues } from "@/components/admin/submit-keeping-values";
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

export function LoginForm({
  unauthorized,
  sessionExpired,
}: {
  unauthorized?: boolean;
  /** Sent here by an action that found no session: say so, kindly. */
  sessionExpired?: boolean;
}) {
  const [state, formAction, pending] = useActionState(signIn, initialState);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Entrar no painel</CardTitle>
        <CardDescription>
          Use a conta de Felipe Magalhães para gerenciar o conteúdo do site.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sessionExpired && !state.error ? (
          <p
            role="status"
            className="mb-4 rounded-(--radius) border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground"
          >
            Sua sessão terminou. Entre novamente para continuar — o que não foi
            salvo antes disso precisa ser preenchido de novo.
          </p>
        ) : null}
        <form
          onSubmit={(event) => submitKeepingValues(event, formAction)}
          className="space-y-4"
        >
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email" required>
                E-mail
              </FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="password" required>
                Senha
              </FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </Field>
          </FieldGroup>
          {(unauthorized || state.error) && (
            <FieldError>
              {unauthorized
                ? "Esta conta não tem permissão de administrador."
                : state.error}
            </FieldError>
          )}
          <Button type="submit" className="w-full" isDisabled={pending}>
            {pending ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <Link
          href="/admin/forgot-password"
          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          Esqueci minha senha
        </Link>
      </CardFooter>
    </Card>
  );
}
