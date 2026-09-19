import { describe, expect, it, vi } from "vitest";

import {
  checkFormToken,
  clientIpFromHeaders,
  createFormToken,
  MAX_FORM_AGE_MS,
  MIN_FILL_MS,
  verifyTurnstileToken,
} from "./contact-protection";

const SECRET = "test-secret";
const NOW = 1_800_000_000_000;

describe("form token", () => {
  it("is accepted once the form has been open long enough", () => {
    const token = createFormToken(NOW, SECRET);

    expect(checkFormToken(token, NOW + MIN_FILL_MS, SECRET)).toBe("ok");
    expect(checkFormToken(token, NOW + 60_000, SECRET)).toBe("ok");
  });

  it("flags a submission that arrives too fast to be a person", () => {
    const token = createFormToken(NOW, SECRET);

    expect(checkFormToken(token, NOW + 500, SECRET)).toBe("tooFast");
  });

  it("expires after a couple of hours", () => {
    const token = createFormToken(NOW, SECRET);

    expect(checkFormToken(token, NOW + MAX_FORM_AGE_MS + 1, SECRET)).toBe(
      "expired",
    );
  });

  it("rejects a missing, malformed, forged or future token", () => {
    const token = createFormToken(NOW, SECRET);
    const later = NOW + 10_000;

    expect(checkFormToken(null, later, SECRET)).toBe("invalid");
    expect(checkFormToken("", later, SECRET)).toBe("invalid");
    expect(checkFormToken("garbage", later, SECRET)).toBe("invalid");
    expect(checkFormToken(`${NOW}.deadbeef`, later, SECRET)).toBe("invalid");
    // A token signed with another secret.
    expect(checkFormToken(createFormToken(NOW, "other"), later, SECRET)).toBe(
      "invalid",
    );
    // Changing the timestamp invalidates the signature.
    expect(
      checkFormToken(
        `${NOW - 1_000_000}.${token.split(".")[1]}`,
        later,
        SECRET,
      ),
    ).toBe("invalid");
    // Issued "in the future": the clock cannot be trusted.
    expect(checkFormToken(token, NOW - 1, SECRET)).toBe("invalid");
  });
});

describe("clientIpFromHeaders", () => {
  const from = (headers: Record<string, string>) => (name: string) =>
    headers[name] ?? null;

  it("prefers x-real-ip", () => {
    expect(
      clientIpFromHeaders(
        from({ "x-real-ip": "203.0.113.7", "x-forwarded-for": "1.1.1.1" }),
      ),
    ).toBe("203.0.113.7");
  });

  it("uses the last x-forwarded-for entry, never the client-supplied first one", () => {
    expect(
      clientIpFromHeaders(
        from({ "x-forwarded-for": "6.6.6.6, 198.51.100.4, 203.0.113.9" }),
      ),
    ).toBe("203.0.113.9");
  });

  it("supports IPv6 and ignores values that are not IP addresses", () => {
    expect(clientIpFromHeaders(from({ "x-real-ip": "2001:db8::1" }))).toBe(
      "2001:db8::1",
    );
    expect(clientIpFromHeaders(from({ "x-real-ip": "not-an-ip" }))).toBeNull();
    expect(clientIpFromHeaders(from({}))).toBeNull();
  });
});

describe("verifyTurnstileToken", () => {
  const respond = (body: unknown) =>
    vi
      .fn()
      .mockResolvedValue({ json: async () => body }) as unknown as typeof fetch;

  it("accepts a token Cloudflare confirms", async () => {
    const fetchImpl = respond({ success: true });

    await expect(
      verifyTurnstileToken({
        token: "abc",
        secretKey: "s",
        ip: "203.0.113.7",
        fetchImpl,
      }),
    ).resolves.toBe(true);

    const [url, init] = vi.mocked(fetchImpl).mock.calls[0] ?? [];
    expect(String(url)).toContain("challenges.cloudflare.com");
    expect(String((init as RequestInit).body)).toContain(
      "remoteip=203.0.113.7",
    );
  });

  it("refuses a rejected, empty or unverifiable token", async () => {
    await expect(
      verifyTurnstileToken({
        token: "abc",
        secretKey: "s",
        fetchImpl: respond({ success: false }),
      }),
    ).resolves.toBe(false);

    await expect(
      verifyTurnstileToken({
        token: "",
        secretKey: "s",
        fetchImpl: respond({ success: true }),
      }),
    ).resolves.toBe(false);

    await expect(
      verifyTurnstileToken({
        token: "abc",
        secretKey: "s",
        fetchImpl: vi
          .fn()
          .mockRejectedValue(new Error("offline")) as unknown as typeof fetch,
      }),
    ).resolves.toBe(false);
  });
});
