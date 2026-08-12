import {
  type ContentStatus,
  isPubliclyVisible,
} from "@/lib/content-visibility";

export const MAX_BIO_PAGE_HIGHLIGHTS = 10;

export type BioPageCandidate = {
  showOnPage: boolean;
  status: ContentStatus;
  publishAt: Date | string | null;
};

export type BioPageHighlightCandidate = BioPageCandidate & {
  displayOrder: number;
};

export function selectBiographyForPage<T extends BioPageCandidate>(
  items: T[],
  now = new Date(),
): T | null {
  return (
    items.find(
      (item) =>
        item.showOnPage &&
        isPubliclyVisible(
          { status: item.status, publishAt: item.publishAt },
          now,
        ),
    ) ?? null
  );
}

export function selectHighlightsForPage<T extends BioPageHighlightCandidate>(
  items: T[],
  now = new Date(),
): T[] {
  return items
    .filter(
      (item) =>
        item.showOnPage &&
        isPubliclyVisible(
          { status: item.status, publishAt: item.publishAt },
          now,
        ),
    )
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .slice(0, MAX_BIO_PAGE_HIGHLIGHTS);
}

export function canEnableHighlightOnPage(
  currentlyOnPage: boolean,
  onPageCount: number,
  limit = MAX_BIO_PAGE_HIGHLIGHTS,
) {
  if (currentlyOnPage) {
    return true;
  }

  return onPageCount < limit;
}
