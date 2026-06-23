"use client";

// 검색 = 순간이동 입력기 (기획서 3.4). 결과를 리스트가 아니라 공간 이동으로.
import { useMemo, useState } from "react";
import type { CanvasEngine } from "@/lib/canvas/use-canvas-engine";
import type { CanvasNode } from "@/lib/types";
import { searchCentroid, searchNodes } from "@/lib/api";
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

  const results = useMemo(() => (q.trim() ? searchNodes(q, 7) : []), [q]);

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
          onFocus={() => setOpen(true)}
          placeholder="어디로 떠날까요?  예: 자소서, RAG, 제품샷"
          className="focus-ring w-full rounded-md border-0 bg-transparent text-sm outline-none placeholder:text-black/40"
          aria-label="검색해서 해당 위치로 이동"
        />
        {q && (
          <button type="button" aria-label="지우기" onClick={() => { setQ(""); setOpen(false); }} className="text-black/45">
            ✕
          </button>
        )}
      </form>

      {open && results.length > 0 && (
        <ul className="sticker-sm absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-72 overflow-auto p-1.5">
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
                    {typeLabel[node.type]} · {node.category}
                  </span>
                </span>
                <span className="mono-font shrink-0 text-[0.65rem] text-black/45">→ 이동</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
