"use client";

import { useEffect, useRef } from "react";
import type { CanvasEngine } from "@/lib/canvas/use-canvas-engine";

export function ZoomControls({ engine }: { engine: CanvasEngine }) {
  const labelRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    return engine.subscribe((cam) => {
      if (labelRef.current) labelRef.current.textContent = `${Math.round(cam.zoom * 100)}%`;
    });
  }, [engine]);

  const Btn = ({ label, aria, onClick }: { label: string; aria: string; onClick: () => void }) => (
    <button
      type="button"
      aria-label={aria}
      onClick={onClick}
      className="focus-ring grid size-9 place-items-center rounded-full border-2 border-black bg-white text-lg font-bold leading-none transition-transform hover:-translate-y-0.5"
    >
      {label}
    </button>
  );

  return (
    <div className="sticker-sm flex items-center gap-1.5 px-2 py-1.5">
      <Btn label="−" aria="축소" onClick={() => engine.zoomByButton(0.8)} />
      <span ref={labelRef} className="mono-font w-12 text-center text-xs font-bold text-black/70">
        85%
      </span>
      <Btn label="+" aria="확대" onClick={() => engine.zoomByButton(1.25)} />
      <button
        type="button"
        aria-label="전체 보기"
        onClick={engine.fit}
        className="focus-ring ml-1 grid size-9 place-items-center rounded-full border-2 border-black bg-[#ffd54d] text-sm font-bold transition-transform hover:-translate-y-0.5"
        title="전체 지형 보기 (F)"
      >
        ⤢
      </button>
    </div>
  );
}
