"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useSessions } from "@/hooks/use-sessions";
import { useSidebar } from "@/hooks/use-sidebar";
import {
  SessionFilters,
  type FilterValue,
} from "@/features/dashboard/session-filters";
import { SessionGrid } from "@/features/dashboard/session-grid";

export default function MySessionsPage() {
  const router = useRouter();
  const { sessions, createSession, deleteSession, renameSession } =
    useSessions();
  const { setMobileOpen } = useSidebar();

  const [filter, setFilter] = useState<FilterValue>("all");
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const filtered = useMemo(() => {
    let list = sessions;
    if (filter === "owned") list = list.filter((s) => s.isOwner);
    if (filter === "joined") list = list.filter((s) => !s.isOwner);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((s) => s.title.toLowerCase().includes(q));
    }
    return list;
  }, [sessions, filter, search]);

  function handleCreate() {
    const name = newUsername.trim();
    if (!name) return;
    const session = createSession(name);
    setCreateOpen(false);
    setNewUsername("");
    router.push(`/sessions/${session.id}`);
  }

  function handleRename() {
    if (!renameId || !renameValue.trim()) return;
    renameSession(renameId, renameValue.trim());
    setRenameId(null);
    setRenameValue("");
  }

  function openRename(id: string) {
    const session = sessions.find((s) => s.id === id);
    if (!session) return;
    setRenameId(id);
    setRenameValue(session.title);
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-5 md:px-12 py-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded-lg hover:bg-[#FAF5F0] transition-colors md:hidden"
            aria-label="Open navigation"
          >
            <Image
              src="/collapse.svg"
              alt=""
              width={18}
              height={18}
              className="rotate-180"
            />
          </button>
          <h1 className="text-2xl font-bold text-[#0A0A0A]">Sessions</h1>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="h-10 px-5">
          New session
        </Button>
      </div>

      {/* Search */}
      <div className="relative mt-6">
        <HugeiconsIcon
          icon={Search01Icon}
          size={18}
          strokeWidth={2}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search sessions..."
          className="w-full h-11 rounded-full bg-white border border-[#DFDDD7] pl-11 pr-5 text-sm outline-none transition-shadow focus:ring-2 focus:ring-primary/40 focus:border-primary placeholder:text-[#9CA3AF]"
        />
      </div>

      {/* Filters */}
      <div className="mt-4 flex items-center gap-2">
        <span className="text-sm text-[#9CA3AF]">Filter by</span>
        <SessionFilters value={filter} onChange={setFilter} />
      </div>

      {/* Grid */}
      <div className="mt-6">
        <SessionGrid
          sessions={filtered}
          onRename={openRename}
          onDelete={deleteSession}
        />
      </div>

      {/* Create session dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl">New session</DialogTitle>
            <DialogDescription>
              Enter your display name to create a new coding session.
            </DialogDescription>
          </DialogHeader>
          <input
            type="text"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            placeholder="What should we call you?"
            autoFocus
            className="w-full h-12 rounded-full bg-white border-[1.5px] border-primary px-5 text-[15px] outline-none transition-shadow focus:ring-2 focus:ring-primary/40 placeholder:text-[#9CA3AF]"
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <Button onClick={handleCreate} className="w-full h-12">
            Create Session
          </Button>
        </DialogContent>
      </Dialog>

      {/* Rename dialog */}
      <Dialog
        open={renameId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setRenameId(null);
            setRenameValue("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl">Rename session</DialogTitle>
            <DialogDescription>
              Enter a new name for this session.
            </DialogDescription>
          </DialogHeader>
          <input
            type="text"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            placeholder="Session name"
            autoFocus
            className="w-full h-12 rounded-full bg-white border-[1.5px] border-primary px-5 text-[15px] outline-none transition-shadow focus:ring-2 focus:ring-primary/40 placeholder:text-[#9CA3AF]"
            onKeyDown={(e) => e.key === "Enter" && handleRename()}
          />
          <Button onClick={handleRename} className="w-full h-12">
            Save
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
