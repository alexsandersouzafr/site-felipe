import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

/** Where an admin whose session ended is sent, so the login can say why. */
export const SESSION_EXPIRED_LOGIN = "/admin/login?sessao=expirada";

/**
 * The gate every admin Server Action passes before doing anything.
 *
 * The proxy cannot be that gate for actions: it answers a missing session
 * with a redirect, and the browser then receives the login page's HTML where
 * it expects the action's reply — which surfaces as "An unexpected response
 * was received from the server" and the admin's error screen. A redirect
 * thrown from inside the action is one Next.js follows properly.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(SESSION_EXPIRED_LOGIN);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_admin) {
    redirect("/admin/login?error=unauthorized");
  }
}
