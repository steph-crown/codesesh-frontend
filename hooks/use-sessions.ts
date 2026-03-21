"use client";

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useUserStore } from "@/stores/user-store";
import type {
  GetSessionsQuery,
  SessionVisibility,
} from "@/lib/api-types";

export function useSyncCurrentUser() {
  const userId = useUserStore((s) => s.userId);
  const color = useUserStore((s) => s.color);
  const setUser = useUserStore((s) => s.setUser);
  const hasHydrated = useUserStore((s) => s._hasHydrated);

  const shouldFetch = hasHydrated && !!userId && !color;

  const { data } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => api.users.me(),
    enabled: shouldFetch,
    staleTime: Infinity,
    retry: 1,
  });

  useEffect(() => {
    if (data) {
      setUser(data.id, data.display_name, data.color);
    }
  }, [data, setUser]);
}

export function useSessions(query?: GetSessionsQuery) {
  const userId = useUserStore((s) => s.userId);

  return useQuery({
    queryKey: ["sessions", query],
    queryFn: () => api.sessions.list(query),
    enabled: !!userId,
  });
}

export function useSession(sessionId: string) {
  const userId = useUserStore((s) => s.userId);

  return useQuery({
    queryKey: ["session", sessionId],
    queryFn: () => api.sessions.get(sessionId),
    enabled: !!sessionId && !!userId,
  });
}

export function useParticipants(sessionId: string) {
  const userId = useUserStore((s) => s.userId);

  return useQuery({
    queryKey: ["participants", sessionId],
    queryFn: () => api.sessions.getParticipants(sessionId),
    enabled: !!sessionId && !!userId,
    refetchInterval: 15_000,
  });
}

export function useMessages(sessionId: string) {
  const userId = useUserStore((s) => s.userId);

  return useQuery({
    queryKey: ["messages", sessionId],
    queryFn: () => api.sessions.getMessages(sessionId),
    enabled: !!sessionId && !!userId,
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, language }: { name: string; language: string }) =>
      api.sessions.create(name, language),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
}

export function useUpdateSessionName() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, name }: { sessionId: string; name: string }) =>
      api.sessions.updateName(sessionId, name),
    onSuccess: (data) => {
      queryClient.setQueryData(["session", data.id], data);
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
}

export function useUpdateSessionVisibility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      visibility,
    }: {
      sessionId: string;
      visibility: SessionVisibility;
    }) => api.sessions.updateVisibility(sessionId, visibility),
    onSuccess: (data) => {
      queryClient.setQueryData(["session", data.id], data);
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
}

export function useEndSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => api.sessions.end(sessionId),
    onSuccess: (data) => {
      queryClient.setQueryData(["session", data.id], data);
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
}

export function useJoinSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => api.sessions.join(sessionId),
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: ["participants", sessionId] });
    },
  });
}
