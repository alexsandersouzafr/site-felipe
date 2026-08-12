export type ContentStatus = "draft" | "scheduled" | "published";

type VisibilityInput = {
  status: ContentStatus;
  publishAt: Date | string | null;
};

export function isPubliclyVisible(
  { status, publishAt }: VisibilityInput,
  now = new Date(),
) {
  if (status === "draft") {
    return false;
  }

  if (status === "published") {
    return true;
  }

  return publishAt !== null && new Date(publishAt) <= now;
}
