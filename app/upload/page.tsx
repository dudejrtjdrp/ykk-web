"use client";

// 업로드/등록 (기획서 6.2) — 핵심: 재현성 자동 검증을 흐름에 내장
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { SiteHeader } from "@/components/SiteHeader";
import { scoreColor } from "@/lib/format";
import { Magnetic } from "@/components/ui/Magnetic";
import { EASE } from "@/lib/motion";

const STEPS = ["콘텐츠", "환경", "재현 검증", "결과물", "가격·공개", "게시"];

export default function UploadPage() {
  const [step, setStep] = useState(0);
  const [verifying, setVerifying] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [published, setPublished] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  const runVerify = () => {
    setVerifying(true);
    setScore(0);
    let v = 0;
    const target = 88 + Math.floor(Math.random() * 9);
    timer.current = setInterval(() => {
      v += Math.max(1, Math.round((target - v) * 0.18));
      if (v >= target) {
        v = target;
        if (timer.current) clearInterval(timer.current);
        setVerifying(false);
      }
      setScore(v);
    }, 90);
  };

  const canNext = step !== 2 || (score !== null && !verifying);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 pb-16 pt-6">
        <p className="mono-font text-[0.62rem] uppercase tracking-[0.2em] text-black/55">creator studio</p>
        <h1 className="display-font text-3xl font-black">레시피 올리기</h1>
        <p className="mt-2 text-sm text-black/65">
          단순 업로드가 아니라, 시스템이 <b>재현성을 검증</b>해 점수를 부여합니다. 이게 ykk 신뢰의 근간이에요.
        </p>

        {/* 스텝 인디케이터 */}
        <ol className="no-scrollbar mt-5 flex gap-2 overflow-x-auto">
          {STEPS.map((s, i) => (
            <li
              key={s}
              className="flex shrink-0 items-center gap-2 rounded-full border-2 border-black px-3 py-1.5 text-sm font-semibold"
              style={i === step ? { background: "#1a1a18", color: "#fff" } : i < step ? { background: "var(--mint)" } : { background: "var(--paper)" }}
            >
              <span className="mono-font text-xs">{i < step ? "✓" : i + 1}</span>
              {s}
            </li>
          ))}
        </ol>

        <section className="mt-5 sticker p-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={published ? "published" : step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.26, ease: EASE.entrance }}
            >
          {published ? (
            <div className="text-center">
              <div className="mx-auto grid size-14 place-items-center rounded-full border-2 border-black bg-[var(--mint)] text-2xl">✓</div>
              <h2 className="mt-3 display-font text-2xl font-black">게시되었어요</h2>
              <p className="mt-2 text-sm text-black/65">검토 후 캔버스에 스티커로 안착합니다. 재현성 {score}%로 등록되었어요.</p>
              <Link href="/" className="mt-4 inline-block rounded-full border-2 border-black bg-[#111] px-5 py-2.5 text-sm font-semibold text-white">캔버스로</Link>
            </div>
          ) : step === 0 ? (
            <div className="space-y-3">
              <Field label="레시피 제목" placeholder="예: 면접 대비 자소서 시스템" />
              <Field label="한 줄 요약" placeholder="무엇을 해결하나요?" />
              <TextArea label="프롬프트 / 워크플로우" placeholder="프롬프트 전문 또는 단계를 붙여넣으세요." />
            </div>
          ) : step === 1 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Model" placeholder="GPT-5" defaultValue="GPT-5" mono />
              <Field label="Version" placeholder="2026-06" defaultValue="2026-06" mono />
              <Field label="Temperature" placeholder="0.7" defaultValue="0.7" mono />
              <Field label="Max Tokens" placeholder="4000" defaultValue="4000" mono />
              <p className="sm:col-span-2 text-xs text-black/50">최근 사용 환경을 자동으로 채웠어요. 정확할수록 재현 신뢰가 올라갑니다.</p>
            </div>
          ) : step === 2 ? (
            <div className="text-center">
              <p className="text-sm text-black/65">동일 환경에서 여러 번 재실행해 결과 일치도를 측정합니다.</p>
              <div className="mx-auto mt-4 max-w-sm">
                <div className="h-4 overflow-hidden rounded-full border-2 border-black bg-white">
                  <div className="h-full transition-[width] duration-100" style={{ width: `${score ?? 0}%`, background: scoreColor(score ?? 0) }} />
                </div>
                <p className="mono-font mt-2 text-3xl font-black" style={{ color: scoreColor(score ?? 0) }}>
                  {score === null ? "—" : `${score}%`}
                </p>
              </div>
              <Magnetic>
                <button
                  type="button"
                  onClick={runVerify}
                  disabled={verifying}
                  className="btn-glow mt-3 rounded-full border-2 border-black bg-[var(--cobalt)] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {verifying ? "검증 중…" : score === null ? "재현 검증 실행" : "다시 검증"}
                </button>
              </Magnetic>
            </div>
          ) : step === 3 ? (
            <div>
              <p className="mono-font text-[0.62rem] uppercase tracking-[0.2em] text-black/55">before / after 결과물</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {["제작자 결과 업로드", "재실행 결과 (자동 첨부)"].map((t) => (
                  <div key={t} className="grid h-32 place-items-center rounded-xl border-2 border-dashed border-black/40 bg-[var(--paper-2)] text-center text-sm text-black/50">
                    {t}
                    <span className="mono-font text-xs">＋ 드래그 앤 드롭</span>
                  </div>
                ))}
              </div>
            </div>
          ) : step === 4 ? (
            <div className="space-y-3">
              <Field label="가격 (₩)" placeholder="19000" defaultValue="19000" mono />
              <div className="flex items-center gap-2">
                <span className="text-sm text-black/60">유사 레시피 기준 추천가</span>
                <span className="pill bg-[var(--sun)] px-3 py-1 text-sm font-bold">₩18,000 ~ ₩24,000</span>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" defaultChecked className="size-4" /> 구매자에게 이후 버전 업데이트 무료 제공
              </label>
            </div>
          ) : (
            <div className="space-y-3">
              <h2 className="display-font text-2xl font-black">게시 전 확인</h2>
              <ul className="space-y-2 text-sm">
                {[
                  ["환경 정보 기입", true],
                  ["재현성 검증 완료", score !== null],
                  ["결과물 1개 이상", true],
                  ["가격·정책 설정", true],
                ].map(([t, ok]) => (
                  <li key={t as string} className="flex items-center gap-2 rounded-lg border-2 border-black bg-[var(--paper-2)] px-3 py-2">
                    <span style={{ color: ok ? "var(--green)" : "var(--verm)" }}>{ok ? "✓" : "✕"}</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          )}
            </motion.div>
          </AnimatePresence>
        </section>

        {!published && (
          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="rounded-full border-2 border-black bg-white px-5 py-2.5 text-sm font-semibold disabled:opacity-40"
            >
              이전
            </button>
            {step < STEPS.length - 1 ? (
              <Magnetic>
                <button
                  type="button"
                  onClick={() => canNext && setStep((s) => s + 1)}
                  disabled={!canNext}
                  className="btn-glow rounded-full border-2 border-black bg-[#111] px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
                >
                  다음
                </button>
              </Magnetic>
            ) : (
              <Magnetic>
                <button
                  type="button"
                  onClick={() => setPublished(true)}
                  className="btn-glow rounded-full border-2 border-black bg-[var(--verm)] px-6 py-2.5 text-sm font-semibold text-white"
                >
                  게시하기
                </button>
              </Magnetic>
            )}
          </div>
        )}
      </main>
    </>
  );
}

function Field({ label, placeholder, defaultValue, mono }: { label: string; placeholder?: string; defaultValue?: string; mono?: boolean }) {
  return (
    <label className="block rounded-xl border-2 border-black bg-[var(--paper-2)] p-3">
      <span className="mono-font text-[0.6rem] uppercase tracking-[0.16em] text-black/55">{label}</span>
      <input
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={`mt-1 w-full border-0 bg-transparent text-sm outline-none placeholder:text-black/35 ${mono ? "mono-font" : ""}`}
      />
    </label>
  );
}

function TextArea({ label, placeholder }: { label: string; placeholder?: string }) {
  return (
    <label className="block rounded-xl border-2 border-black bg-[var(--paper-2)] p-3">
      <span className="mono-font text-[0.6rem] uppercase tracking-[0.16em] text-black/55">{label}</span>
      <textarea placeholder={placeholder} className="mt-1 min-h-28 w-full border-0 bg-transparent text-sm leading-6 outline-none placeholder:text-black/35" />
    </label>
  );
}
