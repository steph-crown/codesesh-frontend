/**
 * Canonical site URL for SEO (metadataBase, sitemap, JSON-LD, Open Graph).
 * Set `NEXT_PUBLIC_SITE_URL` in production (no trailing slash), e.g. `https://codesesh.com`
 */
export const SITE_NAME = "CodeSesh";

export const SITE_DESCRIPTION =
  "Create live coding sessions in seconds. Real-time collaborative editor, run code together, chat, and share a link—no signup wall for guests. Built for pair programming, interviews, and teaching.";

/** Shorter line for titles and OG when space is tight */
export const SITE_TAGLINE =
  "Real-time collaborative coding sessions—pair program in the browser instantly.";

export const SITE_KEYWORDS = [
  "collaborative coding",
  "pair programming online",
  "live code editor",
  "shared IDE",
  "remote interview coding",
  "code together",
  "realtime programming",
  "browser code session",
  "CodeSesh",
] as const;

const DEFAULT_DEV_ORIGIN = "http://localhost:3000";

function normalizeSiteUrl(raw: string): string {
  const t = raw.trim().replace(/\/+$/, "");
  return t || DEFAULT_DEV_ORIGIN;
}

/** Absolute origin for metadataBase and structured data (no trailing slash). */
export function getSiteOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return normalizeSiteUrl(fromEnv);
  return DEFAULT_DEV_ORIGIN;
}

export function getMetadataBase(): URL {
  return new URL(`${getSiteOrigin()}/`);
}
