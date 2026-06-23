"use client";

// 환경 정보 카드 (기획서 4.3.2) — 모노 표기 + 복사 + 모델·비용 표시(솔루션 ②)
import { useState } from "react";
import type { EnvSpec } from "@/lib/types";
import { modelCost } from "@/lib/format";

export function EnvCard({ env }: { env: EnvSpec }) {
  const [copied, setCopied] = useState<string | null>(null);
  const cost = modelCost(env.model);

  const rows: Array<[string, string]> = [
    ["Model", env.model],
    ["Version", env.version],
    ["Temperature", String(env.temperature)],
    ["Max Tokens", env.maxTokens ? String(env.maxTokens) : "—"],
    ["Language", env.language],
  ];

  const copy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 1200);
    } catch {
      /* clipboard unavailable */
    }
  };

  const copyAll = () =>
    copy("__all", rows.map(([k, v]) => `${k}: ${v}`).join("\n"));

  return (
    <div className="sticker p-4">
      <div className="flex items-center justify-between">
        <p className="mono-font text-[0.7rem] font-bold uppercase tracking-[0.16em] text-[var(--ink)]">environment</p>
        <button type="button" onClick={copyAll} className="mono-font rounded-full border-2 border-black bg-[var(--paper-2)] px-2.5 py-1 text-[0.66rem] font-bold">
          {copied === "__all" ? "복사됨 ✓" : "전체 복사"}
        </button>
      </div>

      {/* 모델·비용 표시 — 어떤 모델로 검증됐는지 / 실행 비용 / 무료 가능 여부 */}
      <div
        className="mt-3 flex items-center gap-2 rounded-xl border-2 border-black p-2.5"
        style={{ background: cost.free ? "var(--mint)" : "var(--paper-2)" }}
      >
        <span className="grid size-7 shrink-0 place-items-center rounded-full border-2 border-black bg-white text-sm" aria-hidden>
          {cost.free ? "○" : "₩"}
        </span>
        <div className="min-w-0">
          <p className="text-[0.8rem] font-bold leading-tight">
            {cost.label}
            <span className="mono-font ml-1.5 font-semibold text-black/55">{cost.perRun}</span>
          </p>
          <p className="text-[0.7rem] leading-snug text-black/60">{cost.note}</p>
        </div>
      </div>

      <dl className="mt-2 grid grid-cols-2 gap-2">
        {rows.map(([k, v]) => (
          <button
            key={k}
            type="button"
            onClick={() => copy(k, v)}
            title="클릭하면 복사"
            className="focus-ring rounded-xl border-2 border-black bg-[var(--paper-2)] p-2.5 text-left transition-transform hover:-translate-y-0.5"
          >
            <dt className="mono-font text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-soft)]">{k}</dt>
            <dd className="mono-font mt-0.5 truncate text-sm font-bold text-[var(--ink)]">{copied === k ? "복사됨 ✓" : v}</dd>
          </button>
        ))}
      </dl>
      <button type="button" className="mt-3 w-full rounded-full border-2 border-black bg-[var(--cobalt)] px-4 py-2 text-sm font-semibold text-white">
        내 환경에 적용
      </button>
    </div>
  );
}
