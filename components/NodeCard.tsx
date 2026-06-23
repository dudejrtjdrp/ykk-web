"use client";

// 피드/라이브러리/작업실 공용 카드 — 표면 UI 의 "살아있는" 카드
//  · 포인터 위치로 아주 약한 3D 기울기(±6°) + hover 시 떠오름 + 그림자 성장
//  · 내부 텍스트는 미세 패럴랙스로 깊이감
//  · 저장 별은 스프링 pop. 모두 transform 중심(GPU), reduced-motion 자동 차단
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import type { CanvasNode } from "@/lib/types";
import { krw, modelCost, scoreColor, typeLabel } from "@/lib/format";
import { useSaved } from "@/lib/store";
import { spring, springOpts } from "@/lib/motion";

export function NodeCard({ node }: { node: CanvasNode }) {
  const saved = useSaved();
  const isSaved = saved.isSaved(node.slug);
  const cost = modelCost(node.model);

  // -0.5..0.5 정규화된 포인터 위치
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [6, -6]), springOpts.soft);
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-6, 6]), springOpts.soft);
  // 내부 패럴랙스(깊이)
  const dx = useSpring(useTransform(px, [-0.5, 0.5], [-6, 6]), springOpts.soft);
  const dy = useSpring(useTransform(py, [-0.5, 0.5], [-4, 4]), springOpts.soft);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    px.set(0);
    py.set(0);
  };

  return (
    <motion.div
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{ rotateX, rotateY, transformPerspective: 900, transformStyle: "preserve-3d" }}
      whileHover={{
        y: -6,
        boxShadow: "5px 5px 0 0 var(--ink), 0 22px 40px -22px rgba(20,20,18,0.4)",
      }}
      transition={spring.soft}
      className="sticker group relative flex break-inside-avoid flex-col overflow-hidden will-change-transform"
    >
      <div className="h-2 w-full" style={{ background: node.color }} />
      <Link href={`/recipe/${node.slug}`} className="focus-ring block p-4">
        <motion.div style={{ x: dx, y: dy }}>
          <div className="flex items-center justify-between gap-2">
            <span className="mono-font rounded-full border-2 border-black bg-[var(--paper-2)] px-2 py-0.5 text-[0.55rem] font-bold uppercase tracking-[0.14em]">
              {typeLabel[node.type]}
            </span>
            <span className="mono-font text-[0.62rem] font-bold text-black/55">{node.category}</span>
          </div>
          <h3 className="mt-2 display-font text-xl font-black leading-tight text-black">{node.title}</h3>
          <p className="mt-1 text-xs text-black/60">{node.creatorName} · {node.model}</p>
        </motion.div>

        <div className="mt-3 flex items-center gap-2">
          <div className="h-2 flex-1 overflow-hidden rounded-full border-2 border-black bg-white">
            <div className="h-full" style={{ width: `${node.reproducibility}%`, background: scoreColor(node.reproducibility) }} />
          </div>
          <span className="mono-font text-[0.65rem] font-bold" style={{ color: scoreColor(node.reproducibility) }}>
            {node.reproducibility}%
          </span>
        </div>
      </Link>

      <div className="flex items-center justify-between border-t-2 border-black px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="mono-font text-sm font-bold">{krw(node.priceKrw)}</span>
          <span
            title={cost.note}
            className="inline-flex shrink-0 items-center gap-1 rounded-full border-2 border-black px-1.5 py-0.5 text-[0.55rem] font-bold"
            style={{ background: cost.free ? "var(--mint)" : "var(--paper-2)" }}
          >
            <span className="size-1.5 rounded-full" style={{ background: cost.free ? "var(--green)" : "var(--amber)" }} aria-hidden />
            {cost.free ? "무료 실행" : "유료 실행"}
          </span>
        </div>
        <motion.button
          type="button"
          aria-label={isSaved ? "저장 취소" : "작업실에 저장"}
          aria-pressed={isSaved}
          onClick={() => saved.toggle(node.slug)}
          whileTap={{ scale: 0.82 }}
          className="focus-ring grid size-8 place-items-center rounded-full border-2 border-black bg-white text-base"
          style={{ color: isSaved ? "var(--verm)" : "#1a1a18" }}
        >
          <motion.span
            key={isSaved ? "on" : "off"}
            initial={{ scale: 0.4, rotate: -25 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={spring.snappy}
            className="leading-none"
          >
            {isSaved ? "★" : "☆"}
          </motion.span>
        </motion.button>
      </div>
    </motion.div>
  );
}
