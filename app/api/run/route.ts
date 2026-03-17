import { NextResponse } from "next/server";
import { execFile } from "node:child_process";
import { writeFile, unlink, mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const TIMEOUT_MS = 15_000;

type LangConfig = {
  ext: string;
  run: (file: string) => { cmd: string; args: string[] };
  compile?: (file: string, out: string) => { cmd: string; args: string[] };
  filename?: string;
};

const LANGUAGES: Record<string, LangConfig> = {
  javascript: {
    ext: ".js",
    run: (f) => ({ cmd: "node", args: [f] }),
  },
  typescript: {
    ext: ".ts",
    run: (f) => ({ cmd: "node", args: ["--experimental-strip-types", f] }),
  },
  python: {
    ext: ".py",
    run: (f) => ({ cmd: "python3", args: [f] }),
  },
  go: {
    ext: ".go",
    run: (f) => ({ cmd: "go", args: ["run", f] }),
  },
  rust: {
    ext: ".rs",
    compile: (f, out) => ({ cmd: "rustc", args: [f, "-o", out] }),
    run: (f) => ({ cmd: f, args: [] }),
  },
  cpp: {
    ext: ".cpp",
    compile: (f, out) => ({ cmd: "g++", args: ["-std=c++20", "-o", out, f] }),
    run: (f) => ({ cmd: f, args: [] }),
  },
  c: {
    ext: ".c",
    compile: (f, out) => ({ cmd: "gcc", args: ["-std=c17", "-o", out, f] }),
    run: (f) => ({ cmd: f, args: [] }),
  },
  csharp: {
    ext: ".cs",
    run: (f) => ({ cmd: "dotnet-script", args: [f] }),
  },
  java: {
    ext: ".java",
    filename: "Main.java",
    run: (f) => ({ cmd: "java", args: [f] }),
  },
  kotlin: {
    ext: ".kt",
    compile: (f, out) => ({ cmd: "kotlinc", args: [f, "-include-runtime", "-d", `${out}.jar`] }),
    run: (f) => ({ cmd: "java", args: ["-jar", `${f}.jar`] }),
  },
  swift: {
    ext: ".swift",
    run: (f) => ({ cmd: "swift", args: [f] }),
  },
  ruby: {
    ext: ".rb",
    run: (f) => ({ cmd: "ruby", args: [f] }),
  },
  php: {
    ext: ".php",
    run: (f) => ({ cmd: "php", args: [f] }),
  },
  dart: {
    ext: ".dart",
    run: (f) => ({ cmd: "dart", args: ["run", f] }),
  },
  scala: {
    ext: ".scala",
    run: (f) => ({ cmd: "scala", args: [f] }),
  },
  elixir: {
    ext: ".exs",
    run: (f) => ({ cmd: "elixir", args: [f] }),
  },
  erlang: {
    ext: ".erl",
    run: (f) => ({ cmd: "escript", args: [f] }),
  },
  racket: {
    ext: ".rkt",
    run: (f) => ({ cmd: "racket", args: [f] }),
  },
};

function exec(
  cmd: string,
  args: string[],
  timeout: number,
): Promise<{ stdout: string; stderr: string; code: number }> {
  return new Promise((resolve) => {
    execFile(cmd, args, { timeout, maxBuffer: 1024 * 1024 }, (err, stdout, stderr) => {
      const code = err
        ? (err as NodeJS.ErrnoException & { code?: string | number }).code ===
          "ERR_CHILD_PROCESS_STDIO_MAXBUFFER"
          ? 1
          : (err as { status?: number }).status ?? 1
        : 0;
      resolve({ stdout: stdout ?? "", stderr: stderr ?? "", code: Number(code) });
    });
  });
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

    const config = LANGUAGES[language];
    if (!config) {
      return NextResponse.json(
        { error: `Unsupported language: ${language}` },
        { status: 400 },
      );
    }

    const dir = await mkdtemp(join(tmpdir(), "codesesh-"));
    const filename = config.filename ?? `main${config.ext}`;
    const srcFile = join(dir, filename);
    await writeFile(srcFile, code, "utf-8");

    const cleanup = async () => {
      try {
        await unlink(srcFile);
      } catch { /* ignore */ }
    };

    try {
      if (config.compile) {
        const binFile = join(dir, "main");
        const { cmd, args } = config.compile(srcFile, binFile);
        const compileResult = await exec(cmd, args, TIMEOUT_MS);

        if (compileResult.code !== 0) {
          return NextResponse.json({
            stdout: "",
            stderr: compileResult.stderr,
            exitCode: compileResult.code,
          });
        }

        const { cmd: runCmd, args: runArgs } = config.run(binFile);
        const runResult = await exec(runCmd, runArgs, TIMEOUT_MS);

        try { await unlink(binFile); } catch { /* ignore */ }

        return NextResponse.json({
          stdout: runResult.stdout,
          stderr: runResult.stderr,
          exitCode: runResult.code,
        });
      }

      const { cmd, args } = config.run(srcFile);
      const result = await exec(cmd, args, TIMEOUT_MS);

      return NextResponse.json({
        stdout: result.stdout,
        stderr: result.stderr,
        exitCode: result.code,
      });
    } finally {
      await cleanup();
    }
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}
