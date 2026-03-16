"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useInView } from "framer-motion"

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

const CODE_LINES = [
  "function greet(name: string) {",
  '  return `Hello, ${name}!`',
  "}",
  "",
  'const message = greet("world")',
  "console.log(message)",
]

const LINE_AUTHORS: ("alice" | "bob")[] = [
  "alice",
  "alice",
  "bob",
  "bob",
  "alice",
  "bob",
]

const CHAR_DELAY = 50
const LINE_PAUSE = 600
const END_PAUSE = 3000
const DISPLAY_LINES = 7

type CursorPos = { line: number; col: number }

export function LiveDemo() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { amount: 0.3 })

  const [completedLines, setCompletedLines] = useState<string[]>([])
  const [currentLineText, setCurrentLineText] = useState("")
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const [activeUser, setActiveUser] = useState<"alice" | "bob">("alice")
  const [aliceCursor, setAliceCursor] = useState<CursorPos>({
    line: 0,
    col: 0,
  })
  const [bobCursor, setBobCursor] = useState<CursorPos>({ line: 0, col: 0 })

  useEffect(() => {
    if (!isInView) return

    let cancelled = false

    async function animate() {
      while (!cancelled) {
        setCompletedLines([])
        setCurrentLineText("")
        setCurrentLineIndex(0)
        setActiveUser("alice")
        setAliceCursor({ line: 0, col: 0 })
        setBobCursor({ line: 0, col: 0 })

        await sleep(400)

        for (let li = 0; li < CODE_LINES.length; li++) {
          if (cancelled) return
          const line = CODE_LINES[li]
          const author = LINE_AUTHORS[li]

          setActiveUser(author)
          setCurrentLineIndex(li)

          for (let ci = 0; ci <= line.length; ci++) {
            if (cancelled) return
            setCurrentLineText(line.slice(0, ci))

            const pos = { line: li, col: ci }
            if (author === "alice") setAliceCursor(pos)
            else setBobCursor(pos)

            if (ci < line.length) {
              await sleep(CHAR_DELAY + Math.random() * 30)
            }
          }

          setCompletedLines((prev) => [...prev, line])
          setCurrentLineText("")

          if (li < CODE_LINES.length - 1) {
            await sleep(LINE_PAUSE)
          }
        }

        await sleep(END_PAUSE)
      }
    }

    animate()
    return () => {
      cancelled = true
    }
  }, [isInView])

  const displayLines: string[] = [...completedLines]
  if (currentLineIndex >= completedLines.length) {
    displayLines.push(currentLineText)
  }
  while (displayLines.length < DISPLAY_LINES) {
    displayLines.push("")
  }

  return (
    <section ref={sectionRef} className="bg-[#020617] py-20 px-6 md:px-12">
      <motion.p
        className="text-center text-sm font-medium text-gray-400 mb-10"
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
  )
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
  userName: string
  userColor: string
  lines: string[]
  aliceCursor: CursorPos
  bobCursor: CursorPos
  activeUser: "alice" | "bob"
  completedCount: number
}) {
  return (
    <div className="rounded-xl bg-[#0B1120] overflow-hidden border border-white/[0.06]">
      <div className="flex items-center justify-between px-4 h-10 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: userColor }}
          />
          <span className="text-xs font-medium text-gray-100">{userName}</span>
        </div>
        <span className="text-[11px] text-gray-500">TypeScript</span>
      </div>

      <div className="p-4 font-mono text-[13px] leading-6 min-h-[196px]">
        {lines.map((line, i) => (
          <div key={i} className="flex">
            <span className="w-7 text-right text-gray-600 mr-3 select-none text-xs leading-6">
              {i + 1}
            </span>
            <span className="text-gray-200 whitespace-pre">
              <LineWithCursors
                text={line}
                lineIndex={i}
                aliceCursor={aliceCursor}
                bobCursor={bobCursor}
                activeUser={activeUser}
                isTypingLine={i === completedCount}
              />
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function LineWithCursors({
  text,
  lineIndex,
  aliceCursor,
  bobCursor,
  activeUser,
  isTypingLine,
}: {
  text: string
  lineIndex: number
  aliceCursor: CursorPos
  bobCursor: CursorPos
  activeUser: "alice" | "bob"
  isTypingLine: boolean
}) {
  type CursorInfo = {
    col: number
    color: string
    label: string
    active: boolean
  }

  const cursors: CursorInfo[] = []

  if (aliceCursor.line === lineIndex) {
    cursors.push({
      col: aliceCursor.col,
      color: "#ff3c00",
      label: "Alice",
      active: activeUser === "alice" && isTypingLine,
    })
  }
  if (bobCursor.line === lineIndex) {
    cursors.push({
      col: bobCursor.col,
      color: "#3B82F6",
      label: "Bob",
      active: activeUser === "bob" && isTypingLine,
    })
  }

  cursors.sort((a, b) => a.col - b.col)

  if (cursors.length === 0) {
    return <>{text || "\u00A0"}</>
  }

  const parts: React.ReactNode[] = []
  let lastCol = 0

  cursors.forEach((cursor, idx) => {
    if (cursor.col > lastCol) {
      parts.push(
        <span key={`t-${idx}`}>{text.slice(lastCol, cursor.col)}</span>
      )
    }
    parts.push(<CursorBar key={`c-${idx}`} {...cursor} />)
    lastCol = cursor.col
  })

  if (lastCol < text.length) {
    parts.push(<span key="t-end">{text.slice(lastCol)}</span>)
  } else if (parts.length === 0) {
    parts.push(<span key="empty">{"\u00A0"}</span>)
  }

  return <>{parts}</>
}

function CursorBar({
  color,
  label,
  active,
}: {
  color: string
  label: string
  active: boolean
}) {
  return (
    <span className="relative inline-block w-0">
      <span
        className={`absolute top-0 left-0 inline-block w-[2px] h-[1.15em] ${active ? "animate-cursor-blink" : "opacity-40"}`}
        style={{ backgroundColor: color }}
      />
      <span
        className="absolute -top-[18px] left-0 text-[9px] leading-none px-1 py-0.5 rounded font-sans whitespace-nowrap"
        style={{ backgroundColor: color, color: "white" }}
      >
        {label}
      </span>
    </span>
  )
}
