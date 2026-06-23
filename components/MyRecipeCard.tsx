"use client";

// 내가 올린(게시한) 레시피 카드 — 작업실 전용.
// 갓 올린 레시피는 "검토 중" → 검토 후 캔버스에 스티커로 안착(live).
import { motion } from "framer-motion";
import type { MyRecipe } from "@/lib/types";
import { krw, scoreColor, typeLabel } from "@/lib/format";
import { useSaved } from "@/lib/store";
import { spring } from "@/lib/motion";

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

export function MyRecipeCard({ recipe }: { recipe: MyRecipe }) {
  const saved = useSaved();
  const review = recipe.status === "review";

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: "5px 5px 0 0 var(--ink), 0 22px 40px -22px rgba(20,20,18,0.4)" }}
      transition={spring.soft}
      className="sticker group relative flex break-inside-avoid flex-col overflow-hidden will-change-transform"
    >
      <div className="h-2 w-full" style={{ background: recipe.color }} />
      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="mono-font rounded-full border-2 border-black bg-[var(--paper-2)] px-2 py-0.5 text-[0.55rem] font-bold uppercase tracking-[0.14em]">
            {typeLabel[recipe.type]}
          </span>
          {/* 상태 배지 */}
          <span
            className="inline-flex items-center gap-1 rounded-full border-2 border-black px-2 py-0.5 text-[0.55rem] font-bold"
            style={{ background: review ? "var(--sun)" : "var(--mint)" }}
          >
            <span
              className="size-1.5 rounded-full"
              style={{ background: review ? "var(--amber)" : "var(--green)" }}
              aria-hidden
            />
            {review ? "검토 중" : "게시됨"}
          </span>
        </div>

        <h3 className="mt-2 display-font text-xl font-black leading-tight text-black">{recipe.title}</h3>
        <p className="mt-1 text-xs text-black/60">
          {recipe.category} · {recipe.model}
          {recipe.createdAt && <span className="text-black/40"> · {fmtDate(recipe.createdAt)} 등록</span>}
        </p>
        {recipe.summary && <p className="mt-2 line-clamp-2 text-xs leading-5 text-black/60">{recipe.summary}</p>}

        <div className="mt-3 flex items-center gap-2">
          <div className="h-2 flex-1 overflow-hidden rounded-full border-2 border-black bg-white">
            <div className="h-full" style={{ width: `${recipe.reproducibility}%`, background: scoreColor(recipe.reproducibility) }} />
          </div>
          <span className="mono-font text-[0.65rem] font-bold" style={{ color: scoreColor(recipe.reproducibility) }}>
            {recipe.reproducibility}%
          </span>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between border-t-2 border-black px-4 py-2.5">
        <span className="mono-font text-sm font-bold">{krw(recipe.priceKrw)}</span>
        <button
          type="button"
          onClick={() => saved.unpublishRecipe(recipe.slug)}
          className="focus-ring rounded-full border-2 border-black bg-white px-3 py-1 text-xs font-semibold text-black/70 transition-colors hover:bg-[var(--paper-2)] hover:text-black"
        >
          게시 취소
        </button>
      </div>

      {review && (
        <div className="border-t-2 border-dashed border-black/30 bg-[var(--paper-2)] px-4 py-2 text-[0.7rem] leading-5 text-black/55">
          재현성 검증을 마쳤어요. 검토 후 캔버스에 스티커로 안착합니다.
        </div>
      )}
    </motion.div>
  );
}
