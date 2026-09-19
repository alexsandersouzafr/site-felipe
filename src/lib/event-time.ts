export function getEventLocalDateTime(
  startsAt: Date | string,
  timeZone: string,
) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(startsAt));

  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value;

  return {
    date: `${value("year")}-${value("month")}-${value("day")}`,
    time: `${value("hour")}:${value("minute")}`,
  };
}

/**
 * Splits an event's local date and time into the pieces the site shows at
 * different sizes: day and month (in the locale's own order and wording), the
 * year, and the time of day in the locale's clock format.
 *
 * `date` and `time` are the venue's wall-clock values (see
 * `getEventLocalDateTime`), so they are formatted as UTC to keep the server's
 * own timezone out of it.
 */
export function formatEventDisplay(date: string, time: string, locale: string) {
  const [year = Number.NaN, month = Number.NaN, day = Number.NaN] = date
    .split("-")
    .map(Number);
  const [hour = Number.NaN, minute = Number.NaN] = time.split(":").map(Number);

  if ([year, month, day, hour, minute].some((value) => Number.isNaN(value))) {
    return { dayMonth: date, year: "", time };
  }

  const instant = new Date(Date.UTC(year, month - 1, day, hour, minute));
  const dateParts = new Intl.DateTimeFormat(locale, {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).formatToParts(instant);

  // Everything but the year, without the connectors ("de", ",") left dangling
  // where the year used to be.
  const dayMonthParts = dateParts.filter((part) => part.type !== "year");
  while (dayMonthParts[0]?.type === "literal") {
    dayMonthParts.shift();
  }
  while (dayMonthParts.at(-1)?.type === "literal") {
    dayMonthParts.pop();
  }

  return {
    dayMonth: dayMonthParts.map((part) => part.value).join(""),
    year: dateParts.find((part) => part.type === "year")?.value ?? "",
    time: new Intl.DateTimeFormat(locale, {
      timeZone: "UTC",
      timeStyle: "short",
    }).format(instant),
  };
}
