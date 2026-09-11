import { describe, expect, it } from "vitest";

import {
  isAudioEmbedUrl,
  soundcloudEmbedUrl,
  spotifyEmbedUrl,
} from "./audio-embed";

describe("isAudioEmbedUrl", () => {
  it("accepts a matching Spotify track URL", () => {
    expect(
      isAudioEmbedUrl("spotify", "https://open.spotify.com/track/abc123"),
    ).toBe(true);
  });

  it("accepts a locale-prefixed Spotify URL", () => {
    expect(
      isAudioEmbedUrl(
        "spotify",
        "https://open.spotify.com/intl-pt/track/abc123",
      ),
    ).toBe(true);
  });

  it("accepts a SoundCloud track URL", () => {
    expect(
      isAudioEmbedUrl("soundcloud", "https://soundcloud.com/artista/faixa"),
    ).toBe(true);
  });

  it("accepts a YouTube Music URL", () => {
    expect(
      isAudioEmbedUrl(
        "youtube-music",
        "https://music.youtube.com/watch?v=abc123",
      ),
    ).toBe(true);
  });

  it("rejects a URL from the wrong provider", () => {
    expect(
      isAudioEmbedUrl("spotify", "https://soundcloud.com/artista/faixa"),
    ).toBe(false);
  });
});

describe("spotifyEmbedUrl", () => {
  it("converts a track URL to its embed form", () => {
    expect(spotifyEmbedUrl("https://open.spotify.com/track/abc123")).toBe(
      "https://open.spotify.com/embed/track/abc123",
    );
  });

  it("strips a locale prefix", () => {
    expect(
      spotifyEmbedUrl("https://open.spotify.com/intl-pt/album/xyz789"),
    ).toBe("https://open.spotify.com/embed/album/xyz789");
  });

  it("returns null for an unrecognized path", () => {
    expect(spotifyEmbedUrl("https://open.spotify.com/")).toBeNull();
  });
});

describe("soundcloudEmbedUrl", () => {
  it("wraps the track URL in the SoundCloud player URL", () => {
    const embed = soundcloudEmbedUrl("https://soundcloud.com/artista/faixa");
    expect(embed).toContain("https://w.soundcloud.com/player/?url=");
    expect(embed).toContain(
      encodeURIComponent("https://soundcloud.com/artista/faixa"),
    );
  });
});
