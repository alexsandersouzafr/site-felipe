import type { ReactNode } from "react";

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
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl tracking-tight">{title}</h1>
        <p className="max-w-2xl text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function AdminDataTable({
  headers,
  children,
}: {
  headers: string[];
  children: ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-3xl border border-border/80">
      <table className="w-full min-w-[40rem] text-left text-sm">
        <thead className="border-b border-border/80 text-muted-foreground">
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                className={`px-4 py-3 font-medium ${header === "Ações" ? "text-right" : ""}`}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
