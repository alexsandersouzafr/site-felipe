import { DEFAULT_IMAGE_FOCUS } from "@/lib/image-focus";

/**
 * How a photo is cut on the public site, measured on two reference screens, so
 * the admin can show it the same way before it is saved. The numbers follow the
 * classes in `parallax-band.tsx`, `page-hero.tsx` and the cards; when those
 * change, these have to change with them.
 */
export type SiteFrame = {
  label: string;
  /** Sizes the preview: a full screen, a phone, or a card in a list. */
  device: "desktop" | "phone" | "card";
  /** The visible frame, in CSS pixels. */
  width: number;
  height: number;
  /**
   * The photo's box when it is taller than the frame (the parallax photos),
   * in frame pixels from the frame's top edge.
   */
  image?: { top: number; height: number; scale: number };
  overlay?: "homeHero" | "pageCover" | "pageCoverStrong";
  /** `contain` shows the whole photo on a mat, as the gallery does. */
  fit?: "cover" | "contain";
  /** Set when the site ignores the chosen framing for this frame. */
  focus?: string;
};

const DESKTOP = { width: 1440, height: 900 };
const PHONE = { width: 390, height: 844 };
const REM = 16;

/**
 * `variant="hero"`: the photo overflows the frame by 8% at each end, and at the
 * top of the page the scroll animation holds it 3% of its height higher.
 */
function heroImage(height: number) {
  const box = 1.16 * height;

  return { top: -0.08 * height - 0.03 * box, height: box, scale: 1.04 };
}

/** The home opening photo fills the screen (`h-svh min-h-[34rem]`). */
export function homeHeroFrames(): SiteFrame[] {
  return [DESKTOP, PHONE].map((screen) => {
    const height = Math.max(screen.height, 34 * REM);

    return {
      label: screen === DESKTOP ? "Computador" : "Celular",
      device: screen === DESKTOP ? "desktop" : "phone",
      width: screen.width,
      height,
      image: heroImage(height),
      overlay: "homeHero",
    };
  });
}

/**
 * A photo between home sections (`variant="band"`): the band is
 * `min(62vh, 36rem)` tall, at least 24rem, and opens onto a photo the size of
 * the screen plus 10rem, which scrolls behind it almost like a fixed
 * background. Shown as it sits with the band in the middle of the screen.
 */
export function homeBandFrames(): SiteFrame[] {
  return [DESKTOP, PHONE].map((screen) => {
    const height = Math.max(Math.min(0.62 * screen.height, 36 * REM), 24 * REM);
    // The scroll animation runs y from -0.92·vh to 0.92·band; halfway there
    // the band is centred on the screen.
    const travel = 0.46 * (height - screen.height);

    return {
      label: screen === DESKTOP ? "Computador" : "Celular",
      device: screen === DESKTOP ? "desktop" : "phone",
      width: screen.width,
      height,
      image: {
        top: -5 * REM + travel,
        height: screen.height + 10 * REM,
        scale: 1.04,
      },
    };
  });
}

/** The cover at the top of an inner page (`PageHero`). */
export function pageCoverFrames(
  veil: "default" | "strong" = "default",
): SiteFrame[] {
  return [DESKTOP, PHONE].map((screen) => {
    const height = Math.max(Math.min(0.56 * screen.height, 32 * REM), 22 * REM);

    return {
      label: screen === DESKTOP ? "Computador" : "Celular",
      device: screen === DESKTOP ? "desktop" : "phone",
      width: screen.width,
      height,
      image: heroImage(height),
      overlay: veil === "strong" ? "pageCoverStrong" : "pageCover",
    };
  });
}

/** A card that crops its photo around the centre. */
export function cardFrame(label: string, width: number, height: number) {
  return { label, device: "card", width, height, focus: "50% 50%" } as const;
}

/** Agenda rows: 16:10 on phones, 4:3 from tablets up. */
export const EVENT_FRAMES: SiteFrame[] = [
  cardFrame("Agenda no celular", 16, 10),
  cardFrame("Agenda no computador", 4, 3),
];

/** The gallery shows each photo whole, on a square mat. */
export const GALLERY_FRAMES: SiteFrame[] = [
  { ...cardFrame("Galeria", 1, 1), fit: "contain" },
];

export const PRESS_FRAMES = {
  conductor: [cardFrame("Imprensa", 3, 4)],
  stage: [cardFrame("Imprensa", 4, 3)],
} satisfies Record<string, SiteFrame[]>;

export const BLOG_IMAGE_FRAMES: SiteFrame[] = [
  cardFrame("No meio do post", 16, 10),
];

/**
 * A post's cover opens the post (where the site keeps the default framing) and
 * illustrates its card in the lists.
 */
export function blogCoverFrames(): SiteFrame[] {
  return [
    ...pageCoverFrames("strong").map((frame) => ({
      ...frame,
      label: `Topo do post (${frame.label.toLowerCase()})`,
      focus: DEFAULT_IMAGE_FOCUS,
    })),
    cardFrame("Post em destaque", 16, 11),
    cardFrame("Lista de posts", 4, 3),
  ];
}
