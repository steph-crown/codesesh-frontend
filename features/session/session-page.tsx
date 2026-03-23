"use client";

import {
  useState,
  useRef,
  useCallback,
  useLayoutEffect,
  useEffect,
} from "react";
import type { SessionDetail, ChatMessage } from "@/lib/api-types";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { CommandLineIcon, LockIcon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { useParticipants, useMessages } from "@/hooks/use-sessions";
import { useUserStore } from "@/stores/user-store";
import { useSessionContext } from "@/contexts/session-context";
import type { SessionLanguageWire } from "@/lib/ws-messages";
import type { ConnectionStatus } from "./connection-indicator";
import { SessionToolbar } from "./session-toolbar";
import { EditorPanel, type EditorPanelHandle } from "./editor-panel";
import { TerminalPanel, type TerminalLine } from "./terminal-panel";
import { ChatPanel } from "./chat-panel";
import { NotesPanel } from "./notes-panel";
import { LANGUAGES } from "./language-selector";

type MobileTab = "editor" | "terminal" | "chat";

const H_KEY = "codesesh_h_split";
const V_KEY = "codesesh_v_split";
const V_COLLAPSED_KEY = "codesesh_v_collapsed";
const N_KEY = "codesesh_notes_split";
const N_COLLAPSED_KEY = "codesesh_notes_collapsed";
const DEFAULT_H = 70;
const DEFAULT_V = 70;
const DEFAULT_N = 72;
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
  icon: typeof CommandLineIcon | typeof LockIcon;
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
  sessionId,
  readOnly = false,
}: {
  session: SessionDetail;
  sessionId: string;
  readOnly?: boolean;
}) {
  const userId = useUserStore((s) => s.userId);
  const displayName = useUserStore((s) => s.displayName) ?? "Guest";
  const userColor = useUserStore((s) => s.color) ?? "red";
  const ctx = useSessionContext();
  const { data: participants } = useParticipants(sessionId);
  const { data: messagesData } = useMessages(sessionId);

  const apiMessages: ChatMessage[] = messagesData?.messages ?? [];

  const mergedParticipants =
    ctx.participants.length > 0 ? ctx.participants : (participants ?? []);
  const mergedMessages =
    ctx.messages.length > 0 ? ctx.messages : apiMessages;

  const connectionStatus: ConnectionStatus =
    session.status === "ended"
      ? "connected"
      : ctx.connectionState === "connected"
        ? "connected"
        : ctx.connectionState === "reconnecting" ||
            ctx.connectionState === "connecting" ||
            ctx.connectionState === "idle"
          ? "reconnecting"
          : "disconnected";

  const readOnlyCombined = readOnly || ctx.sessionEnded;

  const [language, setLanguage] = useState(session.language || "typescript");

  useEffect(() => {
    setLanguage(ctx.language);
  }, [ctx.language]);

  function handleLanguageChange(lang: string) {
    setLanguage(lang);
    if (ctx.connectionState === "connected") {
      ctx.sendLanguageChange(lang as SessionLanguageWire);
    }
  }
  const [mobileTab, setMobileTab] = useState<MobileTab>("editor");
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([]);
  const [running, setRunning] = useState(false);
  const codeEditorRef = useRef<EditorPanelHandle>(null);

  const allMessages = [...mergedMessages, ...localMessages];

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
  const rightColRef = useRef<HTMLDivElement>(null);
  const chatWrapRef = useRef<HTMLDivElement>(null);
  const nRef = useRef(isClient() ? storageNum(N_KEY, DEFAULT_N) : DEFAULT_N);
  const [notesCollapsed, setNotesCollapsed] = useState(() =>
    isClient() ? storageBool(N_COLLAPSED_KEY, true) : true,
  );
  const notesCollapsedRef = useRef(notesCollapsed);
  notesCollapsedRef.current = notesCollapsed;

  useLayoutEffect(() => {
    if (leftColRef.current) {
      leftColRef.current.style.width = `${hRef.current}%`;
    }
    if (editorRef.current && !termCollapsedRef.current) {
      editorRef.current.style.height = `${vRef.current}%`;
    }
  }, []);

  useLayoutEffect(() => {
    if (!notesCollapsed && chatWrapRef.current) {
      chatWrapRef.current.style.height = `${nRef.current}%`;
    }
  }, [notesCollapsed]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        toast.success("Already saved", {
          description: "Your code is saved automatically.",
        });
      }
    }
    globalThis.addEventListener("keydown", handleKeyDown);
    return () => globalThis.removeEventListener("keydown", handleKeyDown);
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

  const nDragRef = useRef((delta: number) => {
    const rightCol = rightColRef.current;
    const chatEl = chatWrapRef.current;
    if (!rightCol || !chatEl || notesCollapsedRef.current) return;
    const totalH = rightCol.offsetHeight;
    const next = nRef.current + (delta / totalH) * 100;
    const clamped = clamp(next, 28, 88);
    nRef.current = clamped;
    chatEl.style.height = `${clamped}%`;
  });

  const nDragEndRef = useRef(() => {
    localStorage.setItem(N_KEY, String(nRef.current));
  });

  function expandNotes() {
    notesCollapsedRef.current = false;
    setNotesCollapsed(false);
    localStorage.setItem(N_COLLAPSED_KEY, "false");
    const restored = storageNum(N_KEY, DEFAULT_N);
    nRef.current = restored;
    requestAnimationFrame(() => {
      if (chatWrapRef.current) chatWrapRef.current.style.height = `${restored}%`;
    });
  }

  function collapseNotes() {
    notesCollapsedRef.current = true;
    setNotesCollapsed(true);
    localStorage.setItem(N_COLLAPSED_KEY, "true");
    if (chatWrapRef.current) {
      chatWrapRef.current.style.height = "";
    }
  }

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

  async function runCode() {
    const code = codeEditorRef.current?.getCode();
    if (!code?.trim()) return;

    const langLabel =
      LANGUAGES.find((l) => l.id === language)?.label ?? language;

    setRunning(true);
    setTerminalLines([{ type: "system", text: `$ Running ${langLabel}...` }]);

    if (termCollapsedRef.current) {
      expandTerminal();
    }

    try {
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });

      const data = await res.json();

      if (!res.ok) {
        setTerminalLines((prev) => [
          ...prev,
          { type: "stderr", text: data.error ?? "Execution failed" },
        ]);
        return;
      }

      const lines: TerminalLine[] = [
        { type: "system", text: `$ Running ${langLabel}...` },
      ];

      if (data.stdout) {
        for (const line of data.stdout.split("\n")) {
          lines.push({ type: "stdout", text: line });
        }
      }
      if (data.stderr) {
        for (const line of data.stderr.split("\n")) {
          if (line.trim()) lines.push({ type: "stderr", text: line });
        }
      }

      lines.push({ type: "stdout", text: "" });
      lines.push({
        type: "system",
        text:
          data.exitCode === 0
            ? "Process exited with code 0"
            : `Process exited with code ${data.exitCode}`,
      });

      setTerminalLines(lines);
    } catch {
      setTerminalLines((prev) => [
        ...prev,
        { type: "stderr", text: "Failed to connect to execution server" },
      ]);
    } finally {
      setRunning(false);
    }
  }

  function handleSendMessage(content: string) {
    if (ctx.connectionState === "connected") {
      ctx.sendChatMessage(content);
      return;
    }
    setLocalMessages((prev) => [
      ...prev,
      {
        id: `local-${Date.now()}`,
        session_id: sessionId,
        user_id: userId ?? "",
        display_name: displayName,
        color: userColor,
        content,
        created_at: new Date().toISOString(),
      },
    ]);
  }

  return (
    <div className="dark flex size-full flex-col bg-[#020617]">
      <SessionToolbar
        session={session}
        participants={mergedParticipants}
        language={language}
        onLanguageChange={handleLanguageChange}
        onRun={runCode}
        running={running}
        readOnly={readOnlyCombined}
        connectionStatus={connectionStatus}
      />

      <MobileTabBar active={mobileTab} onChange={setMobileTab} />

      {/* Mobile panels */}
      <div className="flex-1 overflow-hidden p-2 md:hidden">
        {mobileTab === "editor" && (
          <EditorPanel
            ref={codeEditorRef}
            language={language}
            readOnly={readOnlyCombined}
            initialContent={session.content}
            content={ctx.content}
            collaboration={{
              docVersion: ctx.version,
              remoteEpoch: ctx.remoteEpoch,
              sendTextChange: ctx.sendTextChange,
              bumpLocalVersion: ctx.bumpLocalVersion,
              setLocalContent: ctx.setLocalContent,
              sendCursorMove: ctx.sendCursorMove,
              isApplyingRemoteEdit: ctx.isApplyingRemoteEdit,
              hasReceivedFullSync: ctx.hasReceivedFullSync,
            }}
          />
        )}
        {mobileTab === "terminal" && (
          <TerminalPanel
            lines={terminalLines}
            running={running}
            onClear={() => setTerminalLines([])}
          />
        )}
        {mobileTab === "chat" && (
          <ChatPanel
            messages={allMessages}
            participants={mergedParticipants}
            currentUserId={userId ?? ""}
            onSend={handleSendMessage}
            disabled={readOnlyCombined}
          />
        )}
      </div>

      {/* Desktop panels */}
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
            <EditorPanel
              ref={codeEditorRef}
              language={language}
              readOnly={readOnlyCombined}
              initialContent={session.content}
              content={ctx.content}
              collaboration={{
                docVersion: ctx.version,
                remoteEpoch: ctx.remoteEpoch,
                sendTextChange: ctx.sendTextChange,
                bumpLocalVersion: ctx.bumpLocalVersion,
                setLocalContent: ctx.setLocalContent,
                sendCursorMove: ctx.sendCursorMove,
                isApplyingRemoteEdit: ctx.isApplyingRemoteEdit,
                hasReceivedFullSync: ctx.hasReceivedFullSync,
              }}
            />
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
              <TerminalPanel
                lines={terminalLines}
                running={running}
                onClear={() => setTerminalLines([])}
              />
            </div>
          )}
        </div>

        <DragHandle
          direction="horizontal"
          onDragRef={hDragRef}
          onDragEndRef={hDragEndRef}
        />

        <div
          ref={rightColRef}
          className="flex min-h-0 flex-1 flex-col gap-1 overflow-hidden"
        >
          <div
            ref={chatWrapRef}
            className={cn(
              "min-h-0 overflow-hidden",
              notesCollapsed && "flex-1",
            )}
            style={!notesCollapsed ? { height: `${nRef.current}%` } : undefined}
          >
            {chatCollapsed ? (
              <CollapsedChatPanel />
            ) : (
              <ChatPanel
                messages={allMessages}
                participants={mergedParticipants}
                currentUserId={userId ?? ""}
                onSend={handleSendMessage}
                disabled={readOnlyCombined}
              />
            )}
          </div>

          {!notesCollapsed && (
            <DragHandle
              direction="vertical"
              onDragRef={nDragRef}
              onDragEndRef={nDragEndRef}
            />
          )}

          {notesCollapsed ? (
            <HorizontalCollapsedTab
              label="Notes"
              icon={LockIcon}
              onClick={expandNotes}
            />
          ) : (
            <div className="min-h-0 flex-1 overflow-hidden">
              <NotesPanel sessionId={sessionId} onCollapse={collapseNotes} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
