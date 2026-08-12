import { describe, expect, it } from "vitest";

import { parseContactMessage } from "./contact";

describe("parseContactMessage", () => {
  it("accepts a valid payload", () => {
    const result = parseContactMessage({
      name: "Ana",
      email: "ana@example.com",
      subject: "Convite",
      message: "Gostaríamos de convidar o maestro.",
    });

    expect(result.success).toBe(true);
  });

  it("rejects empty fields", () => {
    const result = parseContactMessage({
      name: " ",
      email: "ana@example.com",
      subject: "Convite",
      message: "Olá",
    });

    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = parseContactMessage({
      name: "Ana",
      email: "not-an-email",
      subject: "Convite",
      message: "Olá",
    });

    expect(result.success).toBe(false);
  });
});
