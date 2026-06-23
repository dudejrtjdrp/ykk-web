import type { RecipeType } from "@/lib/types";

export const krw = (n: number) =>
  n === 0 ? "무료" : "₩" + n.toLocaleString("ko-KR");

/** 재현성 점수 → 색 (기획서 4.3.3) */
export const scoreColor = (s: number) =>
  s >= 90 ? "var(--green)" : s >= 80 ? "var(--amber)" : "var(--verm)";

export const typeLabel: Record<RecipeType, string> = {
  prompt: "PROMPT",
  bundle: "BUNDLE",
  workflow: "WORKFLOW",
  creator: "CREATOR",
};

export const typeGlyph: Record<RecipeType, string> = {
  prompt: "❝",
  bundle: "▤",
  workflow: "⌥",
  creator: "◎",
};

export const compact = (n: number) =>
  n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1) + "k" : String(n);
