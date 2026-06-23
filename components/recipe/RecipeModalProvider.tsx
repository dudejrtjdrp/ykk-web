"use client";

// 전역 레시피 상세 모달 — 캔버스/피드 어디서나 openRecipe(slug) 로 띄운다.
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { getCreator, getRecipe } from "@/lib/api";
import { RecipeModal } from "./RecipeModal";

interface RecipeModalCtx {
  openRecipe: (slug: string) => void;
  close: () => void;
}

const Ctx = createContext<RecipeModalCtx | null>(null);

export function RecipeModalProvider({ children }: { children: React.ReactNode }) {
  const [slug, setSlug] = useState<string | null>(null);

  const openRecipe = useCallback((s: string) => setSlug(s), []);
  const close = useCallback(() => setSlug(null), []);

  const value = useMemo<RecipeModalCtx>(() => ({ openRecipe, close }), [openRecipe, close]);

  const recipe = slug ? getRecipe(slug) : undefined;
  const creator = recipe ? getCreator(recipe.creatorId) : undefined;

  return (
    <Ctx.Provider value={value}>
      {children}
      <RecipeModal recipe={recipe} creator={creator} onClose={close} />
    </Ctx.Provider>
  );
}

export function useRecipeModal(): RecipeModalCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useRecipeModal must be used within RecipeModalProvider");
  return ctx;
}
