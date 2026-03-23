/**
 * OneCompiler Code Execution API
 * @see https://onecompiler.com/apis/code-execution
 */
import { CODE_RUN_SPECS } from "@/lib/code-run-languages";

export type OneCompilerRunResult = {
  stdout: string;
  stderr: string;
  exitCode: number;
};

/** @deprecated use CODE_RUN_SPECS — kept for call sites */
export const ONECOMPILER_LANGUAGES = CODE_RUN_SPECS;

type OneCompilerResponse = {
  stdout?: string | null;
  stderr?: string | null;
  exception?: string | null;
  status?: string;
  error?: string | null;
};

const RUN_URL = "https://api.onecompiler.com/v1/run";

export async function runWithOneCompiler(options: {
  apiKey: string;
  /** Editor language id (typescript, python, …) */
  editorLanguage: string;
  sourceCode: string;
  stdin?: string;
}): Promise<OneCompilerRunResult> {
  const spec = CODE_RUN_SPECS[options.editorLanguage as keyof typeof CODE_RUN_SPECS];
  if (!spec) {
    throw new Error(`Unsupported language for OneCompiler: ${options.editorLanguage}`);
  }

  const body = {
    language: spec.language,
    stdin: options.stdin ?? "",
    files: [
      {
        name: spec.filename,
        content: options.sourceCode,
      },
    ],
  };

  const res = await fetch(RUN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": options.apiKey,
    },
    body: JSON.stringify(body),
  });

  const raw = await res.text();
  let data: OneCompilerResponse;
  try {
    data = JSON.parse(raw) as OneCompilerResponse;
  } catch {
    throw new Error(`OneCompiler returned non-JSON (${res.status}): ${raw.slice(0, 400)}`);
  }

  if (data.status === "failed") {
    throw new Error(data.error ?? "OneCompiler API failed");
  }

  const stdout = data.stdout ?? "";
  const stderrParts = [data.stderr, data.exception].filter(
    (x): x is string => typeof x === "string" && x.length > 0,
  );
  const stderr = stderrParts.join("\n");

  /** API may set `error` (e.g. E001 timeout) even when `status` is `success`. */
  const exitCode =
    (data.error && data.error.length > 0) ||
    (data.exception && data.exception.length > 0)
      ? 1
      : 0;

  return { stdout, stderr, exitCode };
}
