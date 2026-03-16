"use client";

import type { Session, UserProfile, ChatMessage } from "@/lib/sessions";
import { getColorForUser } from "@/lib/colors";

const NOW = 1742158800000; // 2025-03-16T21:00:00Z

const HARDCODED_SESSIONS: Session[] = [
  {
    id: "abc12345",
    title: "React Dashboard",
    username: "Stephen",
    createdAt: NOW - 3600000,
    updatedAt: NOW - 1800000,
    isOwner: true,
    privacy: "edit",
    contributors: [
      { username: "Stephen", color: getColorForUser("Stephen").name },
      { username: "Alex", color: getColorForUser("Alex").name },
    ],
  },
  {
    id: "def67890",
    title: "API Integration",
    username: "Stephen",
    createdAt: NOW - 86400000,
    updatedAt: NOW - 43200000,
    isOwner: true,
    privacy: "private",
    contributors: [
      { username: "Stephen", color: getColorForUser("Stephen").name },
    ],
  },
  {
    id: "ghi11223",
    title: "Auth Flow",
    username: "Maya",
    createdAt: NOW - 172800000,
    updatedAt: NOW - 86400000,
    isOwner: false,
    privacy: "view",
    contributors: [
      { username: "Maya", color: getColorForUser("Maya").name },
      { username: "Stephen", color: getColorForUser("Stephen").name },
    ],
  },
  {
    id: "jkl44556",
    title: "Landing Page",
    username: "Stephen",
    createdAt: NOW - 259200000,
    updatedAt: NOW - 172800000,
    isOwner: true,
    privacy: "private",
    contributors: [
      { username: "Stephen", color: getColorForUser("Stephen").name },
      { username: "Jordan", color: getColorForUser("Jordan").name },
    ],
  },
  {
    id: "mno77889",
    title: "Database Schema",
    username: "Alex",
    createdAt: NOW - 345600000,
    updatedAt: NOW - 259200000,
    isOwner: false,
    privacy: "edit",
    contributors: [
      { username: "Alex", color: getColorForUser("Alex").name },
      { username: "Stephen", color: getColorForUser("Stephen").name },
    ],
  },
];

const HARDCODED_CHAT: ChatMessage[] = [
  {
    id: "msg1",
    sender: "Alex",
    content: "Hey, I pushed the initial schema. Take a look!",
    timestamp: NOW - 600000,
  },
  {
    id: "msg2",
    sender: "Stephen",
    content: "@Alex looks good! Let me refactor the auth middleware.",
    timestamp: NOW - 300000,
    mentions: ["Alex"],
  },
  {
    id: "msg3",
    sender: "Maya",
    content: "I'll handle the UI components for the login flow.",
    timestamp: NOW - 120000,
  },
];

const HARDCODED_USER: UserProfile = { username: "Stephen" };

export function useSessions() {
  const sessions = HARDCODED_SESSIONS;

  const createSession = (_name?: string) => sessions[0];
  const deleteSession = (_id?: string) => {};
  const renameSession = (_id?: string, _name?: string) => {};

  return { sessions, createSession, deleteSession, renameSession };
}

export function useUser() {
  return HARDCODED_USER;
}

export function useChatMessages() {
  return HARDCODED_CHAT;
}
