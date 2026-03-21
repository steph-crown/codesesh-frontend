"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useUserStore } from "@/stores/user-store";
import { api } from "@/lib/api";

export function IdentityDialog() {
  const pendingAction = useUserStore((s) => s.pendingAction);
  const cancelPending = useUserStore((s) => s.cancelPending);
  const setUser = useUserStore((s) => s.setUser);
  const resolvePending = useUserStore((s) => s.resolvePending);

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const open = pendingAction !== null;

  async function handleSubmit() {
    const trimmed = name.trim();
    if (!trimmed) return;

    setLoading(true);
    setError("");

    try {
      const user = await api.users.create(trimmed);
      setUser(user.id, user.display_name);
      setName("");
      resolvePending();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          cancelPending();
          setName("");
          setError("");
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-xl">
            What should we call you?
          </DialogTitle>
          <DialogDescription>
            Enter your display name to continue. This will be visible to
            collaborators.
          </DialogDescription>
        </DialogHeader>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Stephen"
          autoFocus
          disabled={loading}
          className="h-12 w-full rounded-full border-[1.5px] border-primary bg-white px-5 text-[15px] outline-none transition-shadow focus:ring-2 focus:ring-primary/40 placeholder:text-[#9CA3AF] disabled:opacity-50"
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button
          onClick={handleSubmit}
          disabled={loading || !name.trim()}
          className="h-12 w-full"
        >
          {loading ? "Creating..." : "Continue"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
