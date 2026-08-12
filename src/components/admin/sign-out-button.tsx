"use client";

import { signOut } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <Button type="submit" variant="outline">
        Sair
      </Button>
    </form>
  );
}
