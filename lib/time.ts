const UNITS: [number, string, string][] = [
  [31_536_000_000, "year", "years"],
  [2_592_000_000, "month", "months"],
  [604_800_000, "week", "weeks"],
  [86_400_000, "day", "days"],
  [3_600_000, "hour", "hours"],
  [60_000, "minute", "minutes"],
];

export function timeAgo(date: number | string | Date): string {
  const timestamp =
    typeof date === "string"
      ? new Date(date).getTime()
      : typeof date === "number"
        ? date
        : date.getTime();

  const ms = Date.now() - timestamp;

  for (const [threshold, singular, plural] of UNITS) {
    if (ms >= threshold) {
      const count = Math.floor(ms / threshold);
      return `Updated ${count} ${count === 1 ? singular : plural} ago`;
    }
  }

  return "Updated just now";
}
