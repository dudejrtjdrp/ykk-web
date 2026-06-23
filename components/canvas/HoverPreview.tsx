"use client";

// 스티커 hover 시 화면 좌표에 뜨는 확대 미리보기 (기획서 2.5)
import { motion } from "framer-motion";
import type { CanvasNode } from "@/lib/types";
import { krw, scoreColor, typeLabel } from "@/lib/format";
import { spring } from "@/lib/motion";

export interface HoverState {
  node: CanvasNode;
  x: number; // screen px (stage 기준) — 카드 중심
  topY: number; // 카드 상단 y (stage 기준)
  bottomY: number; // 카드 하단 y (stage 기준)
  placement: "above" | "below"; // 위 공간이 부족하면 카드 아래로 띄움
}

export function HoverPreview({
  hover,
  saved,
  onOpen,
  onToggleSave,
  onPointerEnter,
  onPointerLeave,
}: {
  hover: HoverState;
  saved: boolean;
  onOpen: (node: CanvasNode) => void;
  onToggleSave: (slug: string) => void;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
}) {
  const { node, x, topY, bottomY, placement } = hover;
  const width = 280;
  const GAP = 12; // 카드와 미리보기 사이 간격(px)
  const isBelow = placement === "below";
  return (
    <div
      className="pointer-events-auto absolute z-40"
      style={{
        left: Math.max(12, x),
        top: isBelow ? bottomY + GAP : topY - GAP,
        width,
        transform: isBelow ? "translate(-50%, 0)" : "translate(-50%, -100%)",
      }}
      role="dialog"
      aria-label={`${node.title} 미리보기`}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: isBelow ? -6 : 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={spring.snappy}
        style={{ transformOrigin: isBelow ? "50% 0%" : "50% 100%" }}
      >
      <div
        className="sticker cursor-pointer overflow-hidden transition-transform hover:-translate-y-0.5"
        role="button"
        tabIndex={0}
        aria-label={`${node.title} 상세 열기`}
        onClick={() => onOpen(node)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpen(node);
          }
        }}
      >
        <div
          className="h-24 w-full border-b-2 border-black bg-cover bg-center"
          style={{ backgroundColor: node.color, backgroundImage: `url(${node.image})` }}
        >
          <div className="flex items-center justify-between p-3">
            <span className="mono-font rounded-full border-2 border-black bg-white/85 px-2 py-0.5 text-[0.55rem] font-bold uppercase tracking-[0.14em]">
              {typeLabel[node.type]}
            </span>
            <span className="mono-font rounded-full border-2 border-black bg-white px-2 py-0.5 text-[0.62rem] font-bold">
              {krw(node.priceKrw)}
            </span>
          </div>
        </div>

        <div className="space-y-3 p-3.5">
          <h3 className="display-font text-xl font-black leading-tight text-black">{node.title}</h3>

          <div className="flex items-center gap-2 text-[0.72rem] text-black/70">
            <span className="font-semibold">{node.creatorName}</span>
            <span aria-hidden>·</span>
            <span className="mono-font">{node.model}</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full border-2 border-black bg-white">
              <div
                className="h-full"
                style={{ width: `${node.reproducibility}%`, background: scoreColor(node.reproducibility) }}
              />
            </div>
            <span className="mono-font text-xs font-bold" style={{ color: scoreColor(node.reproducibility) }}>
              {node.reproducibility}%
            </span>
          </div>

          <div className="grid grid-cols-[1fr_auto] gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpen(node);
              }}
              className="rounded-full border-2 border-black bg-[#111] px-3 py-2 text-sm font-semibold text-white"
            >
              상세 보기
            </button>
            <button
              type="button"
              aria-label={saved ? "저장 취소" : "작업실에 저장"}
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave(node.slug);
              }}
              className="grid size-9 place-items-center rounded-full border-2 border-black bg-white text-base"
              style={{ color: saved ? "var(--verm)" : "#1a1a18" }}
            >
              {saved ? "★" : "☆"}
            </button>
          </div>
        </div>
      </div>
      </motion.div>
    </div>
  );
}
