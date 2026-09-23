import { z } from "zod";

import type { ContentStatus } from "@/lib/content-visibility";

export const contentStatusSchema = z.enum(["draft", "scheduled", "published"]);

export const publishingFieldsSchema = z
  .object({
    status: contentStatusSchema,
    publishAt: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.status === "scheduled" && !value.publishAt?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["publishAt"],
        message: "Informe a data de publicação para conteúdo agendado.",
      });
    }
  });

export function normalizePublishAt(
  status: ContentStatus,
  publishAt: string | null | undefined,
) {
  if (status !== "scheduled") {
    return null;
  }

  const raw = publishAt?.trim();

  if (!raw) {
    return null;
  }

  // An unparseable value here used to throw a RangeError inside the server
  // action, which the browser showed as a crash instead of a form error.
  const date = new Date(raw);

  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}
