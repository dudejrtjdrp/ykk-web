"use client";

// 재현성 원형 게이지 + 카운트업 (기획서 4.3.3)
// 내부 숫자/라벨은 size 에 비례해 스케일 → 링과 절대 겹치지 않게.
import { useEffect, useState } from "react";
import { scoreColor } from "@/lib/format";

export function ReproGauge({ score, size = 148 }: { score: number; size?: number }) {
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

  // 링 두께·반지름은 size 비례. 안쪽 여백(clear) 안에 숫자가 들어가도록 폰트도 비례.
  const stroke = Math.max(8, Math.round(size * 0.085));
  const r = (size - stroke) / 2 - 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - val / 100);
  const color = scoreColor(score);

  // 링 안쪽 지름의 약 0.42 배로 숫자 폭을 잡아 겹침 방지
  const numSize = Math.round((r - stroke) * 0.62);
  const labelSize = Math.max(8, Math.round(size * 0.072));

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
      <div className="absolute text-center leading-none">
        <div
          className="display-font font-black leading-none tabular-nums"
          style={{ color, fontSize: numSize }}
        >
          {val}%
        </div>
        <div
          className="mono-font font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]"
          style={{ fontSize: labelSize, marginTop: Math.round(size * 0.035) }}
        >
          재현성
        </div>
      </div>
    </div>
  );
}
