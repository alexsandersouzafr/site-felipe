/**
 * The shading laid over full-width photos. Shared with the admin previews, so
 * what the person frames there is what the page shows.
 */

/** Darkens the home photo under the header and behind the name. */
export const HOME_HERO_OVERLAY =
  "bg-[linear-gradient(to_bottom,rgb(0_0_0/0.45),transparent_28%,transparent_45%,rgb(0_0_0/0.62))]";

/**
 * Two layers: the top one darkens the photo under the header, the bottom one
 * fades it into `--background` so the title keeps its contrast in both themes.
 * `strong` carries the fade higher, for long titles that run over several
 * lines.
 */
export const PAGE_HERO_VEIL = {
  default:
    "bg-[linear-gradient(to_bottom,rgb(0_0_0/0.5),transparent_40%),linear-gradient(to_top,var(--background),color-mix(in_oklch,var(--background)_45%,transparent)_30%,transparent_65%)]",
  strong:
    "bg-[linear-gradient(to_bottom,rgb(0_0_0/0.5),transparent_35%),linear-gradient(to_top,var(--background),color-mix(in_oklch,var(--background)_72%,transparent)_42%,color-mix(in_oklch,var(--background)_34%,transparent)_70%,transparent_92%)]",
} as const;
