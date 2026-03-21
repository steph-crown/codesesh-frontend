const UNITS: [number, string, string][] = [
  [31_536_000_000, "year", "years"],
  [2_592_000_000, "month", "months"],
  [604_800_000, "week", "weeks"],
  [86_400_000, "day", "days"],
  [3_600_000, "hour", "hours"],
  [60_000, "minute", "minutes"],
];

/**
 * Converts a backend OffsetDateTime tuple [year, day_of_year, hour, min, sec, nanos, ...]
 * into a JS Date.
 */
function parseOffsetDateTimeArray(arr: number[]): Date {
  const [year, dayOfYear, hour, minute, second] = arr;
  const jan1 = new Date(Date.UTC(year, 0, 1));
  jan1.setUTCDate(jan1.getUTCDate() + dayOfYear - 1);
  jan1.setUTCHours(hour, minute, second);
  return jan1;
}

function toTimestamp(date: unknown): number {
  if (Array.isArray(date)) {
    return parseOffsetDateTimeArray(date as number[]).getTime();
  }
  if (typeof date === "string") {
    return new Date(date).getTime();
  }
  if (typeof date === "number") {
    return date;
  }
  if (date instanceof Date) {
    return date.getTime();
  }
  return Date.now();
}

export function timeAgo(date: unknown): string {
  const ms = Date.now() - toTimestamp(date);

  for (const [threshold, singular, plural] of UNITS) {
    if (ms >= threshold) {
      const count = Math.floor(ms / threshold);
      return `Updated ${count} ${count === 1 ? singular : plural} ago`;
    }
  }

  return "Updated just now";
}
