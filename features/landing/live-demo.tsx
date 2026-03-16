"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const CODE_LINES = [
  "function greet(name: string) {",
  "  return `Hello, ${name}!`",
  "}",
  "",
  'const message = greet("world")',
  "console.log(message)",
];

const LINE_AUTHORS: ("alice" | "bob")[] = [
  "alice",
  "alice",
  "bob",
  "bob",
  "alice",
  "bob",
];

const CHAR_DELAY = 50;
const LINE_PAUSE = 600;
const END_PAUSE = 3000;
const DISPLAY_LINES = 7;

type CursorPos = { line: number; col: number };

const KEYWORDS = new Set([
  "function",
  "return",
  "const",
  "let",
  "var",
  "new",
  "if",
  "else",
  "for",
  "while",
  "import",
  "export",
  "class",
  "typeof",
  "async",
  "await",
]);
const TYPES = new Set([
  "string",
  "number",
  "boolean",
  "void",
  "null",
  "undefined",
  "any",
  "never",
]);
const BUILTINS = new Set(["console", "Math", "Array", "Object", "Promise"]);

function highlightLine(text: string): React.ReactNode[] {
  if (!text) return [];
  const result: React.ReactNode[] = [];
  let pos = 0;

  while (pos < text.length) {
    if (/\s/.test(text[pos])) {
      let end = pos;
      while (end < text.length && /\s/.test(text[end])) end++;
      result.push(<span key={pos}>{text.slice(pos, end)}</span>);
      pos = end;
      continue;
    }

    if (text[pos] === "`" || text[pos] === '"' || text[pos] === "'") {
      const quote = text[pos];
      let end = pos + 1;
      while (end < text.length && text[end] !== quote) {
        if (text[end] === "\\") end++;
        end++;
      }
      if (end < text.length) end++;
      result.push(
        <span key={pos} className="text-[#86EFAC]">
          {text.slice(pos, end)}
        </span>,
      );
      pos = end;
      continue;
    }

    if (/[a-zA-Z_$]/.test(text[pos])) {
      let end = pos;
      while (end < text.length && /[a-zA-Z0-9_$]/.test(text[end])) end++;
      const word = text.slice(pos, end);

      if (KEYWORDS.has(word)) {
        result.push(
          <span key={pos} className="text-[#C084FC]">
            {word}
          </span>,
        );
      } else if (TYPES.has(word)) {
        result.push(
          <span key={pos} className="text-[#67E8F9]">
            {word}
          </span>,
        );
      } else if (BUILTINS.has(word)) {
        result.push(
          <span key={pos} className="text-[#FCD34D]">
            {word}
          </span>,
        );
      } else if (end < text.length && text[end] === "(") {
        result.push(
          <span key={pos} className="text-[#93C5FD]">
            {word}
          </span>,
        );
      } else {
        result.push(
          <span key={pos} className="text-gray-200">
            {word}
          </span>,
        );
      }
      pos = end;
      continue;
    }

    if (/\d/.test(text[pos])) {
      let end = pos;
      while (end < text.length && /[\d.]/.test(text[end])) end++;
      result.push(
        <span key={pos} className="text-[#FCD34D]">
          {text.slice(pos, end)}
        </span>,
      );
      pos = end;
      continue;
    }

    result.push(
      <span key={pos} className="text-gray-400">
        {text[pos]}
      </span>,
    );
    pos++;
  }

  return result;
}

export function LiveDemo() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { amount: 0.3 });

  const [completedLines, setCompletedLines] = useState<string[]>([]);
  const [currentLineText, setCurrentLineText] = useState("");
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [activeUser, setActiveUser] = useState<"alice" | "bob">("alice");
  const [aliceCursor, setAliceCursor] = useState<CursorPos>({
    line: 0,
    col: 0,
  });
  const [bobCursor, setBobCursor] = useState<CursorPos>({ line: 0, col: 0 });

  useEffect(() => {
    if (!isInView) return;

    let cancelled = false;

    async function animate() {
      while (!cancelled) {
        setCompletedLines([]);
        setCurrentLineText("");
        setCurrentLineIndex(0);
        setActiveUser("alice");
        setAliceCursor({ line: 0, col: 0 });
        setBobCursor({ line: 0, col: 0 });

        await sleep(400);

        for (let li = 0; li < CODE_LINES.length; li++) {
          if (cancelled) return;
          const line = CODE_LINES[li];
          const author = LINE_AUTHORS[li];

          setActiveUser(author);
          setCurrentLineIndex(li);

          for (let ci = 0; ci <= line.length; ci++) {
            if (cancelled) return;
            setCurrentLineText(line.slice(0, ci));

            const pos = { line: li, col: ci };
            if (author === "alice") setAliceCursor(pos);
            else setBobCursor(pos);

            if (ci < line.length) {
              await sleep(CHAR_DELAY + Math.random() * 30);
            }
          }

          setCompletedLines((prev) => [...prev, line]);
          setCurrentLineText("");

          if (li < CODE_LINES.length - 1) {
            await sleep(LINE_PAUSE);
          }
        }

        await sleep(END_PAUSE);
      }
    }

    animate();
    return () => {
      cancelled = true;
    };
  }, [isInView]);

  const displayLines: string[] = [...completedLines];
  if (currentLineIndex >= completedLines.length) {
    displayLines.push(currentLineText);
  }
  while (displayLines.length < DISPLAY_LINES) {
    displayLines.push("");
  }

  return (
    <section ref={sectionRef} className="bg-[#020617] py-12 px-5 md:px-12">
      <motion.p
        className="text-center text-sm font-medium text-gray-400 mb-8"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        See it in action
      </motion.p>

      <motion.div
        className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.15 }}
      >
        <EditorShell
          userName="Alice"
          userColor="#ff3c00"
          lines={displayLines}
          aliceCursor={aliceCursor}
          bobCursor={bobCursor}
          activeUser={activeUser}
          completedCount={completedLines.length}
        />
        <EditorShell
          userName="Bob"
          userColor="#3B82F6"
          lines={displayLines}
          aliceCursor={aliceCursor}
          bobCursor={bobCursor}
          activeUser={activeUser}
          completedCount={completedLines.length}
        />
      </motion.div>
    </section>
  );
}

function EditorShell({
  userName,
  userColor,
  lines,
  aliceCursor,
  bobCursor,
  activeUser,
  completedCount,
}: {
  userName: string;
  userColor: string;
  lines: string[];
  aliceCursor: CursorPos;
  bobCursor: CursorPos;
  activeUser: "alice" | "bob";
  completedCount: number;
}) {
  return (
    <div className="rounded-xl bg-[#0B1120] overflow-hidden border border-white/[0.06]">
      <div className="flex items-center justify-between px-4 h-10 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-[2px]"
            style={{ backgroundColor: userColor }}
          />
          <span className="text-xs font-medium text-gray-100">{userName}</span>
        </div>
        <span className="text-[11px] text-gray-500">TypeScript</span>
      </div>

      <div className="p-4 font-mono text-[13px] leading-6 min-h-[196px]">
        {lines.map((line, i) => {
          const cursorsOnLine: {
            col: number;
            color: string;
            label: string;
            active: boolean;
          }[] = [];

          if (aliceCursor.line === i) {
            cursorsOnLine.push({
              col: aliceCursor.col,
              color: "#ff3c00",
              label: "Alice",
              active: activeUser === "alice" && i === completedCount,
            });
          }
          if (bobCursor.line === i) {
            cursorsOnLine.push({
              col: bobCursor.col,
              color: "#3B82F6",
              label: "Bob",
              active: activeUser === "bob" && i === completedCount,
            });
          }

          return (
            <div key={i} className="flex">
              <span className="w-7 text-right text-gray-600 mr-3 select-none text-xs leading-6">
                {i + 1}
              </span>
              <div className="relative whitespace-pre">
                {line ? highlightLine(line) : "\u00A0"}
                {cursorsOnLine.map((c) => (
                  <span
                    key={c.label}
                    className="absolute top-0"
                    style={{ left: `${c.col}ch` }}
                  >
                    <span
                      className={`inline-block w-[2px] h-[1.15em] ${c.active ? "animate-cursor-blink" : "opacity-40"}`}
                      style={{ backgroundColor: c.color }}
                    />
                    <span
                      className="absolute -top-[18px] left-0 text-[9px] leading-none px-1 py-0.5 rounded font-sans whitespace-nowrap"
                      style={{ backgroundColor: c.color, color: "white" }}
                    >
                      {c.label}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
