"use client";

// 버전 히스토리 타임라인 (기획서 4.3.4)
import { useState } from "react";
import type { VersionEntry } from "@/lib/types";

export function VersionTimeline({ history }: { history: VersionEntry[] }) {
  const [active, setActive] = useState(history.length - 1);
  const entry = history[active];

  return (
    <div className="sticker p-4">
      <p className="mono-font text-[0.62rem] uppercase tracking-[0.2em] text-black/55">version history</p>

      <div className="relative mt-4 flex items-center justify-between">
        <div className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 bg-black/20" />
        {history.map((v, i) => (
          <button
            key={v.tag}
            type="button"
            onClick={() => setActive(i)}
            className="relative z-10 flex flex-col items-center gap-1"
            aria-label={`${v.tag} (${v.date})`}
          >
            <span
              className="grid size-5 place-items-center rounded-full border-2 border-black transition-transform"
              style={{ background: i === active ? "var(--verm)" : "var(--paper)", transform: i === active ? "scale(1.25)" : "scale(1)" }}
            />
            <span className="mono-font text-[0.6rem] font-bold">{v.tag}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-xl border-2 border-black bg-[var(--paper-2)] p-3">
        <div className="flex items-center justify-between">
          <span className="mono-font text-sm font-bold">{entry.tag}</span>
          <span className="mono-font text-[0.7rem] text-black/55">{entry.date}</span>
        </div>
        <p className="mt-1 text-sm leading-6 text-black/75">{entry.note}</p>
      </div>
    </div>
  );
}
