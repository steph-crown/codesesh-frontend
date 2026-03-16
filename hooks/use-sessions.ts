"use client";

import type { Session, UserProfile } from "@/lib/sessions";

const HARDCODED_SESSIONS: Session[] = [
  {
    id: "abc12345",
    title: "React Dashboard",
    username: "Stephen",
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now() - 1800000,
    isOwner: true,
    contributors: [{ username: "Stephen" }, { username: "Alex" }],
  },
  {
    id: "def67890",
    title: "API Integration",
    username: "Stephen",
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 43200000,
    isOwner: true,
    contributors: [{ username: "Stephen" }],
  },
  {
    id: "ghi11223",
    title: "Auth Flow",
    username: "Maya",
    createdAt: Date.now() - 172800000,
    updatedAt: Date.now() - 86400000,
    isOwner: false,
    contributors: [{ username: "Maya" }, { username: "Stephen" }],
  },
  {
    id: "jkl44556",
    title: "Landing Page",
    username: "Stephen",
    createdAt: Date.now() - 259200000,
    updatedAt: Date.now() - 172800000,
    isOwner: true,
    contributors: [{ username: "Stephen" }, { username: "Jordan" }],
  },
  {
    id: "mno77889",
    title: "Database Schema",
    username: "Alex",
    createdAt: Date.now() - 345600000,
    updatedAt: Date.now() - 259200000,
    isOwner: false,
    contributors: [{ username: "Alex" }, { username: "Stephen" }],
  },
];

const HARDCODED_USER: UserProfile = { username: "Stephen" };

export function useSessions() {
  const sessions = HARDCODED_SESSIONS;

  const createSession = () => sessions[0];
  const deleteSession = () => {};
  const renameSession = () => {};

  return { sessions, createSession, deleteSession, renameSession };
}

export function useUser() {
  return HARDCODED_USER;
}
