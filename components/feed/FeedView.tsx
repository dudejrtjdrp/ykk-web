"use client";

// 큐레이션 피드 — 모바일 기본 + 데스크톱 접근성/정밀탐색 대체뷰 (기획서 2.9 / 6.4 / 9.1)
import { useMemo, useState } from "react";
import Link from "next/link";
import { canvasNodes, categories } from "@/lib/mock-data";
import type { Category, CanvasNode } from "@/lib/types";
import { useSaved } from "@/lib/store";
import { useRecipeModal } from "@/components/recipe/RecipeModalProvider";
import { compact, krw, scoreColor } from "@/lib/format";
import { getShape } from "@/lib/canvas/shapes";
import { CutShape } from "@/components/canvas/CutShape";
import { StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { Magnetic } from "@/components/ui/Magnetic";

// 피드 타일 — 텍스트 없는 컷아웃 실루엣 + 형태 '바깥'의 라벨. 탭하면 상세 모달.
function ShapeTile({ node, onOpen }: { node: CanvasNode; onOpen: () => void }) {
  const s = getShape(node.shape);
  const baseH = 104;
  let boxW: number;
  let boxH: number;
  if (s.aspect >= 1) {
    boxW = Math.min(152, baseH * s.aspect);
    boxH = boxW / s.aspect;
  } else {
    boxH = baseH;
    boxW = baseH * s.aspect;
  }
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`${node.title} · ${krw(node.priceKrw)} · 재현성 ${node.reproducibility}%`}
      className="focus-ring group flex w-full flex-col items-center gap-2.5 rounded-2xl p-2"
    >
      <span className="grid h-[124px] w-full place-items-center">
        <span
          className="cut-sticker block"
          style={{ width: boxW, height: boxH, transform: `rotate(${node.rotation}deg) scale(var(--hs, 1))` }}
        >
          <CutShape shape={node.shape} color={node.color} image={node.image} />
        </span>
      </span>
      <span className="w-full text-center">
        <span className="display-font line-clamp-1 block text-sm font-black leading-tight text-black">
          {node.title}
        </span>
        <span className="mono-font mt-0.5 flex items-center justify-center gap-1.5 text-[0.62rem] text-black/55">
          <span>{krw(node.priceKrw)}</span>
          <span aria-hidden>·</span>
          <span style={{ color: scoreColor(node.reproducibility) }}>{node.reproducibility}%</span>
        </span>
      </span>
    </button>
  );
}

export function FeedView({ onRequestCanvas }: { onRequestCanvas?: () => void }) {
  const saved = useSaved();
  const { openRecipe } = useRecipeModal();
  const [cat, setCat] = useState<Category | "전체">("전체");
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    return canvasNodes.filter((n) => {
      const okCat = cat === "전체" || n.category === cat;
      const okQ =
        !query ||
        [n.title, n.creatorName, n.category, n.model].join(" ").toLowerCase().includes(query);
      return okCat && okQ;
    });
  }, [cat, q]);

  return (
    <main className="blueprint-bg min-h-dvh">
      <header className="sticky top-0 z-30 border-b-2 border-black bg-[var(--canvas)]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
          <Link href="/" aria-label="ykk 홈" className="flex items-center">
            <img src="/logo.png" alt="ykk" width={36} height={36} draggable={false} className="block size-9 select-none" />
          </Link>
          <div className="order-3 w-full sm:order-2 sm:flex-1">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="레시피·크리에이터·모델 검색"
              className="focus-ring w-full rounded-full border-2 border-black bg-[var(--paper)] px-4 py-2 text-sm outline-none"
              aria-label="레시피 검색"
            />
          </div>
          <nav className="order-2 ml-auto flex items-center gap-2 sm:order-3">
            {onRequestCanvas && (
              <Magnetic>
                <button
                  type="button"
                  onClick={onRequestCanvas}
                  className="btn-glow rounded-full border-2 border-black bg-[#111] px-3 py-2 text-sm font-semibold text-white"
                >
                  ⤢ 탐험 모드
                </button>
              </Magnetic>
            )}
            <Link href="/library" className="relative rounded-full border-2 border-black bg-[var(--paper)] px-3 py-2 text-sm font-semibold">
              작업실
              {saved.hydrated && saved.count > 0 && (
                <span className="absolute -right-1.5 -top-1.5 grid min-w-5 place-items-center rounded-full border-2 border-black bg-[var(--verm)] px-1 text-[0.6rem] font-bold text-white">
                  {compact(saved.count)}
                </span>
              )}
            </Link>
            <Link href="/upload" className="hidden rounded-full border-2 border-black bg-[var(--paper)] px-3 py-2 text-sm font-semibold sm:block">
              업로드
            </Link>
          </nav>
        </div>

        <div className="no-scrollbar mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 pb-3">
          {(["전체", ...categories] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c as Category | "전체")}
              className="shrink-0 rounded-full border-2 border-black px-3 py-1.5 text-sm font-semibold transition-transform hover:-translate-y-0.5"
              style={cat === c ? { background: "#1a1a18", color: "#fff" } : { background: "var(--paper)" }}
            >
              {c}
            </button>
          ))}
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6">
        <p className="mb-4 text-sm text-black/55">
          <span className="mono-font font-bold text-black">{list.length}</span> 개의 레시피
        </p>
        {list.length === 0 ? (
          <div className="sticker grid place-items-center p-12 text-center">
            <p className="display-font text-2xl font-black">근처에 없네요</p>
            <p className="mt-2 text-sm text-black/60">정확히는 없지만, 다른 곳은 어때요? 필터를 바꿔보세요.</p>
          </div>
        ) : (
          <StaggerGroup
            key={cat}
            gap={0.03}
            amount="some"
            className="grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
          >
            {list.map((node) => (
              <StaggerItem key={node.id}>
                <ShapeTile node={node} onOpen={() => openRecipe(node.slug)} />
              </StaggerItem>
            ))}
          </StaggerGroup>
        )}
      </div>
    </main>
  );
}
