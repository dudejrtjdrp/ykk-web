"use client";

// AI 도움말 — 프롬프트 해부 (솔루션 ③ + 창작자 전환)
//  · 구매 후, 산 프롬프트를 문장 단위로 분석해 "어떤 부분이 어떤 효과를 내는지" 설명
//  · 결과만 받는 소비 → 다음엔 스스로 더 잘 쓰는 역량으로 전환
//  · 맨 아래 창작자 전환 CTA: 이해한 구조로 직접 만들어 팔기 (→ /upload)
import { useState } from "react";
import Link from "next/link";
import type { PromptSegment } from "@/lib/types";
import { Magnetic } from "@/components/ui/Magnetic";
import { StaggerGroup, StaggerItem } from "@/components/ui/Reveal";

export function PromptAnatomy({
  unlocked,
  promptBody,
  anatomy,
  slug,
}: {
  unlocked: boolean;
  promptBody?: string;
  anatomy?: PromptSegment[];
  slug: string;
}) {
  const [copied, setCopied] = useState(false);
  const segments = anatomy ?? [];
  // 잠금 티저: 역할 라벨 4개만 흐릿하게 노출 (없으면 '분석 항목'으로 패딩)
  const teaserLabels = Array.from({ length: 4 }, (_, i) => segments[i]?.label ?? "분석 항목");

  const copyPrompt = async () => {
    if (!promptBody) return;
    try {
      await navigator.clipboard.writeText(promptBody);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <section className="sticker overflow-hidden p-4">
      {/* 헤더 */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="mono-font text-[0.62rem] uppercase tracking-[0.2em] text-black/55">
          ai 도움말
        </span>
        <span
          className="pill inline-flex items-center gap-1 px-2.5 py-0.5 text-[0.7rem] font-bold"
          style={{ background: "var(--sun)" }}
        >
          학습 리포트
        </span>
        {unlocked && (
          <span className="ml-auto mono-font text-[0.66rem] text-black/45">{segments.length}개 분석</span>
        )}
      </div>
      <h2 className="mt-1 display-font text-2xl font-black">이 프롬프트가 왜 작동하는가</h2>
      <p className="mt-1 max-w-2xl text-sm leading-6 text-black/65">
        산 프롬프트를 AI가 문장 단위로 뜯어, 어떤 부분이 어떤 효과를 내는지 짚어줘요.
        결과만 받지 말고 — 다음엔 비슷한 프롬프트를 스스로 더 잘 쓰게.
      </p>

      {!unlocked ? (
        /* ── 구매 전: 잠금 티저 (역할 라벨만 흐릿하게 보여줌) ── */
        <div className="relative mt-3 rounded-xl border-2 border-dashed border-black/40 bg-[var(--paper-2)] p-4">
          <ul className="space-y-2" aria-hidden>
            {teaserLabels.map((label, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="mono-font text-[0.6rem] font-bold text-black/40">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="rounded-full border-2 border-black/30 bg-white/70 px-2 py-0.5 text-[0.7rem] font-bold text-black/55">
                  {label}
                </span>
                <span className="h-2.5 flex-1 rounded-full bg-black/10" />
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center gap-2 border-t-2 border-black/10 pt-3">
            <span className="grid size-7 place-items-center rounded-full border-2 border-black bg-white text-sm" aria-hidden>🔒</span>
            <p className="text-[0.8rem] font-semibold text-black/70">
              구매하면 문장별 해부와 프롬프트 전문이 열려요.
            </p>
          </div>
        </div>
      ) : (
        /* ── 구매 후: 프롬프트 전문 + 문장별 해부 + 창작자 전환 ── */
        <>
          {promptBody && (
            <div className="mt-3 rounded-xl border-2 border-black bg-[#1a1a18]">
              <div className="flex items-center justify-between border-b border-white/15 px-3 py-2">
                <span className="mono-font text-[0.6rem] uppercase tracking-[0.16em] text-white/55">
                  프롬프트 전문
                </span>
                <button
                  type="button"
                  onClick={copyPrompt}
                  className="mono-font rounded-full border border-white/30 px-2.5 py-0.5 text-[0.66rem] font-bold text-white/80 transition-colors hover:bg-white/10"
                >
                  {copied ? "복사됨 ✓" : "복사"}
                </button>
              </div>
              <pre className="mono-font overflow-x-auto whitespace-pre-wrap px-3 py-3 text-[0.78rem] leading-6 text-[#f4f0e8]">
                {promptBody}
              </pre>
            </div>
          )}

          <StaggerGroup gap={0.05} amount="some" className="mt-3 grid gap-2.5 sm:grid-cols-2">
            {segments.map((seg, i) => (
              <StaggerItem
                key={i}
                className="rounded-xl border-2 border-black bg-[var(--paper-2)] p-3.5"
              >
                <div className="flex items-center gap-2">
                  <span className="mono-font text-[0.62rem] font-bold text-black/45">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="pill px-2.5 py-0.5 text-[0.72rem] font-bold" style={{ background: "var(--sky)" }}>
                    {seg.label}
                  </span>
                </div>
                <p className="mono-font mt-2 rounded-lg border-2 border-black bg-white px-2.5 py-1.5 text-[0.76rem] leading-5 text-black/80">
                  “{seg.snippet}”
                </p>
                <p className="mt-2 text-[0.82rem] leading-6 text-black/70">{seg.effect}</p>
              </StaggerItem>
            ))}
          </StaggerGroup>

          {/* 창작자 전환 — 이해한 구조로 직접 만들어 팔기 */}
          <div className="mt-3 flex flex-col gap-3 rounded-xl border-2 border-black bg-[var(--sun)] p-4 sm:flex-row sm:items-center">
            <div className="min-w-0">
              <p className="display-font text-lg font-black leading-tight">이 구조, 이제 직접 만들 수 있어요</p>
              <p className="mt-0.5 text-[0.82rem] leading-6 text-black/70">
                방금 본 분해 방식으로 당신의 프롬프트도 등록해 보세요. 검증은 시스템이 대신 돌려줍니다.
              </p>
            </div>
            <Magnetic>
              <Link
                href={`/upload?from=${slug}`}
                className="btn-glow inline-block shrink-0 rounded-full border-2 border-black bg-[#111] px-5 py-2.5 text-sm font-semibold text-white"
              >
                나도 만들어 팔기 →
              </Link>
            </Magnetic>
          </div>
        </>
      )}
    </section>
  );
}
