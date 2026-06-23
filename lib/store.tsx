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
import type { MyRecipe } from "@/lib/types";

const STORAGE_KEY = "ykk.saved.v1";
const PURCHASED_KEY = "ykk.purchased.v1";
const MINE_KEY = "ykk.mine.v1";

interface SavedContextValue {
  saved: string[];
  isSaved: (slug: string) => boolean;
  toggle: (slug: string) => void;
  count: number;
  hydrated: boolean;
  // 구매 — AI 도움말(프롬프트 해부) 잠금 해제 기준
  purchased: string[];
  isPurchased: (slug: string) => boolean;
  purchase: (slug: string) => void;
  // 내가 올린(게시한) 레시피 — 작업실에 보관
  mine: MyRecipe[];
  publishRecipe: (recipe: MyRecipe) => void;
  unpublishRecipe: (slug: string) => void;
}

const SavedContext = createContext<SavedContextValue | null>(null);

export function SavedProvider({ children }: { children: React.ReactNode }) {
  const [saved, setSaved] = useState<string[]>([]);
  const [purchased, setPurchased] = useState<string[]>([]);
  const [mine, setMine] = useState<MyRecipe[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setSaved(JSON.parse(raw) as string[]);
      const rawP = window.localStorage.getItem(PURCHASED_KEY);
      if (rawP) setPurchased(JSON.parse(rawP) as string[]);
      const rawM = window.localStorage.getItem(MINE_KEY);
      if (rawM) setMine(JSON.parse(rawM) as MyRecipe[]);
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
      window.localStorage.setItem(PURCHASED_KEY, JSON.stringify(purchased));
      window.localStorage.setItem(MINE_KEY, JSON.stringify(mine));
    } catch {
      // ignore
    }
  }, [saved, purchased, mine, hydrated]);

  const toggle = useCallback((slug: string) => {
    setSaved((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [slug, ...prev],
    );
  }, []);

  const purchase = useCallback((slug: string) => {
    setPurchased((prev) => (prev.includes(slug) ? prev : [slug, ...prev]));
    // 구매하면 작업실(저장)에도 자동으로 담긴다
    setSaved((prev) => (prev.includes(slug) ? prev : [slug, ...prev]));
  }, []);

  const publishRecipe = useCallback((recipe: MyRecipe) => {
    setMine((prev) => [recipe, ...prev.filter((r) => r.slug !== recipe.slug)]);
  }, []);

  const unpublishRecipe = useCallback((slug: string) => {
    setMine((prev) => prev.filter((r) => r.slug !== slug));
  }, []);

  const value = useMemo<SavedContextValue>(
    () => ({
      saved,
      isSaved: (slug: string) => saved.includes(slug),
      toggle,
      count: saved.length,
      hydrated,
      purchased,
      isPurchased: (slug: string) => purchased.includes(slug),
      purchase,
      mine,
      publishRecipe,
      unpublishRecipe,
    }),
    [saved, toggle, hydrated, purchased, purchase, mine, publishRecipe, unpublishRecipe],
  );

  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>;
}

export function useSaved(): SavedContextValue {
  const ctx = useContext(SavedContext);
  if (!ctx) throw new Error("useSaved must be used within SavedProvider");
  return ctx;
}
