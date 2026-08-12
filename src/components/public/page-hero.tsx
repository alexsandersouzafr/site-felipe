import Image from "next/image";

import { cn } from "@/lib/utils";

type PageHeroProps = {
  title: string;
  description?: string;
  imageUrl?: string | null;
  objectPosition?: string;
  className?: string;
};

export function PageHero({
  title,
  description,
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
      {description ? (
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          {description}
        </p>
      ) : null}
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
    <section className="relative min-h-[min(42vh,26rem)] overflow-hidden">
      <Image
        src={imageUrl}
        alt=""
        fill
        priority
        className="object-cover"
        style={{ objectPosition }}
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-background/10 to-transparent" />
      <div className="relative z-10 flex min-h-[min(42vh,26rem)]">
        {content}
      </div>
    </section>
  );
}
