/**
 * Human-readable "time ago" for a past instant (English).
 */
export function formatTimeAgo(from: Date): string {
  const sec = Math.floor((Date.now() - from.getTime()) / 1000);
  if (sec < 10) return "just now";
  if (sec < 60) return `${sec} seconds ago`;

  const min = Math.floor(sec / 60);
  if (min < 60) return min === 1 ? "1 minute ago" : `${min} minutes ago`;

  const hr = Math.floor(min / 60);
  if (hr < 24) return hr === 1 ? "1 hour ago" : `${hr} hours ago`;

  const day = Math.floor(hr / 24);
  if (day < 7) return day === 1 ? "1 day ago" : `${day} days ago`;

  const week = Math.floor(day / 7);
  if (week < 5) return week === 1 ? "1 week ago" : `${week} weeks ago`;

  const month = Math.floor(day / 30);
  if (month < 12) return month === 1 ? "1 month ago" : `${month} months ago`;

  const year = Math.floor(day / 365);
  return year === 1 ? "1 year ago" : `${year} years ago`;
}

/** Parse API `joined_at` (ISO string or legacy array shape). */
export function parseParticipantDate(value: unknown): Date {
  if (Array.isArray(value)) {
    const [year, dayOfYear, hour, minute, second] = value as number[];
    const d = new Date(Date.UTC(year, 0, 1));
    d.setUTCDate(d.getUTCDate() + dayOfYear - 1);
    d.setUTCHours(hour, minute, second);
    return d;
  }
  return new Date(value as string);
}
