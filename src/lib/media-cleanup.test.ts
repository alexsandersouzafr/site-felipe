import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

import { deleteUnusedMedia } from "./media-cleanup";

type TableResult = { data: unknown[] | null; error: unknown };

/**
 * Enough of the client for this helper: the two reference lookups and the
 * storage removal, with the removed paths recorded.
 */
function fakeClient(results: Record<string, TableResult>) {
  const removed: string[][] = [];

  const client = {
    from(table: string) {
      const result = results[table] ?? { data: [], error: null };
      const builder = {
        select: () => builder,
        eq: () => builder,
        filter: () => builder,
        limit: () => Promise.resolve(result),
      };
      return builder;
    },
    storage: {
      from: () => ({
        remove: (paths: string[]) => {
          removed.push(paths);
          return Promise.resolve({ data: null, error: null });
        },
      }),
    },
  } as unknown as SupabaseClient;

  return { client, removed };
}

const FREE = {};

describe("deleteUnusedMedia", () => {
  it("removes a cover nothing points at any more", async () => {
    const { client, removed } = fakeClient(FREE);

    await deleteUnusedMedia(client, "covers/abc.jpg");

    expect(removed).toEqual([["covers/abc.jpg"]]);
  });

  it("keeps a file another row still uses", async () => {
    const { client, removed } = fakeClient({
      ...FREE,
      home_photos: { data: [{ slot: "hero" }], error: null },
    });

    await deleteUnusedMedia(client, "home/parallax/abc.jpg");

    expect(removed).toEqual([]);
  });

  // A gallery photo can be a blog cover at the same time: the photo screen
  // deleting it would empty a frame in a published post.
  it("keeps a gallery photo a blog post still uses", async () => {
    const { client, removed } = fakeClient({
      ...FREE,
      news_items: { data: [{ id: "post-1" }], error: null },
    });

    await deleteUnusedMedia(client, "photos/abc.jpg");

    expect(removed).toEqual([]);
  });

  it("does nothing without a path", async () => {
    const { client, removed } = fakeClient(FREE);

    await deleteUnusedMedia(client, null);
    await deleteUnusedMedia(client, "");

    expect(removed).toEqual([]);
  });

  it("does not delete when a lookup failed", async () => {
    const { client, removed } = fakeClient({
      ...FREE,
      page_covers: { data: null, error: { message: "timeout" } },
    });

    await deleteUnusedMedia(client, "covers/abc.jpg");

    expect(removed).toEqual([]);
  });
});
