"use client";

// 재현성 원형 게이지 + 카운트업 (기획서 4.3.3)
import { useEffect, useState } from "react";
import { scoreColor } from "@/lib/format";

export function ReproGauge({ score, size = 132 }: { score: number; size?: number }) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setVal(score);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const dur = 900;
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - t, 3);
      setVal(Math.round(score * e));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  const stroke = 12;
  const r = (size - stroke) / 2 - 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - val / 100);
  const color = scoreColor(score);

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e3ded3" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute text-center">
        <div className="display-font text-3xl font-black leading-none" style={{ color }}>
          {val}%
        </div>
        <div className="mono-font mt-1 text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]">재현성</div>
      </div>
    </div>
  );
}
