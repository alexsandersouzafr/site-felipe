import { ParallaxBand } from "@/components/public/parallax-band";
import { cn } from "@/lib/utils";

type PageHeroProps = {
  title: string;
  imageUrl?: string | null;
  objectPosition?: string;
  className?: string;
};

const HERO_HEIGHT =
  "h-[min(42vh,26rem)] min-h-[min(42vh,26rem)] sm:h-[min(42vh,26rem)] md:h-[min(42vh,26rem)] lg:h-[min(42vh,26rem)]";

export function PageHero({
  title,
  imageUrl,
  objectPosition,
  className,
}: PageHeroProps) {
  const content = (
    <div
      className={cn(
        "relative mx-auto flex min-h-[min(42vh,26rem)] w-full max-w-6xl flex-col justify-end px-6 pb-12 pt-24",
        className,
      )}
    >
      <h1 className="font-heading animate-in fade-in slide-in-from-bottom-2 text-4xl tracking-tight duration-700 sm:text-5xl md:text-6xl">
        {title}
      </h1>
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
      className={HERO_HEIGHT}
      overlayClassName="bg-gradient-to-t from-background/50 via-background/10 to-transparent"
    >
      {content}
    </ParallaxBand>
  );
}
