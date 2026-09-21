import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * Keeps the Supabase project awake. A free project is paused after a week
 * with too few queries, so a scheduled request here — a few a day is enough —
 * counts as activity. The query has to be real: a cached page would answer a
 * ping without ever reaching the database.
 */
export const dynamic = "force-dynamic";

const NO_STORE = { "cache-control": "no-store" };

export async function GET() {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("site_settings")
      .select("id")
      .limit(1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return NextResponse.json({ ok: true }, { headers: NO_STORE });
  } catch (error) {
    // The body stays empty of details; the reason belongs in the server log.
    console.error("Health check failed:", error);
    return NextResponse.json({ ok: false }, { status: 503, headers: NO_STORE });
  }
}
