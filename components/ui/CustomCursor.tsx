"use client";

// 커스텀 커서 — "마시멜로" 물성
// 설계 원칙
//  · Framer Motion 이 아닌 단일 rAF 루프로 직접 구동(60fps, GC 최소)
//  · 두 겹: 말랑한 종이 블롭(느리게 따라옴) + 잉크 점(빠르게 따라옴)
//  · 속도에 따라 진행 방향으로 살짝 늘어남(squash & stretch) → 젤리 같은 관성
//  · 색/모서리 변화는 CSS transition 에 위임(transform 만 JS 로) → 부드럽고 가벼움
//  · 터치/coarse 포인터 또는 prefers-reduced-motion 이면 비활성(네이티브 커서 유지)
import { useEffect, useRef } from "react";

type Mode = "default" | "hover" | "text" | "grab" | "grabbing";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function resolveMode(el: Element | null): Mode {
  if (!el) return "default";
  if (el.closest('input,textarea,[contenteditable="true"]')) return "text";
  // 캔버스 스티커(button)도 여기서 잡혀 hover 로 확대됨 → 의도된 동작
  if (el.closest('a,button,[role="button"],label,select,summary,[data-cursor="hover"]')) return "hover";
  const stage = el.closest<HTMLElement>(".canvas-stage");
  if (stage) return stage.getAttribute("data-panning") === "true" ? "grabbing" : "grab";
  return "default";
}

// 모드별 블롭 크기 배율(목표값 — 실제론 lerp 로 부드럽게 수렴)
const MODE_SCALE: Record<Mode, number> = {
  default: 1,
  hover: 1.55,
  text: 0.7,
  grab: 1.18,
  grabbing: 0.86,
};

export function CustomCursor() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const blobRef = useRef<HTMLDivElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return; // 모바일/접근성: 네이티브 커서 유지

    const root = rootRef.current;
    const blob = blobRef.current;
    const dot = dotRef.current;
    if (!root || !blob || !dot) return;

    document.body.classList.add("has-custom-cursor");

    // 위치 상태
    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let bx = tx;
    let by = ty;
    let dx = tx;
    let dy = ty;
    let pbx = bx; // 이전 블롭 위치(속도 계산)
    let pby = by;
    let scale = 1; // 현재 모드 배율(수렴값)
    let pressed = 0; // 0..1 누름 정도
    let visible = 0; // 0..1 페이드
    let mode: Mode = "default";
    let pressTarget = 0;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      visible = 1;
      const next = resolveMode(e.target as Element);
      if (next !== mode) {
        mode = next;
        root.dataset.mode = mode;
      }
    };
    const onDown = () => {
      pressTarget = 1;
      // 캔버스 패닝 시작 시 grab→grabbing 전환을 즉시 반영
      const m = resolveMode(document.elementFromPoint(tx, ty));
      if (m !== mode) {
        mode = m;
        root.dataset.mode = mode;
      }
    };
    const onUp = () => {
      pressTarget = 0;
    };
    const onLeave = () => {
      visible = 0;
    };
    const onEnter = () => {
      visible = 1;
    };

    const tick = () => {
      // 위치: 블롭은 느슨하게(관성), 점은 또렷하게
      bx = lerp(bx, tx, 0.18);
      by = lerp(by, ty, 0.18);
      dx = lerp(dx, tx, 0.38);
      dy = lerp(dy, ty, 0.38);

      // 속도 → squash & stretch
      const vx = bx - pbx;
      const vy = by - pby;
      pbx = bx;
      pby = by;
      const speed = Math.min(Math.hypot(vx, vy), 60);
      const stretch = Math.min(speed / 110, 0.32); // 최대 32% 늘어남
      const angle = speed > 0.4 ? (Math.atan2(vy, vx) * 180) / Math.PI : 0;

      // 모드 배율/누름/가시성 수렴
      scale = lerp(scale, MODE_SCALE[mode], 0.2);
      pressed = lerp(pressed, pressTarget, 0.3);
      visible = lerp(visible, visible > 0.5 ? 1 : 0, 1); // 즉시성 유지용 noop
      root.style.opacity = String(visible);

      const pressScale = 1 - pressed * 0.26; // 누르면 말랑 압축
      const sx = scale * pressScale * (1 + stretch);
      const sy = scale * pressScale * (1 - stretch * 0.72);

      blob.style.transform =
        `translate3d(${bx}px, ${by}px, 0) translate(-50%, -50%) rotate(${angle}deg) scale(${sx}, ${sy})`;
      dot.style.transform =
        `translate3d(${dx}px, ${dy}px, 0) translate(-50%, -50%) scale(${1 - pressed * 0.4})`;

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerenter", onEnter);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerenter", onEnter);
      document.body.classList.remove("has-custom-cursor");
    };
  }, []);

  return (
    <div ref={rootRef} className="cursor-root" data-mode="default" aria-hidden style={{ opacity: 0 }}>
      <div ref={blobRef} className="cursor-blob" />
      <div ref={dotRef} className="cursor-dot" />
    </div>
  );
}
