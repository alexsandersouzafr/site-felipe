"use client";

import {
  type ComponentPropsWithoutRef,
  type ElementType,
  type ReactNode,
  useEffect,
  useRef,
} from "react";

import {
  EASE_REVEAL,
  gsap,
  markMotionReady,
  prefersReducedMotion,
  REVEAL_START,
  ScrollTrigger,
  SplitText,
} from "@/lib/motion";

/**
 * - fade: rises into place
 * - lines / chars: text slides up out of a mask, line by line or letter by letter
 * - image: a frame that opens from the bottom while the picture settles
 * - stagger: the element's children come in one after another
 */
export type RevealVariant = "fade" | "lines" | "chars" | "image" | "stagger";

type Trigger = { trigger: Element; start: string; once: true } | undefined;

function bindReveal(el: HTMLElement) {
  const variant = (el.dataset.reveal || "fade") as RevealVariant;
  const delay = Number(el.dataset.revealDelay ?? 0);
  // Above-the-fold intros play on load instead of waiting for a scroll.
  const scrollTrigger: Trigger =
    el.dataset.revealImmediate === "true"
      ? undefined
      : { trigger: el, start: REVEAL_START, once: true };

  if (variant === "lines" || variant === "chars") {
    gsap.set(el, { autoAlpha: 1 });
    SplitText.create(el, {
      type: variant === "chars" ? "lines,words,chars" : "lines",
      linesClass: "rv-line",
      charsClass: "rv-char",
      mask: variant,
      autoSplit: true,
      onSplit: (self) =>
        gsap.from(variant === "chars" ? self.chars : self.lines, {
          yPercent: 115,
          duration: variant === "chars" ? 1.3 : 1.15,
          ease: EASE_REVEAL,
          stagger: variant === "chars" ? 0.028 : 0.09,
          delay,
          scrollTrigger,
        }),
    });
    return;
  }

  if (variant === "image") {
    const media = el.querySelector("img, video, iframe");
    gsap.set(el, { autoAlpha: 1 });
    const tl = gsap.timeline({ delay, scrollTrigger });
    tl.fromTo(
      el,
      { clipPath: "inset(100% 0% 0% 0%)" },
      { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "expo.inOut" },
    );
    if (media) {
      tl.fromTo(
        media,
        { scale: 1.3 },
        { scale: 1, duration: 1.8, ease: EASE_REVEAL },
        0,
      );
    }
    return;
  }

  if (variant === "stagger") {
    const items = Array.from(el.children) as HTMLElement[];
    gsap.set(el, { autoAlpha: 1 });
    gsap.set(items, { autoAlpha: 0, y: 40 });
    ScrollTrigger.batch(items, {
      start: REVEAL_START,
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, {
          autoAlpha: 1,
          y: 0,
          duration: 1.1,
          ease: EASE_REVEAL,
          stagger: 0.08,
          delay,
          overwrite: true,
        }),
    });
    return;
  }

  gsap.fromTo(
    el,
    { autoAlpha: 0, y: 48 },
    {
      autoAlpha: 1,
      y: 0,
      duration: 1.2,
      ease: EASE_REVEAL,
      delay,
      scrollTrigger,
    },
  );
}

type RevealProps<T extends ElementType> = {
  as?: T;
  /** Omit to only animate the `[data-reveal]` elements inside. */
  variant?: RevealVariant;
  delay?: number;
  /** Play on load, for elements that are on screen from the start. */
  immediate?: boolean;
  className?: string;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

/**
 * Animates itself and every descendant marked with `data-reveal`, so server
 * components can opt into motion with an attribute. Until an element is
 * animated, CSS keeps it hidden (see `[data-reveal]` in globals.css); with
 * reduced motion nothing is hidden and nothing moves.
 */
export function Reveal<T extends ElementType = "div">({
  as,
  variant,
  delay,
  immediate,
  className,
  children,
  ...rest
}: RevealProps<T>) {
  const Tag: ElementType = as ?? "div";
  const ref = useRef<HTMLElement>(null);
  const ctxRef = useRef<gsap.Context | null>(null);
  const boundRef = useRef<HTMLElement[]>([]);

  useEffect(() => {
    markMotionReady();
    if (prefersReducedMotion() || !ref.current) {
      return;
    }

    ctxRef.current = gsap.context(() => {}, ref.current);

    return () => {
      ctxRef.current?.revert();
      ctxRef.current = null;
      for (const el of boundRef.current) {
        delete el.dataset.revealBound;
      }
      boundRef.current = [];
    };
  }, []);

  // Runs after every render: content that arrives later (a new page of a
  // list, streamed sections) is picked up too. Already-bound elements, and
  // those owned by a nested Reveal, are skipped.
  useEffect(() => {
    const root = ref.current;
    const ctx = ctxRef.current;
    if (!root || !ctx) {
      return;
    }

    const candidates = [
      root,
      ...root.querySelectorAll<HTMLElement>("[data-reveal]"),
    ].filter(
      (el) => el.dataset.reveal !== undefined && !el.dataset.revealBound,
    );

    if (candidates.length === 0) {
      return;
    }

    ctx.add(() => {
      for (const el of candidates) {
        el.dataset.revealBound = "true";
        boundRef.current.push(el);
        bindReveal(el);
      }
    });
  });

  return (
    <Tag
      ref={ref}
      className={className}
      data-reveal={variant}
      data-reveal-delay={delay}
      data-reveal-immediate={immediate ? "true" : undefined}
      {...rest}
    >
      {children}
    </Tag>
  );
}
