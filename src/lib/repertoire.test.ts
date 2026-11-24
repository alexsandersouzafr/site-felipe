import { describe, expect, it } from "vitest";

import {
  cleanRepertoireText,
  groupRepertoire,
  type RepertoireWork,
} from "./repertoire";

function work(
  id: string,
  title: string,
  composer: string,
  genre: RepertoireWork["genre"] = "classical",
): RepertoireWork {
  return { id, title, composer, genre };
}

describe("groupRepertoire", () => {
  it("splits the works into the two columns", () => {
    const columns = groupRepertoire([
      work("1", "Sinfonia nº 5", "Beethoven"),
      work("2", "Garota de Ipanema", "Tom Jobim", "popular"),
    ]);

    expect(columns.classical.map((group) => group.composer)).toEqual([
      "Beethoven",
    ]);
    expect(columns.popular.map((group) => group.composer)).toEqual([
      "Tom Jobim",
    ]);
  });

  it("groups by composer, both in alphabetical order", () => {
    const { classical } = groupRepertoire([
      work("1", "Sinfonia nº 9", "Mahler"),
      work("2", "Sinfonia nº 1", "Mahler"),
      work("3", "Bachianas Brasileiras nº 5", "Villa-Lobos"),
      work("4", "Sinfonia nº 10", "Mahler"),
      work("5", "Abertura Egmont", "Beethoven"),
    ]);

    expect(classical).toEqual([
      { composer: "Beethoven", works: [{ id: "5", title: "Abertura Egmont" }] },
      {
        composer: "Mahler",
        works: [
          { id: "2", title: "Sinfonia nº 1" },
          { id: "1", title: "Sinfonia nº 9" },
          { id: "4", title: "Sinfonia nº 10" },
        ],
      },
      {
        composer: "Villa-Lobos",
        works: [{ id: "3", title: "Bachianas Brasileiras nº 5" }],
      },
    ]);
  });

  it("treats a composer typed with other accents or case as the same", () => {
    const { classical } = groupRepertoire([
      work("1", "Concerto para piano", "Dvořák"),
      work("2", "Sinfonia do Novo Mundo", "dvorák"),
    ]);

    expect(classical).toHaveLength(1);
    expect(classical[0].composer).toBe("Dvořák");
    expect(classical[0].works).toHaveLength(2);
  });

  it("keeps the same composer apart in each column", () => {
    const columns = groupRepertoire([
      work("1", "Choros nº 10", "Villa-Lobos"),
      work("2", "Trenzinho do caipira", "Villa-Lobos", "popular"),
    ]);

    expect(columns.classical[0].works).toHaveLength(1);
    expect(columns.popular[0].works).toHaveLength(1);
  });
});

describe("cleanRepertoireText", () => {
  it("drops stray spaces", () => {
    expect(cleanRepertoireText("  Heitor   Villa-Lobos ")).toBe(
      "Heitor Villa-Lobos",
    );
    expect(cleanRepertoireText(null)).toBe("");
  });
});
