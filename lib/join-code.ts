const CODE_PATTERN = /^[a-z]{3}-[a-z]{3}-[a-z]{3}$/;

/**
 * Extracts the session code from either a raw code (abc-def-ghj)
 * or a full link (https://example.com/sessions/abc-def-ghj).
 * Returns the code if valid, or null if the input is invalid.
 */
export function extractSessionCode(input: string): string | null {
  const trimmed = input.trim().toLowerCase();

  if (CODE_PATTERN.test(trimmed)) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);
    const segments = url.pathname.split("/").filter(Boolean);
    const sessionsIdx = segments.indexOf("sessions");
    if (sessionsIdx >= 0 && sessionsIdx + 1 < segments.length) {
      const code = segments[sessionsIdx + 1];
      if (CODE_PATTERN.test(code)) return code;
    }
  } catch {
    // not a URL
  }

  const pathMatch = trimmed.match(/\/sessions\/([a-z]{3}-[a-z]{3}-[a-z]{3})/);
  if (pathMatch) return pathMatch[1];

  return null;
}
