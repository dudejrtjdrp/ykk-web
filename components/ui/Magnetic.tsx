"use client";

// 마그네틱 래퍼 — 자식(버튼/링크)을 커서 쪽으로 부드럽게 끌어당기고,
// 내부 글로우 좌표(--mx/--my)를 갱신한다. (자식에 .btn-glow 를 함께 주면 빛이 따라옴)
//  · 이동은 useSpring(marsh) 로 말랑하게, 떠나면 0 으로 복귀
//  · 터치 포인터에서는 비활성 (끌림/글로우 없음)
import { motion, useSpring } from "framer-motion";
import type { ReactNode } from "react";
import { useRef } from "react";
import { springOpts } from "@/lib/motion";

export function Magnetic({
  children,
  className,
  strength = 0.32,
}: {
  children: ReactNode;
  className?: string;
  /** 0~1, 클수록 강하게 끌림 */
  strength?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const x = useSpring(0, springOpts.marsh);
  const y = useSpring(0, springOpts.marsh);

  const onMove = (e: React.PointerEvent<HTMLSpanElement>) => {
    if (e.pointerType === "touch") return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const mx = e.clientX - r.left;
    const my = e.clientY - r.top;
    el.style.setProperty("--mx", `${mx}px`);
    el.style.setProperty("--my", `${my}px`);
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.span
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      onPointerDown={reset}
      style={{ x, y, display: "inline-flex" }}
      className={className}
    >
      {children}
    </motion.span>
  );
}
