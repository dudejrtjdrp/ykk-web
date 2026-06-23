"use client";

// Before/After 재현 비교 — 드래그 분할 (기획서 4.3.1)
import { useEffect, useRef, useState } from "react";

export function CompareSlider({ before, after }: { before: string; after: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [ratio, setRatio] = useState(0.5);
  const draggingRef = useRef(false);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!draggingRef.current || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const r = (e.clientX - rect.left) / rect.width;
      setRatio(Math.min(0.82, Math.max(0.18, r)));
    };
    const onUp = () => (draggingRef.current = false);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  return (
    <div ref={ref} className="relative flex h-full min-h-[200px] w-full select-none overflow-hidden rounded-2xl border-2 border-black">
      {/* before */}
      <div className="overflow-auto bg-[var(--paper-2)] p-4" style={{ width: `${ratio * 100}%` }}>
        <span className="mono-font rounded-full border-2 border-black bg-white px-2 py-0.5 text-[0.55rem] font-bold uppercase tracking-[0.14em]">
          Before · 제작자 결과
        </span>
        <p className="mt-3 text-sm leading-6 text-black/80">{before}</p>
      </div>
      {/* after */}
      <div className="flex-1 overflow-auto bg-[var(--paper)] p-4">
        <span className="mono-font rounded-full border-2 border-black px-2 py-0.5 text-[0.55rem] font-bold uppercase tracking-[0.14em]" style={{ background: "var(--mint)" }}>
          After · 동일 환경 재실행
        </span>
        <p className="mt-3 text-sm leading-6 text-black/80">{after}</p>
      </div>
      {/* handle */}
      <div
        role="separator"
        aria-label="비교 슬라이더"
        aria-valuenow={Math.round(ratio * 100)}
        onPointerDown={() => (draggingRef.current = true)}
        className="absolute top-0 z-10 flex h-full w-6 -translate-x-1/2 cursor-ew-resize items-center justify-center"
        style={{ left: `${ratio * 100}%` }}
      >
        <div className="h-full w-0.5 bg-black" />
        <div className="absolute grid size-9 place-items-center rounded-full border-2 border-black bg-white text-xs shadow-[var(--shadow-hard-sm)]">⇆</div>
      </div>
    </div>
  );
}
