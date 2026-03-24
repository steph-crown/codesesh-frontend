"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
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
import { trackSessionCreated } from "@/lib/analytics";
import { generateSessionName } from "@/lib/session-names";
import {
  SessionFilters,
  type FilterValue,
} from "@/features/dashboard/session-filters";
import { SessionGrid } from "@/features/dashboard/session-grid";

function SessionCardSkeleton() {
  return (
    <div className="rounded-[1rem] border border-[#ededea] bg-white p-8">
      <Skeleton className="h-5 w-2/3 bg-[#F0EDE8]" />
      <div className="mt-3 flex items-center gap-2">
        <Skeleton className="h-3.5 w-16 bg-[#F0EDE8]" />
        <Skeleton className="h-3.5 w-24 bg-[#F0EDE8]" />
      </div>
      <div className="mt-6 flex items-center justify-between">
        <Skeleton className="h-3.5 w-16 rounded-full bg-[#F0EDE8]" />
        <Skeleton className="h-3.5 w-24 bg-[#F0EDE8]" />
      </div>
    </div>
  );
}

export default function MySessionsPage() {
  const router = useRouter();
  const { data: sessionsData, isLoading } = useSessions();
  const createSession = useCreateSession();
  const updateName = useUpdateSessionName();
  const endSession = useEndSession();
  const requireAuth = useRequireAuth();
  const { setMobileOpen } = useSidebar();

  const sessions = useMemo(
    () => sessionsData?.data ?? [],
    [sessionsData?.data],
  );

  const [filter, setFilter] = useState<FilterValue>("all");
  const [search, setSearch] = useState("");
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

  function handleNewSession() {
    requireAuth(() => {
      createSession.mutate(
        { name: generateSessionName(), language: "typescript" },
        {
          onSuccess: (session) => {
            trackSessionCreated("my_sessions");
            router.push(`/sessions/${session.short_id}`);
          },
        },
      );
    });
  }

  function handleRename() {
    if (!renameId || !renameValue.trim()) return;
    updateName.mutate(
      { sessionId: renameId, name: renameValue.trim() },
      {
        onSuccess: () => {
          setRenameId(null);
          setRenameValue("");
        },
      },
    );
  }

  function openRename(shortId: string) {
    const session = sessions.find((s) => s.short_id === shortId);
    if (!session) return;
    setRenameId(shortId);
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
          onClick={handleNewSession}
          disabled={createSession.isPending}
          className="h-10 px-5"
        >
          {createSession.isPending && <Spinner />}
          {createSession.isPending ? "Creating..." : "New session"}
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
      <div className="mt-4 flex flex-col gap-2 md:flex-row md:items-center md:gap-2">
        <span className="shrink-0 text-sm text-[#9CA3AF]">Filter by</span>
        <div className="min-w-0 flex-1 md:flex-none">
          <SessionFilters value={filter} onChange={setFilter} />
        </div>
      </div>

      {/* Grid */}
      <div className="mt-6">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <SessionCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <SessionGrid
            sessions={filtered}
            onRename={openRename}
            onEnd={handleEnd}
          />
        )}
      </div>

      {/* Rename dialog */}
      <Dialog
        open={renameId !== null}
        onOpenChange={(open) => {
          if (!open && !updateName.isPending) {
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
            disabled={updateName.isPending}
            className="h-12 w-full rounded-full border-[1.5px] border-primary bg-white px-5 text-[15px] outline-none transition-shadow focus:ring-2 focus:ring-primary/40 placeholder:text-[#9CA3AF] disabled:opacity-50"
            onKeyDown={(e) => e.key === "Enter" && handleRename()}
          />
          <Button
            onClick={handleRename}
            disabled={updateName.isPending || !renameValue.trim()}
            className="h-12 w-full"
          >
            {updateName.isPending && <Spinner />}
            {updateName.isPending ? "Saving..." : "Save"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
