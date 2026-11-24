export const REPERTOIRE_GENRES = ["classical", "popular"] as const;

export type RepertoireGenre = (typeof REPERTOIRE_GENRES)[number];

/** Admin labels; the public page takes its own from `Repertoire`. */
export const REPERTOIRE_GENRE_LABELS: Record<RepertoireGenre, string> = {
  classical: "Erudito",
  popular: "Popular",
};

export const MAX_REPERTOIRE_TEXT = 200;

export type RepertoireWork = {
  id: string;
  title: string;
  composer: string;
  genre: RepertoireGenre;
};

export type ComposerGroup = {
  composer: string;
  works: { id: string; title: string }[];
};

export function isRepertoireGenre(value: unknown): value is RepertoireGenre {
  return REPERTOIRE_GENRES.includes(value as RepertoireGenre);
}

/** Trims and collapses the spaces people type by accident. */
export function cleanRepertoireText(value: unknown) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

const collator = new Intl.Collator("pt", {
  sensitivity: "base",
  numeric: true,
});

/**
 * Splits the works into the two columns and, inside each, groups them by
 * composer. Names that differ only in case or accents fall in the same group,
 * shown as first typed; composers and works are in alphabetical order.
 */
export function groupRepertoire(works: RepertoireWork[]) {
  const columns = Object.fromEntries(
    REPERTOIRE_GENRES.map((genre) => [genre, [] as ComposerGroup[]]),
  ) as Record<RepertoireGenre, ComposerGroup[]>;

  for (const work of works) {
    const groups = columns[work.genre];
    const group = groups.find(
      (candidate) => collator.compare(candidate.composer, work.composer) === 0,
    );
    const entry = { id: work.id, title: work.title };

    if (group) {
      group.works.push(entry);
    } else {
      groups.push({ composer: work.composer, works: [entry] });
    }
  }

  for (const genre of REPERTOIRE_GENRES) {
    columns[genre].sort((a, b) => collator.compare(a.composer, b.composer));
    for (const group of columns[genre]) {
      group.works.sort((a, b) => collator.compare(a.title, b.title));
    }
  }

  return columns;
}
