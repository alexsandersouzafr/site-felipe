import { z } from "zod";

/** A global regex matching any character in the given code point ranges. */
function characters(...ranges: Array<[from: number, to: number]>) {
  const set = ranges
    .map(
      ([from, to]) =>
        `${String.fromCodePoint(from)}-${String.fromCodePoint(to)}`,
    )
    .join("");

  return new RegExp(`[${set}]`, "gu");
}

/**
 * Invisible or direction-changing characters (zero-width spaces, bidi
 * overrides such as U+202E) that let a name or subject look like something
 * else once it is shown in the admin.
 */
const INVISIBLE_CHARACTERS = characters(
  [0x200b, 0x200f],
  [0x202a, 0x202e],
  [0x2066, 0x2069],
  [0xfeff, 0xfeff],
);
const CONTROL_CHARACTERS = characters([0x00, 0x1f], [0x7f, 0x7f]);
/** Everything but tab (0x09) and line feed (0x0a); carriage returns go first. */
const CONTROL_EXCEPT_LINE_BREAKS = characters(
  [0x00, 0x08],
  [0x0b, 0x1f],
  [0x7f, 0x7f],
);

/** For name and subject: a single line, no control or invisible characters. */
export function sanitizeSingleLine(value: string) {
  return value
    .replace(INVISIBLE_CHARACTERS, "")
    .replace(CONTROL_CHARACTERS, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** For the message body: keeps line breaks and tabs, drops everything else. */
export function sanitizeMessage(value: string) {
  return value
    .replace(INVISIBLE_CHARACTERS, "")
    .replace(/\r\n?/g, "\n")
    .replace(CONTROL_EXCEPT_LINE_BREAKS, "")
    .trim();
}

/**
 * The address must be plain `local@domain`. Characters that are legal in an
 * e-mail address but turn a `mailto:` link into something else (`?cc=...`,
 * `&`, `=`, quotes, commas, ...) are refused. Mirrors the database check.
 */
const SAFE_EMAIL = /^[^\s@?&=#%<>",;:]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$/;

export function isSafeEmailAddress(value: string) {
  return value.length <= 254 && SAFE_EMAIL.test(value);
}

const LINK = /(?:https?:\/\/|www\.)\S+/gi;

export function countLinks(text: string) {
  return text.match(LINK)?.length ?? 0;
}

/** Spam is mostly links; a real message rarely carries more than a couple. */
export const MAX_LINKS_IN_MESSAGE = 3;

export const contactMessageSchema = z.object({
  name: z
    .string()
    .transform(sanitizeSingleLine)
    .pipe(z.string().min(1).max(120)),
  email: z.string().trim().max(254).pipe(z.email()).refine(isSafeEmailAddress),
  subject: z
    .string()
    .transform(sanitizeSingleLine)
    .pipe(z.string().min(1).max(200)),
  message: z
    .string()
    .transform(sanitizeMessage)
    .pipe(z.string().min(1).max(5000)),
});

export type ContactMessageInput = z.infer<typeof contactMessageSchema>;

export function parseContactMessage(input: unknown) {
  return contactMessageSchema.safeParse(input);
}
