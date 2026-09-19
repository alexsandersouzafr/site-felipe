import type { ReactNode } from "react";

import { AdminPaginationNav } from "@/components/admin/pagination-nav";
import { ReorderableTbody } from "@/components/admin/reorderable-rows";

export function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex shrink-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl tracking-tight">{title}</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}

/**
 * Page frame for list screens. From tablet up it is exactly as tall as the
 * space left under the sticky admin header and the page padding, so the panel
 * inside can scroll on its own and the page itself never has to. It subtracts
 * the 56px admin header (`h-14`) plus the page padding: 48px up to `lg`, 64px
 * from `lg` up.
 */
export function AdminListPage({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-6 md:h-[max(30rem,calc(100svh-6.5rem))] lg:h-[max(30rem,calc(100svh-7.5rem))]">
      {children}
    </div>
  );
}

type AdminListPanelProps = {
  /** Primary action, usually the "add item" link. */
  actions?: ReactNode;
  /** Filter buttons, shown on the left of the header when the list has any. */
  filters?: ReactNode;
  pagination: {
    basePath: string;
    page: number;
    totalPages: number;
    extraParams?: Record<string, string | undefined>;
  };
  children: ReactNode;
};

/**
 * Wraps a list table (or its empty/error message) in a card whose header keeps
 * the filter, pagination and "add" controls in view. From tablet up the card
 * grows with its content up to the available height, then the body scrolls
 * under a fixed header; it never gets shorter than what is needed to show the
 * header and the table's first rows. On phones it is a plain toolbar above the
 * table.
 */
export function AdminListPanel({
  actions,
  filters,
  pagination,
  children,
}: AdminListPanelProps) {
  return (
    <section
      aria-label="Lista"
      className="flex min-h-0 flex-col gap-4 md:min-h-[16rem] md:flex-initial md:gap-0 md:rounded-3xl md:border md:border-border/80"
    >
      <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-3 md:border-b md:border-border/80 md:px-4 md:py-3">
        {filters}
        <div className="ml-auto flex flex-wrap items-center justify-end gap-x-4 gap-y-3">
          <AdminPaginationNav {...pagination} />
          {actions}
        </div>
      </div>
      <div className="min-h-0 md:flex-1 md:overflow-auto md:[&>p]:px-4 md:[&>p]:py-6">
        {children}
      </div>
    </section>
  );
}

type AdminTableHeader = string | { label: string; hideLabel?: boolean };

export function AdminDataTable({
  headers,
  reorder,
  children,
}: {
  headers: AdminTableHeader[];
  /**
   * Set on tables whose rows carry `ReorderButtons`: rows then slide into place
   * when moved. Give the rows a `key` equal to their id.
   */
  reorder?: { pageOffset: number; totalCount: number };
  children: ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-3xl border border-border/80 md:overflow-visible md:rounded-none md:border-0">
      <table className="w-full min-w-[40rem] text-left text-sm [&_tbody_tr:not([data-slide]):hover]:bg-muted/30 [&_tbody_tr]:transition-colors">
        <thead className="text-muted-foreground">
          <tr>
            {headers.map((header) => {
              const { label, hideLabel } =
                typeof header === "string"
                  ? { label: header, hideLabel: false }
                  : { hideLabel: false, ...header };

              return (
                <th
                  key={label}
                  className={`sticky top-0 z-[1] border-b border-border/80 bg-background px-4 py-2.5 text-xs font-medium tracking-[0.12em] uppercase ${label === "Ações" ? "text-right" : ""}`}
                >
                  {hideLabel ? <span className="sr-only">{label}</span> : label}
                </th>
              );
            })}
          </tr>
        </thead>
        {reorder ? (
          <ReorderableTbody {...reorder}>{children}</ReorderableTbody>
        ) : (
          <tbody>{children}</tbody>
        )}
      </table>
    </div>
  );
}
