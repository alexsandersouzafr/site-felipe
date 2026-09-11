import type { SupabaseClient } from "@supabase/supabase-js";

export type OrderedRow = { id: string; display_order: number };

export type ReorderDirection = "up" | "down";

export function parseReorderDirection(
  value: FormDataEntryValue | null,
): ReorderDirection | null {
  return value === "up" || value === "down" ? value : null;
}

/**
 * Swaps `display_order` between the row `id` and its neighbor in the given
 * direction, within an already-sorted (ascending by display_order) list.
 */
export async function swapDisplayOrder(
  supabase: SupabaseClient,
  table: string,
  rows: OrderedRow[],
  id: string,
  direction: ReorderDirection,
) {
  const index = rows.findIndex((row) => row.id === id);
  if (index === -1) {
    return;
  }

  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= rows.length) {
    return;
  }

  const current = rows[index];
  const target = rows[targetIndex];

  await Promise.all([
    supabase
      .from(table)
      .update({ display_order: target.display_order })
      .eq("id", current.id),
    supabase
      .from(table)
      .update({ display_order: current.display_order })
      .eq("id", target.id),
  ]);
}

/** Next display_order to append a new row at the end of the list. */
export async function nextDisplayOrder(
  supabase: SupabaseClient,
  table: string,
) {
  const { data } = await supabase
    .from(table)
    .select("display_order")
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  return ((data?.display_order as number | undefined) ?? -1) + 1;
}
