import { describe, expect, it } from "vitest";

import { classifyAdminError } from "./admin-errors";

describe("classifyAdminError", () => {
  // What the client saw in production: the session had ended, the proxy
  // answered the save with the login page, and the action could not read it.
  it("reads the failed-save message as a connection problem", () => {
    expect(
      classifyAdminError(
        new Error("An unexpected response was received from the server."),
      ),
    ).toBe("connection");
  });

  it.each([
    'Server Action "7f3a" was not found on the server.',
    "Failed to find Server Action. This request might be from an older or newer deployment.",
    "Loading chunk 3794 failed.",
    "Loading CSS chunk 12 failed.",
    "Failed to fetch dynamically imported module: /_next/static/chunks/x.js",
    "Importing a module script failed.",
  ])("reads %j as an outdated tab", (message) => {
    expect(classifyAdminError(new Error(message))).toBe("outdated");
  });

  it("recognises a chunk error by its name", () => {
    const error = new Error("boom");
    error.name = "ChunkLoadError";

    expect(classifyAdminError(error)).toBe("outdated");
  });

  it("leaves anything else as unknown", () => {
    expect(
      classifyAdminError(new Error("Cannot read properties of null")),
    ).toBe("unknown");
    expect(classifyAdminError({})).toBe("unknown");
  });
});
