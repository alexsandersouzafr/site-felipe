"use client";

import { useState } from "react";

import { PreviewImage, SitePreview } from "@/components/admin/site-preview";
import { FieldDescription } from "@/components/ui/field";
import {
  DEFAULT_IMAGE_FOCUS,
  formatImageFocus,
  IMAGE_FOCUS_PRESETS,
  normalizeImageFocus,
  parseImageFocus,
  presetForFocus,
} from "@/lib/image-focus";
import type { SiteFrame } from "@/lib/site-frames";
import { cn } from "@/lib/utils";

/** A frame with a dot: the part of the photo that stays in view. */
function FocusIcon({ x, y }: { x: number; y: number }) {
  return (
    <svg viewBox="0 0 24 18" aria-hidden="true" className="h-6 w-8">
      <rect
        x="1"
        y="1"
        width="22"
        height="16"
        rx="2.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.55"
      />
      <circle
        cx={1 + (22 * x) / 100}
        cy={1 + (16 * y) / 100}
        r="2.75"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * Chooses which part of a photo survives the crop, with the result shown on
 * the frames the site will put it in. Nine icons cover the usual cases; a tap
 * on the photo itself marks any other point, such as a face off to one side.
 */
export function ImageFramingField({
  id,
  name,
  defaultValue,
  src,
  frames,
}: {
  id: string;
  name: string;
  defaultValue?: string | null;
  /** The photo as it stands: just picked, or already saved. */
  src: string | null;
  frames: readonly SiteFrame[];
}) {
  const [value, setValue] = useState(() =>
    normalizeImageFocus(defaultValue ?? DEFAULT_IMAGE_FOCUS),
  );
  const focus = parseImageFocus(value) ?? { x: 50, y: 50 };
  const preset = presetForFocus(value);

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium">Enquadramento</legend>
      <FieldDescription>
        Escolha a parte da foto que nunca pode ser cortada, como o rosto. O
        ponto mostra o que fica sempre à vista.
      </FieldDescription>
      <input type="hidden" name={name} value={value} />

      <div className="flex flex-wrap items-start gap-4">
        <div
          role="radiogroup"
          aria-label="Parte da foto que fica à vista"
          className="grid w-fit grid-cols-3 gap-1.5"
        >
          {IMAGE_FOCUS_PRESETS.map((option) => {
            const checked = preset === option;

            return (
              <label
                key={option.label}
                title={option.label}
                className={cn(
                  "flex size-12 cursor-pointer items-center justify-center rounded-xl border transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary",
                  checked
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/80 text-muted-foreground hover:border-foreground/40 hover:text-foreground",
                )}
              >
                <input
                  type="radio"
                  name={`${id}-preset`}
                  className="sr-only"
                  checked={checked}
                  aria-label={option.label}
                  onChange={() => setValue(formatImageFocus(option))}
                />
                <FocusIcon x={option.x} y={option.y} />
              </label>
            );
          })}
        </div>

        {src ? (
          <div className="space-y-1.5">
            <button
              type="button"
              aria-label="Marcar na foto o ponto que deve ficar à vista"
              className="relative block min-h-24 min-w-32 cursor-crosshair overflow-hidden rounded-lg border border-border/80 bg-muted outline-none focus-visible:ring-2 focus-visible:ring-primary has-[.image-loading]:animate-skeleton"
              onClick={(event) => {
                // A keyboard press has no position on the photo; the icons
                // cover that case.
                if (event.detail === 0) {
                  return;
                }

                const box = event.currentTarget.getBoundingClientRect();
                setValue(
                  formatImageFocus({
                    x: ((event.clientX - box.left) / box.width) * 100,
                    y: ((event.clientY - box.top) / box.height) * 100,
                  }),
                );
              }}
            >
              <PreviewImage
                src={src}
                alt=""
                className="block max-h-36 w-auto max-w-[14rem]"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-primary shadow-[0_0_0_1px_rgb(0_0_0/0.4)]"
                style={{ left: `${focus.x}%`, top: `${focus.y}%` }}
              />
            </button>
            <p className="max-w-[14rem] text-xs text-muted-foreground">
              Ou toque na foto onde está o mais importante.
            </p>
          </div>
        ) : null}
      </div>

      <p className="text-sm" aria-live="polite">
        {preset ? preset.label : "Ponto marcado na foto"}
      </p>

      <SitePreview src={src} focus={value} frames={frames} />
    </fieldset>
  );
}
