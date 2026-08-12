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

  return publishAt?.trim() ? new Date(publishAt).toISOString() : null;
}
