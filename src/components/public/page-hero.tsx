import { ParallaxBand } from "@/components/public/parallax-band";
import { Reveal } from "@/components/public/reveal";
import { cn } from "@/lib/utils";

type PageHeroProps = {
  title: string;
  imageUrl?: string | null;
  objectPosition?: string;
  /**
   * How much of the photo dissolves into the page behind the title. `strong`
   * carries the fade higher, for long titles that run over several lines.
   */
  veil?: keyof typeof VEIL;
  className?: string;
};

const HERO_HEIGHT =
  "h-[min(56vh,32rem)] min-h-[22rem] sm:h-[min(56vh,32rem)] md:h-[min(56vh,32rem)] lg:h-[min(56vh,32rem)]";

/**
 * Two layers: the top one darkens the photo under the header, the bottom one
 * fades it into `--background` so the title keeps its contrast in both themes.
 */
const VEIL = {
  default:
    "bg-[linear-gradient(to_bottom,rgb(0_0_0/0.5),transparent_40%),linear-gradient(to_top,var(--background),color-mix(in_oklch,var(--background)_45%,transparent)_30%,transparent_65%)]",
  strong:
    "bg-[linear-gradient(to_bottom,rgb(0_0_0/0.5),transparent_35%),linear-gradient(to_top,var(--background),color-mix(in_oklch,var(--background)_72%,transparent)_42%,color-mix(in_oklch,var(--background)_34%,transparent)_70%,transparent_92%)]",
};

export function PageHero({
  title,
  imageUrl,
  objectPosition,
  veil = "default",
  className,
}: PageHeroProps) {
  const content = (
    <div
      className={cn(
        "relative mx-auto flex h-full min-h-[min(42vh,26rem)] w-full max-w-6xl flex-col justify-end px-6 pb-12 pt-28",
        className,
      )}
    >
      <Reveal
        as="h1"
        variant="lines"
        immediate
        delay={0.55}
        className="font-heading text-5xl leading-[1.05] tracking-tight sm:text-6xl md:text-7xl"
      >
        {title}
      </Reveal>
    </div>
  );

  if (!imageUrl) {
    return (
      <section className="relative overflow-hidden bg-[linear-gradient(165deg,_oklch(0.985_0.01_240),_oklch(0.96_0.02_20))] dark:bg-[linear-gradient(165deg,_oklch(0.22_0.02_240),_oklch(0.18_0.02_20))]">
        {content}
      </section>
    );
  }

  return (
    <ParallaxBand
      src={imageUrl}
      objectPosition={objectPosition}
      priority
      variant="hero"
      headerOverlay
      intro
      className={HERO_HEIGHT}
      overlayClassName={VEIL[veil]}
    >
      {content}
    </ParallaxBand>
  );
}
