"use client";

// 캔버스 노드 = 텍스트 없는 종이 컷아웃 실루엣 (기획서 2장 · 레퍼런스: 마티스 컷아웃)
// 클릭 → 상세 모달. hover(가까이서) → 미리보기 툴팁. 정보는 카드 밖에서만.
import { memo } from "react";
import type { CanvasNode } from "@/lib/types";
import { typeLabel } from "@/lib/format";
import { CutShape } from "./CutShape";

export type Tier = "far" | "mid" | "near";

interface Props {
  node: CanvasNode;
  tier: Tier;
  /** 검색 이동·선택된 카드 — 노란 외곽선 포커스 */
  focused?: boolean;
  onOpen: (node: CanvasNode) => void;
  onHoverStart: (node: CanvasNode, rect: DOMRect) => void;
  onHoverEnd: () => void;
}

function StickerNodeBase({ node, tier, focused, onOpen, onHoverStart, onHoverEnd }: Props) {
  const handleEnter = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (tier === "far") return;
    onHoverStart(node, e.currentTarget.getBoundingClientRect());
  };

  return (
    <button
      type="button"
      aria-label={`${node.title} · ${typeLabel[node.type]} · 재현성 ${node.reproducibility}%`}
      aria-current={focused ? "true" : undefined}
      onClick={() => onOpen(node)}
      onPointerEnter={handleEnter}
      onPointerLeave={onHoverEnd}
      className={`cut-sticker focus-ring group absolute left-0 top-0 select-none border-0 bg-transparent p-0 hover:z-20${
        focused ? " is-focused" : ""
      }`}
      style={{
        width: node.w,
        height: node.h,
        transform: `translate(${node.x}px, ${node.y}px) translate(-50%, -50%) rotate(${node.rotation}deg) scale(var(--hs, 1))`,
      }}
    >
      <CutShape shape={node.shape} color={node.color} image={node.image} />
    </button>
  );
}

export const StickerNode = memo(StickerNodeBase);
