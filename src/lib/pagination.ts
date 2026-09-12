export const ADMIN_PAGE_SIZE = 15;
export const PUBLIC_PAGE_SIZE = 12;

export function parsePage(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

/** Inclusive [from, to] row range for a Supabase `.range()` call. */
export function pageRange(page: number, pageSize: number) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  return { from, to };
}

export function pageCount(total: number, pageSize: number) {
  return Math.max(1, Math.ceil(total / pageSize));
}

/**
 * Keeps a requested page within [1, totalPages] — PostgREST's `.range()`
 * throws "Requested range not satisfiable" when `from` is past the last
 * row, which happens whenever a stale/typed-in page number exceeds the
 * current total (e.g. content was deleted, or someone edits the URL).
 */
export function clampPage(page: number, totalPages: number) {
  return Math.min(Math.max(page, 1), totalPages);
}
