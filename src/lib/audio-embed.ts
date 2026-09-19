export const AUDIO_PROVIDERS = [
  "spotify",
  "youtube-music",
  "soundcloud",
] as const;
export type AudioProvider = (typeof AUDIO_PROVIDERS)[number];

export const AUDIO_PROVIDER_LABELS: Record<AudioProvider, string> = {
  spotify: "Spotify",
  "youtube-music": "YouTube Music",
  soundcloud: "SoundCloud",
};

const audioUrlPatterns: Record<AudioProvider, RegExp> = {
  spotify:
    /^https?:\/\/open\.spotify\.com\/(intl-[a-z-]+\/)?(track|album|playlist|episode|show)\/\w+/i,
  "youtube-music": /^https?:\/\/music\.youtube\.com\/watch\?v=[\w-]+/i,
  soundcloud: /^https?:\/\/(www\.)?soundcloud\.com\/[\w-]+\/[\w-]+/i,
};

export function isAudioEmbedUrl(provider: AudioProvider, value: string) {
  return audioUrlPatterns[provider].test(value.trim());
}

/** open.spotify.com/track/ID (optionally locale-prefixed) -> open.spotify.com/embed/track/ID */
export function spotifyEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split("/").filter(Boolean);
    const typeIndex = parts.findIndex((part) =>
      ["track", "album", "playlist", "episode", "show"].includes(part),
    );
    const type = typeIndex === -1 ? null : parts[typeIndex];
    const id = typeIndex === -1 ? null : parts[typeIndex + 1];

    if (!type || !id) {
      return null;
    }

    return `https://open.spotify.com/embed/${type}/${id}`;
  } catch {
    return null;
  }
}

export function soundcloudEmbedUrl(url: string) {
  return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23000000&auto_play=false&show_comments=false&visual=false`;
}
