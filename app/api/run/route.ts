import { NextResponse } from "next/server";
import { CODE_RUN_SPECS } from "@/lib/code-run-languages";
import { runWithOneCompiler } from "@/lib/onecompiler-run";

function getOneCompilerKey(): string | null {
  const k = process.env.ONECOMPILER_API_KEY?.trim();
  return k || null;
}

export async function POST(request: Request) {
  try {
    const { code, language } = await request.json();

    if (!code || !language) {
      return NextResponse.json(
        { error: "Missing code or language" },
        { status: 400 },
      );
    }

    if (!(language in CODE_RUN_SPECS)) {
      return NextResponse.json(
        { error: `Unsupported language: ${language}` },
        { status: 400 },
      );
    }

    const apiKey = getOneCompilerKey();
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Code execution is not configured. Set ONECOMPILER_API_KEY in .env (get a key from the OneCompiler API Console).",
        },
        { status: 503 },
      );
    }

    const result = await runWithOneCompiler({
      apiKey,
      editorLanguage: language,
      sourceCode: String(code),
    });

    return NextResponse.json({
      stdout: result.stdout,
      stderr: result.stderr,
      exitCode: result.exitCode,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown error";
    const isUnreachable =
      message.includes("fetch failed") ||
      message.includes("ECONNREFUSED") ||
      message.includes("ENOTFOUND");
    return NextResponse.json(
      {
        error: isUnreachable
          ? "Cannot reach OneCompiler API. Check your network and ONECOMPILER_API_KEY."
          : message,
      },
      { status: 500 },
    );
  }
}
