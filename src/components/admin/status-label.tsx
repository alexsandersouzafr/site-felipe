import { ClockIcon } from "@phosphor-icons/react/dist/ssr";

import type { ContentStatus } from "@/lib/content-visibility";
import { cn } from "@/lib/utils";

const labels: Record<ContentStatus, string> = {
  draft: "Rascunho",
  scheduled: "Agendado",
  published: "Publicado",
};

/**
 * Publication status as a small mark plus its name. The mark carries the
 * meaning by shape, not by colour: solid dot = published, hollow dot = draft,
 * clock = scheduled.
 */
export function StatusLabel({ status }: { status: ContentStatus }) {
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
      {status === "scheduled" ? (
        <ClockIcon className="size-3.5 text-foreground" aria-hidden="true" />
      ) : (
        <span
          aria-hidden="true"
          className={cn(
            "size-2 rounded-full border border-foreground",
            status === "published" ? "bg-foreground" : "border-dashed",
          )}
        />
      )}
      {labels[status]}
    </span>
  );
}
