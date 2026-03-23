/**
 * Single source of truth: editor languages + OneCompiler `/v1/run` mapping.
 * Every `LANGUAGES[].id` must have an entry here (same keys as OneCompiler API `language` ids).
 *
 * @see https://onecompiler.com/api/v1/languages
 */

export type Language = {
  id: string;
  label: string;
  monacoId: string;
};

/** OneCompiler `language` field + primary filename for the single-file run payload. */
export type CodeRunSpec = {
  language: string;
  filename: string;
};

export const CODE_RUN_SPECS = {
  typescript: { language: "typescript", filename: "main.ts" },
  javascript: { language: "javascript", filename: "main.js" },
  python: { language: "python", filename: "main.py" },
  go: { language: "go", filename: "main.go" },
  rust: { language: "rust", filename: "main.rs" },
  cpp: { language: "cpp", filename: "main.cpp" },
  c: { language: "c", filename: "main.c" },
  csharp: { language: "csharp", filename: "Program.cs" },
  java: { language: "java", filename: "Main.java" },
  kotlin: { language: "kotlin", filename: "main.kt" },
  swift: { language: "swift", filename: "main.swift" },
  ruby: { language: "ruby", filename: "main.rb" },
  php: { language: "php", filename: "main.php" },
  dart: { language: "dart", filename: "main.dart" },
  scala: { language: "scala", filename: "Main.scala" },
  elixir: { language: "elixir", filename: "main.exs" },
  racket: { language: "racket", filename: "main.rkt" },
} as const satisfies Record<string, CodeRunSpec>;

export type CodeRunLanguageId = keyof typeof CODE_RUN_SPECS;

/** UI order (must match `CODE_RUN_SPECS` keys). */
export const LANGUAGES: Language[] = [
  { id: "typescript", label: "TypeScript", monacoId: "typescript" },
  { id: "javascript", label: "JavaScript", monacoId: "javascript" },
  { id: "python", label: "Python", monacoId: "python" },
  { id: "go", label: "Go", monacoId: "go" },
  { id: "rust", label: "Rust", monacoId: "rust" },
  { id: "cpp", label: "C++", monacoId: "cpp" },
  { id: "c", label: "C", monacoId: "c" },
  { id: "csharp", label: "C#", monacoId: "csharp" },
  { id: "java", label: "Java", monacoId: "java" },
  { id: "kotlin", label: "Kotlin", monacoId: "kotlin" },
  { id: "swift", label: "Swift", monacoId: "swift" },
  { id: "ruby", label: "Ruby", monacoId: "ruby" },
  { id: "php", label: "PHP", monacoId: "php" },
  { id: "dart", label: "Dart", monacoId: "dart" },
  { id: "scala", label: "Scala", monacoId: "scala" },
  { id: "elixir", label: "Elixir", monacoId: "elixir" },
  { id: "racket", label: "Racket", monacoId: "scheme" },
];

/** Dev-only guard: every selector language has a run spec. */
function assertSpecsCoverLanguages(): void {
  for (const l of LANGUAGES) {
    if (!(l.id in CODE_RUN_SPECS)) {
      throw new Error(
        `code-run-languages: missing CODE_RUN_SPECS for selector id "${l.id}"`,
      );
    }
  }
  const specKeys = new Set(Object.keys(CODE_RUN_SPECS));
  for (const l of LANGUAGES) specKeys.delete(l.id);
  if (specKeys.size > 0) {
    throw new Error(
      `code-run-languages: CODE_RUN_SPECS has extra keys not in LANGUAGES: ${[...specKeys].join(", ")}`,
    );
  }
}

if (process.env.NODE_ENV === "development") {
  assertSpecsCoverLanguages();
}
