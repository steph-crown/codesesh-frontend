"use client";

import { useState } from "react";
import {
  Panel,
  Group as PanelGroup,
  Separator as PanelResizeHandle,
} from "react-resizable-panels";
import type { Session, ChatMessage } from "@/lib/sessions";
import { cn } from "@/lib/utils";
import { SessionToolbar } from "./session-toolbar";
import { EditorPanel } from "./editor-panel";
import { TerminalPanel } from "./terminal-panel";
import { ChatPanel } from "./chat-panel";

type MobileTab = "editor" | "terminal" | "chat";

function ResizeHandle({
  direction = "horizontal",
}: {
  direction?: "horizontal" | "vertical";
}) {
  const isHorizontal = direction === "horizontal";

  return (
    <PanelResizeHandle
      className={cn(
        "group relative flex items-center justify-center",
        isHorizontal ? "w-2 cursor-col-resize" : "h-2 cursor-row-resize",
      )}
    >
      <div
        className={cn(
          "rounded-full bg-white/10 transition-colors group-hover:bg-white/20 group-data-[resize-handle-active]:bg-[#ff3c00]",
          isHorizontal ? "h-8 w-1" : "h-1 w-8",
        )}
      />
    </PanelResizeHandle>
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

  function handleRun() {
    // mock — in the future this sends code to the backend
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
        onRun={handleRun}
      />

      {/* Mobile tab bar */}
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

      {/* Desktop resizable panels */}
      <div className="hidden flex-1 overflow-hidden p-2 md:block">
        <PanelGroup direction="horizontal" className="size-full">
          {/* Left column: editor + terminal */}
          <Panel defaultSize={65} minSize={40}>
            <PanelGroup direction="vertical" className="size-full">
              <Panel defaultSize={70} minSize={30}>
                <EditorPanel language={language} />
              </Panel>
              <ResizeHandle direction="vertical" />
              <Panel defaultSize={30} minSize={15}>
                <TerminalPanel />
              </Panel>
            </PanelGroup>
          </Panel>

          <ResizeHandle direction="horizontal" />

          {/* Right column: chat */}
          <Panel defaultSize={35} minSize={20}>
            <ChatPanel
              messages={chatMessages}
              contributors={session.contributors}
              currentUser={currentUser}
              onSend={handleSendMessage}
            />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}
