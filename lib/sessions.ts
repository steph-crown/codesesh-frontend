const SESSIONS_KEY = "codesesh_sessions";
const USER_KEY = "codesesh_user";

export type Session = {
  id: string;
  title: string;
  username: string;
  createdAt: number;
  updatedAt: number;
  isOwner: boolean;
  contributors: Contributor[];
};

export type Contributor = {
  username: string;
};

export type UserProfile = {
  username: string;
};

export function getSessions(): Session[] {
  if (globalThis.window === undefined) return [];
  const raw = localStorage.getItem(SESSIONS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Session[];
  } catch {
    return [];
  }
}

export function saveSessions(sessions: Session[]) {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export function createSession(username: string): Session {
  const sessions = getSessions();
  const session: Session = {
    id: crypto.randomUUID().slice(0, 8),
    title: `Session ${sessions.length + 1}`,
    username,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isOwner: true,
    contributors: [{ username }],
  };
  sessions.unshift(session);
  saveSessions(sessions);
  return session;
}

export function deleteSession(id: string) {
  const sessions = getSessions().filter((s) => s.id !== id);
  saveSessions(sessions);
}

export function renameSession(id: string, title: string) {
  const sessions = getSessions().map((s) =>
    s.id === id ? { ...s, title, updatedAt: Date.now() } : s,
  );
  saveSessions(sessions);
}

export function getUser(): UserProfile | null {
  if (globalThis.window === undefined) return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

export function saveUser(profile: UserProfile) {
  localStorage.setItem(USER_KEY, JSON.stringify(profile));
}

export function migrateLegacySessions() {
  const raw = localStorage.getItem(SESSIONS_KEY);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>[];
    if (parsed.length === 0) return;
    const first = parsed[0];
    if ("title" in first) return;

    const migrated: Session[] = parsed.map((old) => ({
      id: (old.id as string) || crypto.randomUUID().slice(0, 8),
      title: `Session`,
      username: (old.username as string) || "Unknown",
      createdAt: (old.createdAt as number) || Date.now(),
      updatedAt: (old.createdAt as number) || Date.now(),
      isOwner: true,
      contributors: [
        { username: (old.username as string) || "Unknown" },
      ],
    }));
    saveSessions(migrated);
  } catch {
    /* ignore corrupt data */
  }
}
