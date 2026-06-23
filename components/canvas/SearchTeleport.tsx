"use client";

// 검색 = 순간이동 입력기 (기획서 3.4). 결과를 리스트가 아니라 공간 이동으로.
import { useMemo, useRef, useState } from "react";
import type { CanvasEngine } from "@/lib/canvas/use-canvas-engine";
import type { CanvasNode } from "@/lib/types";
import { featuredNodes, searchCentroid, searchNodes } from "@/lib/api";
import { typeLabel } from "@/lib/format";

export function SearchTeleport({
  engine,
  inputRef,
  onTeleport,
}: {
  engine: CanvasEngine;
  inputRef: React.RefObject<HTMLInputElement | null>;
  /** 결과로 이동한 카드에 포커스를 주기 위한 콜백 */
  onTeleport?: (node: CanvasNode) => void;
}) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const trimmed = q.trim();
  // 입력 전(빈 검색어): 추천 레시피 목록을 띄운다. 입력 시: 검색 결과.
  const featured = useMemo(() => featuredNodes(8), []);
  const results = useMemo(
    () => (trimmed ? searchNodes(q, 8) : featured),
    [q, trimmed, featured],
  );
  const isDefault = !trimmed;

  const teleportTo = (node: CanvasNode) => {
    engine.focusNode(node);
    onTeleport?.(node);
    setOpen(false);
    setQ("");
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const c = searchCentroid(q);
    if (c) engine.flyTo({ x: c.x, y: c.y, zoom: 0.8 });
    setOpen(false);
  };

  return (
    <div className="relative w-[min(92vw,420px)]">
      <form onSubmit={onSubmit} className="sticker-sm flex items-center gap-2 px-3 py-2">
        <span aria-hidden className="text-black/55">⌕</span>
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            if (blurTimer.current) clearTimeout(blurTimer.current);
            setOpen(true);
          }}
          onClick={() => setOpen(true)}
          // 항목 클릭이 먼저 처리되도록 닫힘을 약간 지연
          onBlur={() => {
            blurTimer.current = setTimeout(() => setOpen(false), 120);
          }}
          placeholder="어디로 떠날까요?  예: 자소서, RAG, 제품샷"
          className="focus-ring w-full rounded-md border-0 bg-transparent text-sm outline-none placeholder:text-black/40"
          aria-label="검색해서 해당 위치로 이동"
        />
        {q && (
          <button type="button" aria-label="지우기" onClick={() => { setQ(""); }} className="text-black/45">
            ✕
          </button>
        )}
      </form>

      {open && (
        <div className="sticker-sm absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-80 overflow-auto p-1.5">
          <p className="mono-font px-2.5 pb-1 pt-1.5 text-[0.58rem] uppercase tracking-[0.16em] text-black/45">
            {isDefault ? "추천 레시피" : results.length > 0 ? `검색 결과 ${results.length}` : "검색 결과"}
          </p>
          {results.length === 0 ? (
            <p className="px-3 py-4 text-center text-sm text-black/50">
              “{trimmed}”에 대한 결과가 없어요.
            </p>
          ) : (
            <ul>
              {results.map((node) => (
                <li key={node.id}>
                  <button
                    type="button"
                    onClick={() => teleportTo(node)}
                    className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left hover:bg-[var(--paper-2)]"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{node.title}</span>
                      <span className="mono-font text-[0.6rem] uppercase tracking-wide text-black/50">
                        {typeLabel[node.type]} · {node.category} · 재현성 {node.reproducibility}%
                      </span>
                    </span>
                    <span className="mono-font shrink-0 text-[0.65rem] text-black/45">→ 이동</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
