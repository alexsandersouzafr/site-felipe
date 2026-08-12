export type DatedEvent = {
  startsAt: Date | string;
};

export function partitionEventsByTime<T extends DatedEvent>(
  events: T[],
  now = new Date(),
) {
  const upcoming: T[] = [];
  const past: T[] = [];

  for (const event of events) {
    if (new Date(event.startsAt).getTime() >= now.getTime()) {
      upcoming.push(event);
    } else {
      past.push(event);
    }
  }

  upcoming.sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
  );
  past.sort(
    (a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime(),
  );

  return { upcoming, past };
}
