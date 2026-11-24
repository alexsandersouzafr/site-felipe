import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { PAGE_COVER_KEYS } from "./page-covers";

const MIGRATIONS = path.resolve("supabase/migrations");

/** The keys the database accepts, from the last migration to define them. */
function keysAllowedByTheDatabase() {
  const definitions = readdirSync(MIGRATIONS)
    .sort()
    .map((file) => readFileSync(path.join(MIGRATIONS, file), "utf8"))
    .flatMap((sql) => [
      ...sql.matchAll(
        /constraint page_covers_known_keys check \(\s*page_key in \(([^)]*)\)/gi,
      ),
    ]);
  const latest = definitions.at(-1)?.[1] ?? "";

  return [...latest.matchAll(/'([^']+)'/g)].map((match) => match[1]);
}

describe("page cover keys", () => {
  // The press cover was added to the admin without this, and saving it failed
  // with "violates check constraint page_covers_known_keys".
  it("are all accepted by the database", () => {
    expect(keysAllowedByTheDatabase()).toEqual(
      expect.arrayContaining([...PAGE_COVER_KEYS]),
    );
  });
});
