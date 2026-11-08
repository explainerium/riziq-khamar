/** Bangladesh is UTC+6 all year, so the shop's days are a fixed offset from UTC. */
const OFFSET_MS = 6 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** The instant the shop's day containing `date` began. */
export function dhakaDayStart(date: Date): Date {
  const local = new Date(date.getTime() + OFFSET_MS);
  return new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()) - OFFSET_MS);
}

export function dhakaMonthStart(date: Date): Date {
  const local = new Date(date.getTime() + OFFSET_MS);
  return new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), 1) - OFFSET_MS);
}

/** Start of each of the last `count` days, oldest first, ending with today. */
export function lastDayStarts(now: Date, count: number): Date[] {
  const today = dhakaDayStart(now).getTime();
  return Array.from({ length: count }, (_, i) => new Date(today - (count - 1 - i) * DAY_MS));
}
