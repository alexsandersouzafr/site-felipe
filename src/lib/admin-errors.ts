export type AdminErrorKind = "connection" | "outdated" | "unknown";

/** The tab runs code from a build that is gone: its action ids and chunks. */
const OUTDATED =
  /server action .*not found|failed to find server action|chunkloaderror|loading (css )?chunk|dynamically imported module|importing a module script failed/i;

/** A Server Action got something other than its reply. */
const CONNECTION =
  /unexpected response was received from the server|failed to fetch|network ?error|load failed/i;

/**
 * Sorts the errors that reach the admin's error screen by what the person
 * should do about them. Matching on messages is crude, but these come from
 * the framework and the bundler, not from our code, and their wording is the
 * only signal the browser gets. The outdated check runs first: "Failed to
 * fetch dynamically imported module" would otherwise read as a dropped
 * connection.
 */
export function classifyAdminError(error: {
  name?: string;
  message?: string;
}): AdminErrorKind {
  const text = `${error.name ?? ""} ${error.message ?? ""}`;

  if (OUTDATED.test(text)) {
    return "outdated";
  }

  if (CONNECTION.test(text)) {
    return "connection";
  }

  return "unknown";
}
