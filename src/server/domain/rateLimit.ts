export interface RateWindow {
  count: number;
  windowEnd: Date;
}

export interface RateDecision extends RateWindow {
  allowed: boolean;
}

/** Fixed window: a request past `limit` is refused until the window ends. */
export function decideRateLimit(
  current: RateWindow | null,
  now: Date,
  limit: number,
  windowMs: number,
): RateDecision {
  if (!current || current.windowEnd <= now) {
    return { allowed: true, count: 1, windowEnd: new Date(now.getTime() + windowMs) };
  }
  if (current.count >= limit) {
    return { allowed: false, count: current.count, windowEnd: current.windowEnd };
  }
  return { allowed: true, count: current.count + 1, windowEnd: current.windowEnd };
}
