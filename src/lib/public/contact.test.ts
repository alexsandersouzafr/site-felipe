import { describe, expect, it } from "vitest";

import {
  countLinks,
  isSafeEmailAddress,
  parseContactMessage,
  sanitizeMessage,
  sanitizeSingleLine,
} from "./contact";

// Built from code points so this file never holds invisible characters itself.
const NUL = String.fromCodePoint(0x00);
const BELL = String.fromCodePoint(0x07);
const UNIT_SEPARATOR = String.fromCodePoint(0x1f);
const ZERO_WIDTH_SPACE = String.fromCodePoint(0x200b);
/** Right-to-left override: flips the text after it, hiding a fake extension. */
const RTL_OVERRIDE = String.fromCodePoint(0x202e);

const valid = {
  name: "Ana",
  email: "ana@example.com",
  subject: "Convite",
  message: "Gostaríamos de convidar o maestro.",
};

describe("parseContactMessage", () => {
  it("accepts a valid payload", () => {
    expect(parseContactMessage(valid).success).toBe(true);
  });

  it("rejects empty fields", () => {
    expect(parseContactMessage({ ...valid, name: " " }).success).toBe(false);
  });

  it("rejects invalid email", () => {
    expect(
      parseContactMessage({ ...valid, email: "not-an-email" }).success,
    ).toBe(false);
  });

  it("enforces the size limits", () => {
    expect(
      parseContactMessage({ ...valid, name: "a".repeat(121) }).success,
    ).toBe(false);
    expect(
      parseContactMessage({ ...valid, subject: "a".repeat(201) }).success,
    ).toBe(false);
    expect(
      parseContactMessage({ ...valid, message: "a".repeat(5001) }).success,
    ).toBe(false);
    expect(
      parseContactMessage({ ...valid, message: "a".repeat(5000) }).success,
    ).toBe(true);
  });

  it("cleans name, subject and message before they are stored", () => {
    const result = parseContactMessage({
      name: "  Ana \n\t Souza ",
      email: " ana@example.com ",
      subject: "Convite\r\nBcc: alguem@example.com",
      message: `linha 1\r\nlinha 2${BELL}`,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Ana Souza");
      expect(result.data.email).toBe("ana@example.com");
      expect(result.data.subject).toBe("Convite Bcc: alguem@example.com");
      expect(result.data.message).toBe("linha 1\nlinha 2");
    }
  });

  it("refuses addresses that would alter a mailto: link", () => {
    for (const email of [
      "ana@example.com?cc=outro@example.com",
      "ana&bcc=x@example.com",
      "ana@example.com,outro@example.com",
      '"ana"@example.com',
    ]) {
      expect(parseContactMessage({ ...valid, email }).success).toBe(false);
    }
  });
});

describe("isSafeEmailAddress", () => {
  it("accepts ordinary addresses, including plus tags and subdomains", () => {
    expect(isSafeEmailAddress("ana@example.com")).toBe(true);
    expect(isSafeEmailAddress("ana+festival@mail.example.co.uk")).toBe(true);
  });

  it("refuses characters that change what a mailto: link does", () => {
    expect(isSafeEmailAddress("a?subject=x@b.co")).toBe(false);
    expect(isSafeEmailAddress("a b@c.co")).toBe(false);
    expect(isSafeEmailAddress("a@b")).toBe(false);
  });
});

describe("sanitizeSingleLine", () => {
  it("collapses whitespace and turns control characters into spaces", () => {
    expect(sanitizeSingleLine(`  José \n Ávila${NUL} `)).toBe("José Ávila");
    expect(sanitizeSingleLine(`a${UNIT_SEPARATOR}b`)).toBe("a b");
  });

  it("removes invisible and direction-changing characters", () => {
    expect(sanitizeSingleLine(`Ana${RTL_OVERRIDE}exe.txt`)).toBe("Anaexe.txt");
    expect(sanitizeSingleLine(`a${ZERO_WIDTH_SPACE}b`)).toBe("ab");
  });
});

describe("sanitizeMessage", () => {
  it("keeps line breaks and tabs, drops other control characters", () => {
    expect(sanitizeMessage(`a\r\nb\rc\td${BELL}${UNIT_SEPARATOR}`)).toBe(
      "a\nb\nc\td",
    );
  });

  it("removes invisible characters too", () => {
    expect(sanitizeMessage(`oi${ZERO_WIDTH_SPACE}${RTL_OVERRIDE}`)).toBe("oi");
  });
});

describe("countLinks", () => {
  it("counts http(s) and www links", () => {
    expect(countLinks("sem links aqui")).toBe(0);
    expect(
      countLinks("veja https://a.com e http://b.com/x?y=1 e www.c.com"),
    ).toBe(3);
  });
});
