import type { TextChangeDelta } from "@/lib/ws-messages";

/** Apply Monaco-style 1-based range edit (UTF-16-ish: JS string indices). */
export function applyTextDelta(content: string, delta: TextChangeDelta): string {
  const start = offsetForPosition(
    content,
    delta.range.start_line,
    delta.range.start_column,
  );
  const end = offsetForPosition(
    content,
    delta.range.end_line,
    delta.range.end_column,
  );
  if (start === null || end === null || start > end || end > content.length) {
    return content;
  }
  return content.slice(0, start) + delta.text + content.slice(end);
}

function lineStartByte(s: string, line: number): number | null {
  if (line < 1) return null;
  if (line === 1) return 0;
  let current = 1;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "\n") {
      current += 1;
      if (current === line) return i + 1;
    }
  }
  return null;
}

function offsetForPosition(
  s: string,
  line: number,
  col: number,
): number | null {
  if (col < 1) return null;
  const lineStart = lineStartByte(s, line);
  if (lineStart === null) return null;
  const rest = s.slice(lineStart);
  if (col === 1) return lineStart;
  let colIdx = 1;
  for (let i = 0; i < rest.length; ) {
    const ch = rest[i];
    if (ch === "\n") break;
    const cp = rest.codePointAt(i)!;
    const w = cp > 0xffff ? 2 : 1;
    colIdx += 1;
    if (colIdx === col) return lineStart + i + w;
    i += w;
  }
  if (colIdx === col) return lineStart + rest.split("\n")[0]!.length;
  return null;
}
