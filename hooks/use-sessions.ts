"use client";

import type { Session, UserProfile } from "@/lib/sessions";

const NOW = 1742158800000; // 2025-03-16T21:00:00Z

const HARDCODED_SESSIONS: Session[] = [
  {
    id: "abc12345",
    title: "React Dashboard",
    username: "Stephen",
    createdAt: NOW - 3600000,
    updatedAt: NOW - 1800000,
    isOwner: true,
    contributors: [{ username: "Stephen" }, { username: "Alex" }],
  },
  {
    id: "def67890",
    title: "API Integration",
    username: "Stephen",
    createdAt: NOW - 86400000,
    updatedAt: NOW - 43200000,
    isOwner: true,
    contributors: [{ username: "Stephen" }],
  },
  {
    id: "ghi11223",
    title: "Auth Flow",
    username: "Maya",
    createdAt: NOW - 172800000,
    updatedAt: NOW - 86400000,
    isOwner: false,
    contributors: [{ username: "Maya" }, { username: "Stephen" }],
  },
  {
    id: "jkl44556",
    title: "Landing Page",
    username: "Stephen",
    createdAt: NOW - 259200000,
    updatedAt: NOW - 172800000,
    isOwner: true,
    contributors: [{ username: "Stephen" }, { username: "Jordan" }],
  },
  {
    id: "mno77889",
    title: "Database Schema",
    username: "Alex",
    createdAt: NOW - 345600000,
    updatedAt: NOW - 259200000,
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
