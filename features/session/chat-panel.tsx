"use client";

import { useState, useRef, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { SentIcon } from "@hugeicons/core-free-icons";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { ChatMessage, Contributor } from "@/lib/sessions";
import { getColorForUser } from "@/lib/colors";
import { cn } from "@/lib/utils";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function highlightMentions(text: string, mentions?: string[]) {
  if (!mentions?.length) return text;

  const parts: (string | { mention: string })[] = [];
  let remaining = text;

  for (const mention of mentions) {
    const tag = `@${mention}`;
    const idx = remaining.indexOf(tag);
    if (idx >= 0) {
      if (idx > 0) parts.push(remaining.slice(0, idx));
      parts.push({ mention: tag });
      remaining = remaining.slice(idx + tag.length);
    }
  }
  if (remaining) parts.push(remaining);

  return parts;
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const color = getColorForUser(message.sender);
  const parts = highlightMentions(message.content, message.mentions);

  return (
    <div className="flex gap-2.5 px-3 py-1.5">
      <Avatar size="sm" className="mt-0.5 shrink-0">
        <AvatarFallback color={color}>
          {getInitials(message.sender)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-medium text-[#F9FAFB]">
            {message.sender}
          </span>
          <span className="text-[10px] text-[#6B7280]">
            {formatTime(message.timestamp)}
          </span>
        </div>
        <p className="mt-0.5 text-xs leading-relaxed text-[#D1D5DB] wrap-break-word">
          {Array.isArray(parts)
            ? parts.map((part, i) =>
                typeof part === "string" ? (
                  part
                ) : (
                  <span
                    key={i}
                    className="font-medium text-[#ff3c00]"
                  >
                    {part.mention}
                  </span>
                ),
              )
            : parts}
        </p>
      </div>
    </div>
  );
}

export function ChatPanel({
  messages,
  contributors,
  currentUser,
  onSend,
  className,
}: {
  messages: ChatMessage[];
  contributors: Contributor[];
  currentUser: string;
  onSend: (content: string, mentions: string[]) => void;
  className?: string;
}) {
  const [input, setInput] = useState("");
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionFilter, setMentionFilter] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  const filteredContributors = contributors.filter(
    (c) =>
      c.username !== currentUser &&
      c.username.toLowerCase().includes(mentionFilter.toLowerCase()),
  );

  function handleInputChange(value: string) {
    setInput(value);
    const lastAt = value.lastIndexOf("@");
    if (lastAt >= 0) {
      const afterAt = value.slice(lastAt + 1);
      if (!afterAt.includes(" ")) {
        setMentionOpen(true);
        setMentionFilter(afterAt);
        return;
      }
    }
    setMentionOpen(false);
    setMentionFilter("");
  }

  function insertMention(username: string) {
    const lastAt = input.lastIndexOf("@");
    const before = input.slice(0, lastAt);
    setInput(`${before}@${username} `);
    setMentionOpen(false);
    setMentionFilter("");
    inputRef.current?.focus();
  }

  function handleSend() {
    const content = input.trim();
    if (!content) return;

    const mentions = contributors
      .filter((c) => content.includes(`@${c.username}`))
      .map((c) => c.username);

    onSend(content, mentions);
    setInput("");
  }

  return (
    <div
      className={cn(
        "flex size-full flex-col overflow-hidden rounded-lg bg-[#0D1117]",
        className,
      )}
    >
      <div className="flex h-8 shrink-0 items-center gap-2 border-b border-white/5 px-3">
        <span className="text-[11px] font-medium text-[#9CA3AF]">Chat</span>
        <span className="text-[10px] text-[#4B5563]">
          {contributors.length} online
        </span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto py-2">
        {messages.length === 0 && (
          <p className="px-3 py-6 text-center text-xs text-[#4B5563]">
            No messages yet. Start the conversation!
          </p>
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
      </div>

      <div className="relative shrink-0 border-t border-white/5 p-2">
        {mentionOpen && filteredContributors.length > 0 && (
          <div className="absolute bottom-full left-2 right-2 mb-1 rounded-lg border border-white/10 bg-[#111827] p-1 shadow-lg">
            {filteredContributors.map((c) => {
              const color = getColorForUser(c.username);
              return (
                <button
                  key={c.username}
                  onClick={() => insertMention(c.username)}
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-white/5 transition-colors"
                >
                  <Avatar size="sm">
                    <AvatarFallback color={color}>
                      {getInitials(c.username)}
                    </AvatarFallback>
                  </Avatar>
                  {c.username}
                </button>
              );
            })}
          </div>
        )}
        <div className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type a message... Use @ to mention"
            className="flex-1 bg-transparent text-xs text-[#D1D5DB] outline-none placeholder:text-[#4B5563]"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="flex size-6 shrink-0 items-center justify-center rounded-md text-[#9CA3AF] transition-colors hover:text-[#ff3c00] disabled:opacity-30 disabled:hover:text-[#9CA3AF]"
          >
            <HugeiconsIcon icon={SentIcon} size={14} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}
