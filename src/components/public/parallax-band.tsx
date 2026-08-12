"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { type ReactNode, useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

type ParallaxBandProps = {
  src: string;
  alt?: string;
  className?: string;
  imageClassName?: string;
  objectPosition?: string;
  priority?: boolean;
  children?: ReactNode;
  overlayClassName?: string;
  /** band = fundo quase fixo entre seções; hero = foto de abertura */
  variant?: "band" | "hero";
};

/**
 * Parallax no estilo Gemma New / Unison: cada bloco continua no fluxo normal,
 * enquanto a imagem se move quase no ritmo inverso do scroll e parece fixa.
 */
export function ParallaxBand({
  src,
  alt = "",
  className,
  imageClassName,
  objectPosition = "50% 28%",
  priority = false,
  children,
  overlayClassName,
  variant = children ? "hero" : "band",
}: ParallaxBandProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  const sizeClass =
    variant === "band"
      ? "h-[min(62vh,36rem)] min-h-[24rem]"
      : "h-[58svh] min-h-[22rem] sm:h-[68svh] md:h-[74svh] lg:h-[min(80vh,48rem)]";

  useEffect(() => {
    const root = rootRef.current;
    const image = imageRef.current;
    if (!root || !image) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const ctx = gsap.context(() => {
      if (variant === "band") {
        gsap.fromTo(
          image,
          {
            y: () => -window.innerHeight * 0.92,
            scale: 1.04,
          },
          {
            y: () => root.offsetHeight * 0.92,
            scale: 1.04,
            ease: "none",
            scrollTrigger: {
              trigger: root,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.35,
              invalidateOnRefresh: true,
            },
          },
        );
      } else {
        gsap.fromTo(
          image,
          { yPercent: -3, scale: 1.04 },
          {
            yPercent: 5,
            scale: 1.04,
            ease: "none",
            scrollTrigger: {
              trigger: root,
              start: "top top",
              end: "bottom top",
              scrub: 0.5,
              invalidateOnRefresh: true,
            },
          },
        );
      }
    }, root);

    const refreshId = window.requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    return () => {
      window.cancelAnimationFrame(refreshId);
      ctx.revert();
    };
  }, [variant]);

  return (
    <div
      ref={rootRef}
      className={cn("relative w-full overflow-hidden", sizeClass, className)}
      aria-hidden={alt || children ? undefined : true}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div
          ref={imageRef}
          className={cn(
            variant === "band"
              ? "absolute inset-x-0 -top-20 h-[calc(100vh+10rem)] will-change-transform"
              : "absolute inset-x-0 -top-[8%] -bottom-[8%] will-change-transform",
            imageClassName,
          )}
        >
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            className="object-cover"
            style={{ objectPosition }}
            sizes="100vw"
          />
        </div>
        {overlayClassName ? (
          <div
            className={cn(
              "pointer-events-none absolute inset-0",
              overlayClassName,
            )}
          />
        ) : null}
      </div>
      {children ? <div className="relative z-10 h-full">{children}</div> : null}
    </div>
  );
}
