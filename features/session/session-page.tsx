"use client";

import { useState, useRef, useCallback, useLayoutEffect } from "react";
import type { Session, ChatMessage } from "@/lib/sessions";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { CommandLineIcon } from "@hugeicons/core-free-icons";
import { SessionToolbar } from "./session-toolbar";
import { EditorPanel } from "./editor-panel";
import { TerminalPanel } from "./terminal-panel";
import { ChatPanel } from "./chat-panel";

type MobileTab = "editor" | "terminal" | "chat";

const H_KEY = "codesesh_h_split";
const V_KEY = "codesesh_v_split";
const V_COLLAPSED_KEY = "codesesh_v_collapsed";
const DEFAULT_H = 70;
const DEFAULT_V = 70;
const TERMINAL_SNAP_PX = 100;
const CHAT_COLLAPSED_THRESHOLD = 18;

function storageNum(key: string, fallback: number): number {
  try {
    const v = localStorage.getItem(key);
    return v !== null ? Number(v) : fallback;
  } catch {
    return fallback;
  }
}

function storageBool(key: string, fallback: boolean): boolean {
  try {
    const v = localStorage.getItem(key);
    return v !== null ? v === "true" : fallback;
  } catch {
    return fallback;
  }
}

function clamp(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max);
}

function isClient() {
  return globalThis.window !== undefined;
}

function CollapsedChatPanel() {
  return (
    <div className="flex size-full items-center justify-center rounded-lg bg-[#0D1117]">
      <span className="text-[11px] font-medium text-[#6B7280]">Chat</span>
    </div>
  );
}

function HorizontalCollapsedTab({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: typeof CommandLineIcon;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex h-9 w-full shrink-0 cursor-pointer items-center gap-2 rounded-lg bg-[#0D1117] px-3 transition-colors hover:bg-[#161B22]"
    >
      <HugeiconsIcon
        icon={icon}
        size={14}
        strokeWidth={2}
        className="shrink-0 text-[#6B7280]"
      />
      <span className="text-[11px] font-medium text-[#6B7280]">{label}</span>
    </button>
  );
}

function MobileTabBar({
  active,
  onChange,
}: {
  active: MobileTab;
  onChange: (tab: MobileTab) => void;
}) {
  const tabs: { id: MobileTab; label: string }[] = [
    { id: "editor", label: "Editor" },
    { id: "terminal", label: "Terminal" },
    { id: "chat", label: "Chat" },
  ];

  return (
    <div className="flex h-9 shrink-0 items-center gap-1 border-b border-white/5 bg-[#111827] px-2 md:hidden">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "rounded-md px-3 py-1 text-xs font-medium transition-colors",
            active === tab.id
              ? "bg-white/10 text-[#F9FAFB]"
              : "text-[#6B7280] hover:text-[#9CA3AF]",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function DragHandle({
  direction,
  onDragRef,
  onDragEndRef,
}: {
  direction: "horizontal" | "vertical";
  onDragRef: React.RefObject<(delta: number) => void>;
  onDragEndRef: React.RefObject<() => void>;
}) {
  const isH = direction === "horizontal";
  const dragging = useRef(false);
  const lastPos = useRef(0);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      dragging.current = true;
      lastPos.current = isH ? e.clientX : e.clientY;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [isH],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      const pos = isH ? e.clientX : e.clientY;
      const delta = pos - lastPos.current;
      lastPos.current = pos;
      onDragRef.current(delta);
    },
    [isH, onDragRef],
  );

  const onPointerUp = useCallback(() => {
    dragging.current = false;
    onDragEndRef.current();
  }, [onDragEndRef]);

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      className={cn(
        "group relative z-10 flex shrink-0 touch-none select-none items-center justify-center",
        isH ? "w-2 cursor-col-resize" : "h-2 cursor-row-resize",
      )}
    >
      <div
        className={cn(
          "rounded-full bg-white/10 transition-colors group-hover:bg-white/25",
          isH ? "h-8 w-1" : "h-1 w-8",
        )}
      />
    </div>
  );
}

export function SessionPage({
  session,
  messages,
  currentUser,
}: {
  session: Session;
  messages: ChatMessage[];
  currentUser: string;
}) {
  const [language, setLanguage] = useState("typescript");
  const [mobileTab, setMobileTab] = useState<MobileTab>("editor");
  const [chatMessages, setChatMessages] = useState(messages);

  const [terminalCollapsed, setTerminalCollapsed] = useState(() =>
    isClient() ? storageBool(V_COLLAPSED_KEY, false) : false,
  );
  const [chatCollapsed, setChatCollapsed] = useState(() =>
    isClient()
      ? 100 - storageNum(H_KEY, DEFAULT_H) < CHAT_COLLAPSED_THRESHOLD
      : false,
  );

  const termCollapsedRef = useRef(terminalCollapsed);

  const hRef = useRef(isClient() ? storageNum(H_KEY, DEFAULT_H) : DEFAULT_H);
  const vRef = useRef(isClient() ? storageNum(V_KEY, DEFAULT_V) : DEFAULT_V);

  const containerRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (leftColRef.current) {
      leftColRef.current.style.width = `${hRef.current}%`;
    }
    if (editorRef.current && !termCollapsedRef.current) {
      editorRef.current.style.height = `${vRef.current}%`;
    }
  }, []);

  const hDragRef = useRef((delta: number) => {
    const container = containerRef.current;
    const leftCol = leftColRef.current;
    if (!container || !leftCol) return;

    const totalW = container.offsetWidth;
    const next = clamp(hRef.current + (delta / totalW) * 100, 15, 85);
    hRef.current = next;
    leftCol.style.width = `${next}%`;

    setChatCollapsed(100 - next < CHAT_COLLAPSED_THRESHOLD);
  });

  const hDragEndRef = useRef(() => {
    localStorage.setItem(H_KEY, String(hRef.current));
  });

  const vDragRef = useRef((delta: number) => {
    const leftCol = leftColRef.current;
    const editorEl = editorRef.current;
    if (!leftCol) return;

    const totalH = leftCol.offsetHeight;
    const next = vRef.current + (delta / totalH) * 100;
    const termPx = totalH * (1 - next / 100);

    if (termCollapsedRef.current) {
      if (termPx > TERMINAL_SNAP_PX) {
        termCollapsedRef.current = false;
        setTerminalCollapsed(false);
        localStorage.setItem(V_COLLAPSED_KEY, "false");
        const clamped = clamp(next, 25, 92);
        vRef.current = clamped;
        requestAnimationFrame(() => {
          const el = editorRef.current;
          if (el) el.style.height = `${clamped}%`;
        });
      }
      return;
    }

    if (termPx < TERMINAL_SNAP_PX) {
      termCollapsedRef.current = true;
      setTerminalCollapsed(true);
      localStorage.setItem(V_COLLAPSED_KEY, "true");
      return;
    }

    const clamped = clamp(next, 25, 92);
    vRef.current = clamped;
    if (editorEl) editorEl.style.height = `${clamped}%`;
  });

  const vDragEndRef = useRef(() => {
    localStorage.setItem(V_KEY, String(vRef.current));
  });

  function expandTerminal() {
    termCollapsedRef.current = false;
    setTerminalCollapsed(false);
    localStorage.setItem(V_COLLAPSED_KEY, "false");
    const restored = Math.min(storageNum(V_KEY, DEFAULT_V), 80);
    vRef.current = restored;
    requestAnimationFrame(() => {
      if (editorRef.current) editorRef.current.style.height = `${restored}%`;
    });
  }

  function handleSendMessage(content: string, mentions: string[]) {
    setChatMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        sender: currentUser,
        content,
        timestamp: Date.now(),
        mentions: mentions.length > 0 ? mentions : undefined,
      },
    ]);
  }

  return (
    <div className="dark flex size-full flex-col bg-[#020617]">
      <SessionToolbar
        session={session}
        language={language}
        onLanguageChange={setLanguage}
        onRun={() => {}}
      />

      <MobileTabBar active={mobileTab} onChange={setMobileTab} />

      {/* Mobile panels */}
      <div className="flex-1 overflow-hidden p-2 md:hidden">
        {mobileTab === "editor" && <EditorPanel language={language} />}
        {mobileTab === "terminal" && <TerminalPanel />}
        {mobileTab === "chat" && (
          <ChatPanel
            messages={chatMessages}
            contributors={session.contributors}
            currentUser={currentUser}
            onSend={handleSendMessage}
          />
        )}
      </div>

      {/* Desktop panels — positions applied via refs in useLayoutEffect */}
      <div
        ref={containerRef}
        className="hidden flex-1 gap-1 overflow-hidden p-2 md:flex"
      >
        <div
          ref={leftColRef}
          className="flex flex-col gap-1 overflow-hidden"
          style={{ width: `${DEFAULT_H}%` }}
        >
          <div
            ref={editorRef}
            className={cn(
              "overflow-hidden",
              terminalCollapsed && "flex-1",
            )}
            style={terminalCollapsed ? undefined : { height: `${DEFAULT_V}%` }}
          >
            <EditorPanel language={language} />
          </div>

          <DragHandle
            direction="vertical"
            onDragRef={vDragRef}
            onDragEndRef={vDragEndRef}
          />

          {terminalCollapsed ? (
            <HorizontalCollapsedTab
              label="Terminal"
              icon={CommandLineIcon}
              onClick={expandTerminal}
            />
          ) : (
            <div className="flex-1 overflow-hidden">
              <TerminalPanel />
            </div>
          )}
        </div>

        <DragHandle
          direction="horizontal"
          onDragRef={hDragRef}
          onDragEndRef={hDragEndRef}
        />

        <div className="flex-1 overflow-hidden">
          {chatCollapsed ? (
            <CollapsedChatPanel />
          ) : (
            <ChatPanel
              messages={chatMessages}
              contributors={session.contributors}
              currentUser={currentUser}
              onSend={handleSendMessage}
            />
          )}
        </div>
      </div>
    </div>
  );
}
