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
import {
  useSessions,
  useCreateSession,
  useUpdateSessionName,
  useEndSession,
} from "@/hooks/use-sessions";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useSidebar } from "@/hooks/use-sidebar";
import {
  SessionFilters,
  type FilterValue,
} from "@/features/dashboard/session-filters";
import { SessionGrid } from "@/features/dashboard/session-grid";

export default function MySessionsPage() {
  const router = useRouter();
  const { data: sessionsData, isLoading } = useSessions();
  const createSession = useCreateSession();
  const updateName = useUpdateSessionName();
  const endSession = useEndSession();
  const requireAuth = useRequireAuth();
  const { setMobileOpen } = useSidebar();

  const sessions = sessionsData?.data ?? [];

  const [filter, setFilter] = useState<FilterValue>("all");
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [sessionName, setSessionName] = useState("");
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const filtered = useMemo(() => {
    let list = sessions;
    if (filter === "owned") list = list.filter((s) => s.is_owner);
    if (filter === "joined") list = list.filter((s) => !s.is_owner);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q));
    }
    return list;
  }, [sessions, filter, search]);

  function handleCreate() {
    const name = sessionName.trim();
    if (!name) return;
    setCreateOpen(false);
    setSessionName("");
    createSession.mutate(
      { name, language: "typescript" },
      {
        onSuccess: (session) => {
          router.push(`/sessions/${session.id}`);
        },
      },
    );
  }

  function handleRename() {
    if (!renameId || !renameValue.trim()) return;
    updateName.mutate({ sessionId: renameId, name: renameValue.trim() });
    setRenameId(null);
    setRenameValue("");
  }

  function openRename(id: string) {
    const session = sessions.find((s) => s.id === id);
    if (!session) return;
    setRenameId(id);
    setRenameValue(session.name);
  }

  function handleEnd(id: string) {
    endSession.mutate(id);
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-10 md:px-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-1.5 transition-colors hover:bg-[#FAF5F0] md:hidden"
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
        <Button
          onClick={() => requireAuth(() => setCreateOpen(true))}
          className="h-10 px-5"
        >
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
          className="h-11 w-full rounded-full border border-[#DFDDD7] bg-white pl-11 pr-5 text-sm outline-none transition-shadow placeholder:text-[#9CA3AF] focus:border-primary focus:ring-2 focus:ring-primary/40"
        />
      </div>

      {/* Filters */}
      <div className="mt-4 flex items-center gap-2">
        <span className="text-sm text-[#9CA3AF]">Filter by</span>
        <SessionFilters value={filter} onChange={setFilter} />
      </div>

      {/* Grid */}
      <div className="mt-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <span className="inline-block size-6 animate-spin rounded-full border-2 border-[#9CA3AF]/30 border-t-[#9CA3AF]" />
          </div>
        ) : (
          <SessionGrid
            sessions={filtered}
            onRename={openRename}
            onEnd={handleEnd}
          />
        )}
      </div>

      {/* Create session dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl">New session</DialogTitle>
            <DialogDescription>
              Give your coding session a name.
            </DialogDescription>
          </DialogHeader>
          <input
            type="text"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            placeholder="e.g. React Dashboard"
            autoFocus
            className="h-12 w-full rounded-full border-[1.5px] border-primary bg-white px-5 text-[15px] outline-none transition-shadow focus:ring-2 focus:ring-primary/40 placeholder:text-[#9CA3AF]"
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <Button
            onClick={handleCreate}
            disabled={createSession.isPending}
            className="h-12 w-full"
          >
            {createSession.isPending ? "Creating..." : "Create Session"}
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
            className="h-12 w-full rounded-full border-[1.5px] border-primary bg-white px-5 text-[15px] outline-none transition-shadow focus:ring-2 focus:ring-primary/40 placeholder:text-[#9CA3AF]"
            onKeyDown={(e) => e.key === "Enter" && handleRename()}
          />
          <Button
            onClick={handleRename}
            disabled={updateName.isPending}
            className="h-12 w-full"
          >
            {updateName.isPending ? "Saving..." : "Save"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
