/** What an `<input type="datetime-local">` sends: `2026-09-21T20:30`. */
const LOCAL_DATE_TIME = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::\d{2})?$/;

/**
 * `Intl` throws on an unknown zone, and every date helper here goes through it,
 * so an unchecked value from a form would take down the whole request.
 */
export function isSupportedTimeZone(timeZone: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return true;
  } catch {
    return false;
  }
}

export function isValidLocalDateTime(localDateTime: string) {
  return parseLocalDateTime(localDateTime) !== null;
}

/** The instant the wall-clock fields would name if they were in UTC. */
function parseLocalDateTime(localDateTime: string) {
  const match = LOCAL_DATE_TIME.exec(localDateTime.trim());

  if (!match) {
    return null;
  }

  const [, year, month, day, hour, minute] = match.map(Number);
  const asUtc = new Date(Date.UTC(year, month - 1, day, hour, minute));

  if (Number.isNaN(asUtc.getTime())) {
    return null;
  }

  // Date.UTC rolls February 31st over into March, which would silently save a
  // different day than the one that was typed.
  const rolled =
    asUtc.getUTCFullYear() !== year ||
    asUtc.getUTCMonth() !== month - 1 ||
    asUtc.getUTCDate() !== day ||
    asUtc.getUTCHours() !== hour ||
    asUtc.getUTCMinutes() !== minute;

  return rolled ? null : asUtc;
}

function getTimeZoneOffsetMs(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "shortOffset",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const offset = parts.find((part) => part.type === "timeZoneName")?.value;

  if (!offset || offset === "GMT") {
    return 0;
  }

  const match = offset.match(/GMT([+-])(\d{1,2})(?::?(\d{2}))?/);

  if (!match) {
    return 0;
  }

  const sign = match[1] === "-" ? -1 : 1;
  const hours = Number(match[2]);
  const minutes = Number(match[3] ?? "0");

  return sign * (hours * 60 + minutes) * 60_000;
}

/** `null` when the date or the zone is not something we can convert. */
export function localDateTimeInZoneToUtc(
  localDateTime: string,
  timeZone: string,
) {
  const asUtc = parseLocalDateTime(localDateTime);

  if (!asUtc || !isSupportedTimeZone(timeZone)) {
    return null;
  }

  const offset = getTimeZoneOffsetMs(asUtc, timeZone);

  return new Date(asUtc.getTime() - offset).toISOString();
}

/**
 * Fills the form input when editing. Stored values are trusted less than they
 * look: a row written before a zone was renamed still has to render.
 */
export function utcToLocalDateTimeInput(
  utcDateTime: string | Date,
  timeZone: string,
) {
  const date = new Date(utcDateTime);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: isSupportedTimeZone(timeZone) ? timeZone : "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value;

  return `${value("year")}-${value("month")}-${value("day")}T${value("hour")}:${value("minute")}`;
}
