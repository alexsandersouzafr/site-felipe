"use client";

import { PlayIcon } from "@phosphor-icons/react";
import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";

/**
 * A YouTube video shown as its thumbnail with our own play button. The
 * player (and everything YouTube loads with it) only comes in on click.
 */
export function VideoPlayer({
  youtubeId,
  title,
  playLabel,
  featured = false,
}: {
  youtubeId: string;
  title: string;
  playLabel: string;
  featured?: boolean;
}) {
  const [playing, setPlaying] = useState(false);
  // Not every video has the high-resolution thumbnail; fall back quietly.
  const [thumb, setThumb] = useState(
    `https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`,
  );

  if (playing) {
    return (
      <iframe
        title={title}
        src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
        className="absolute inset-0 size-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={`${playLabel}: ${title}`}
      className="group absolute inset-0 block size-full cursor-pointer"
    >
      <Image
        src={thumb}
        alt=""
        fill
        onError={() =>
          setThumb(`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`)
        }
        className="object-cover transition-[scale] duration-1000 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:scale-[1.04]"
        sizes={
          featured
            ? "(max-width: 1152px) 100vw, 1152px"
            : "(max-width: 768px) 100vw, 50vw"
        }
      />
      <span className="absolute inset-0 bg-black/20 transition-colors duration-700 group-hover:bg-black/35" />
      <span
        className={cn(
          "absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 text-white backdrop-blur-sm transition-[scale,background-color,border-color] duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:scale-110 group-hover:border-primary group-hover:bg-primary",
          featured ? "size-24 sm:size-28" : "size-16",
        )}
      >
        <PlayIcon
          weight="fill"
          className={cn("translate-x-0.5", featured ? "size-7" : "size-5")}
        />
      </span>
    </button>
  );
}
