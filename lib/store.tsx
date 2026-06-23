"use client";

// 저장(내 작업실/라이브러리) 상태 — localStorage 영속, SSR 안전 가드
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "ykk.saved.v1";

interface SavedContextValue {
  saved: string[];
  isSaved: (slug: string) => boolean;
  toggle: (slug: string) => void;
  count: number;
  hydrated: boolean;
}

const SavedContext = createContext<SavedContextValue | null>(null);

export function SavedProvider({ children }: { children: React.ReactNode }) {
  const [saved, setSaved] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setSaved(JSON.parse(raw) as string[]);
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    } catch {
      // ignore
    }
  }, [saved, hydrated]);

  const toggle = useCallback((slug: string) => {
    setSaved((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [slug, ...prev],
    );
  }, []);

  const value = useMemo<SavedContextValue>(
    () => ({
      saved,
      isSaved: (slug: string) => saved.includes(slug),
      toggle,
      count: saved.length,
      hydrated,
    }),
    [saved, toggle, hydrated],
  );

  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>;
}

export function useSaved(): SavedContextValue {
  const ctx = useContext(SavedContext);
  if (!ctx) throw new Error("useSaved must be used within SavedProvider");
  return ctx;
}
