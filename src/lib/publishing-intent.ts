import type { ContentStatus } from "@/lib/content-visibility";
import { normalizePublishAt } from "@/lib/publishing";

export type PublishingIntent = "draft" | "publish" | "schedule";

export function intentFromFormData(formData: FormData): PublishingIntent {
  const intent = String(formData.get("intent") ?? "draft");

  if (intent === "publish" || intent === "schedule" || intent === "draft") {
    return intent;
  }

  return "draft";
}

export function statusFromIntent(intent: PublishingIntent): ContentStatus {
  if (intent === "publish") {
    return "published";
  }

  if (intent === "schedule") {
    return "scheduled";
  }

  return "draft";
}

export function publishingStateFromFormData(formData: FormData) {
  const intent = intentFromFormData(formData);
  const status = statusFromIntent(intent);
  const publishAt = String(formData.get("publishAt") ?? "");

  return {
    intent,
    status,
    publishAt: normalizePublishAt(status, publishAt),
  };
}
