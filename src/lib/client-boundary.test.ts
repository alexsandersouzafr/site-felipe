import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const SRC = path.resolve("src");

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      return sourceFiles(full);
    }

    return /\.tsx?$/.test(entry.name) && !entry.name.includes(".test.")
      ? [full]
      : [];
  });
}

const sources = new Map(
  sourceFiles(SRC).map((file) => [file, readFileSync(file, "utf8")]),
);

function isClientModule(source: string) {
  return /^["']use client["']/m.test(source);
}

/** Components start with a capital and may cross; anything else cannot. */
function valueExports(source: string) {
  const declared = [
    ...source.matchAll(
      /export\s+(?:async\s+)?(?:function|const)\s+([a-z]\w*)/g,
    ),
  ].map((match) => match[1]);
  const listed = [...source.matchAll(/export\s*\{([^}]*)\}/g)].flatMap(
    (match) => match[1].split(",").map((name) => name.trim()),
  );

  return new Set([...declared, ...listed.filter((n) => /^[a-z]/.test(n))]);
}

function resolveImport(from: string, specifier: string) {
  const base = specifier.startsWith("@/")
    ? path.join(SRC, specifier.slice(2))
    : specifier.startsWith(".")
      ? path.resolve(path.dirname(from), specifier)
      : null;

  return base && [`${base}.ts`, `${base}.tsx`].find((f) => sources.has(f));
}

const clientValues = new Map(
  [...sources]
    .filter(([, source]) => isClientModule(source))
    .map(([file, source]) => [file, valueExports(source)]),
);

// tsc and `next build` both accept this mistake. It only fails when the route
// renders, with "Attempted to call x() from the server", on the error screen.
// The message page did that once: every message failed to open in production.
describe("the server/client boundary", () => {
  it("finds what it is looking for", () => {
    const button = path.join(SRC, "components/ui/button.tsx");

    expect(clientValues.get(button)).toContain("buttonVariants");
  });

  it("has no server module importing a function from a client module", () => {
    const crossings = [...sources]
      .filter(([, source]) => !isClientModule(source))
      .flatMap(([file, source]) =>
        [
          ...source.matchAll(
            /import\s+(?!type\b)[^;]*?\{([^}]*)\}\s+from\s+["']([^"']+)["']/g,
          ),
        ].flatMap((match) => {
          const target = resolveImport(file, match[2]);
          const values = target ? clientValues.get(target) : undefined;

          return match[1]
            .split(",")
            .map((name) => name.trim().split(/\s+as\s+/)[0])
            .filter((name) => values?.has(name))
            .map((name) => `${path.relative(SRC, file)} imports ${name}`);
        }),
      );

    expect(crossings).toEqual([]);
  });
});
