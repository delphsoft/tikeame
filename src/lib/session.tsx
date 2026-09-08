"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Role = "buyer" | "organizer" | "admin";

export type SessionUser = {
  id?: string;
  name: string;
  email: string;
  role: Role;
};

const KEY = "tikeame-session";

type SessionContextValue = {
  user: SessionUser | null;
  login: (user: SessionUser) => void;
  logout: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        const data = (await res.json()) as { user?: SessionUser | null };
        if (cancelled) return;
        if (data.user) {
          setUser(data.user);
          localStorage.setItem(KEY, JSON.stringify(data.user));
          return;
        }
      } catch {
        /* fall through to local cache */
      }
      if (cancelled) return;
      try {
        const raw = localStorage.getItem(KEY);
        if (raw) setUser(JSON.parse(raw) as SessionUser);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback((next: SessionUser) => {
    setUser(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(KEY);
    void fetch("/api/auth/logout", { method: "POST" });
  }, []);

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
