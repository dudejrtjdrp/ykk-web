"use client";

// 카드(실루엣) 클릭 시 뜨는 상세 모달 — 빠른 상세 + 전체 페이지 진입.
// 캔버스/피드 어디서나 RecipeModalProvider 의 openRecipe(slug) 로 호출된다.
// 디자인: 종이 따뜻함은 유지하되, 하드 테두리/그림자 대신 헤어라인·여백·또렷한
//        타이포 위계로 정리한 클린 레이아웃. 무거운 공유 카드 대신 모달 전용
//        라이트 블록(환경·갤러리·비교)을 인라인으로 둬 가독성을 우선한다.
import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import type { Creator, Recipe } from "@/lib/types";
import { krw, modelCost, scoreColor, typeLabel } from "@/lib/format";
import { getShape } from "@/lib/canvas/shapes";
import { useSaved } from "@/lib/store";
import { ReproGauge } from "@/components/ui/ReproGauge";
import { CutShape } from "@/components/canvas/CutShape";
import { popIn } from "@/lib/motion";

// 섹션 헤더 — 사전식(소문자) 라벨 + 충분한 대비. 와이드 트래킹 대문자 모노는 쓰지 않음.
function Section({
  title,
  aside,
  children,
}: {
  title: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="mt-7">
      <div className="mb-3 flex items-baseline gap-2">
        <h3 className="text-[0.92rem] font-semibold tracking-tight text-[var(--ink)]">{title}</h3>
        {aside && <span className="ml-auto text-[0.82rem] text-[var(--ink-soft)]">{aside}</span>}
      </div>
      {children}
    </section>
  );
}

export function RecipeModal({
  recipe,
  creator,
  onClose,
}: {
  recipe?: Recipe;
  creator?: Creator;
  onClose: () => void;
}) {
  const saved = useSaved();
  const [copied, setCopied] = useState(false);

  // ESC 닫기 + 바디 스크롤 잠금
  useEffect(() => {
    if (!recipe) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [recipe, onClose]);

  const isSaved = recipe ? saved.isSaved(recipe.slug) : false;
  const s = recipe ? getShape(recipe.shape) : null;
  const embLong = 72;
  const embW = s ? (s.aspect >= 1 ? embLong : embLong * s.aspect) : embLong;
  const embH = s ? (s.aspect >= 1 ? embLong / s.aspect : embLong) : embLong;

  if (!recipe || !s) return <AnimatePresence />;

  const env = recipe.env;
  const cost = modelCost(env.model);
  const envRows: Array<[string, string]> = [
    ["Model", env.model],
    ["Version", env.version],
    ["Temperature", String(env.temperature)],
    ["Max tokens", env.maxTokens ? String(env.maxTokens) : "—"],
    ["Language", env.language],
  ];

  const copyEnv = async () => {
    try {
      await navigator.clipboard.writeText(envRows.map(([k, v]) => `${k}: ${v}`).join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[60] grid place-items-center bg-[#1a1a18]/45 px-4 py-6 backdrop-blur-md"
        role="dialog"
        aria-modal="true"
        aria-label={`${recipe.title} 상세`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        onClick={onClose}
      >
        <motion.div
          variants={popIn}
          initial="hidden"
          animate="show"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
          className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[1.75rem] border border-black/10 bg-[var(--paper)]"
          style={{ boxShadow: "0 32px 64px -32px rgba(20,20,18,0.45), 0 14px 28px -20px rgba(20,20,18,0.3)" }}
        >
          {/* 닫기 */}
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="focus-ring absolute right-4 top-4 z-20 grid size-10 place-items-center rounded-full border border-black/10 bg-white/80 text-base text-[var(--ink-soft)] backdrop-blur transition-colors hover:text-[var(--ink)]"
          >
            ✕
          </button>

          {/* ── 헤더 ── */}
          <div className="px-6 pt-6 sm:px-8 sm:pt-8">
            <div className="flex items-start gap-4">
              <div className="cut-sticker shrink-0" style={{ width: embW, height: embH }} aria-hidden>
                <CutShape shape={recipe.shape} color={recipe.color} image={recipe.image} />
              </div>
              <div className="min-w-0 flex-1 pr-8">
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[0.78rem]">
                  <span className="font-semibold tracking-wide text-[var(--ink-soft)]">
                    {typeLabel[recipe.type]}
                  </span>
                  <span className="size-1 rounded-full bg-black/20" aria-hidden />
                  <span className="mono-font text-[var(--ink-soft)]">{recipe.version}</span>
                  <span
                    className="rounded-full px-2.5 py-0.5 text-[0.72rem] font-semibold text-[var(--ink)]"
                    style={{ background: `color-mix(in srgb, ${recipe.color} 55%, white)` }}
                  >
                    {recipe.badge}
                  </span>
                </div>
                <h2 className="mt-2 display-font text-[1.85rem] font-extrabold leading-[1.08] tracking-tight text-[var(--ink)] sm:text-[2.1rem]">
                  {recipe.title}
                </h2>
                <p className="mt-1.5 text-[0.9rem] text-[var(--ink-soft)]">
                  {recipe.creatorName} · {recipe.category} · {recipe.model}
                </p>
              </div>
            </div>
          </div>

          {/* ── 스크롤 본문 ── */}
          <div className="min-h-0 flex-1 overflow-y-auto no-scrollbar px-6 pb-6 sm:px-8">
            <p className="mt-5 text-[1rem] leading-7 text-[var(--ink)]/90">{recipe.summary}</p>

            {/* 재현성 + 환경 */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-4 rounded-2xl bg-[var(--paper-2)] p-5">
                <ReproGauge score={recipe.reproducibility} size={88} />
                <div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--mint)] px-2 py-0.5 text-[0.7rem] font-bold text-[var(--ink)]">
                    ✓ 자동 검증
                  </span>
                  <p className="mt-1.5 text-[0.84rem] leading-6 text-[var(--ink-soft)]">
                    시스템이 동일 환경에서 재실행해 제작자 결과와 일치한 비율
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-[var(--paper-2)] p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-[0.92rem] font-semibold tracking-tight text-[var(--ink)]">환경</h3>
                  <button
                    type="button"
                    onClick={copyEnv}
                    className="focus-ring -mr-1 rounded-md px-2 py-1 text-[0.78rem] font-medium text-[var(--ink-soft)] transition-colors hover:text-[var(--ink)]"
                  >
                    {copied ? "복사됨 ✓" : "복사"}
                  </button>
                </div>
                <dl className="mt-2.5 divide-y divide-black/[0.07]">
                  {envRows.map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between py-1.5">
                      <dt className="text-[0.82rem] text-[var(--ink-soft)]">{k}</dt>
                      <dd className="mono-font text-[0.85rem] font-medium text-[var(--ink)]">{v}</dd>
                    </div>
                  ))}
                </dl>
                {/* 모델·비용 표시 (솔루션 ②) */}
                <div
                  className="mt-3 flex items-center gap-2 rounded-xl px-3 py-2"
                  style={{ background: cost.free ? "var(--mint)" : "white" }}
                >
                  <span className="size-1.5 shrink-0 rounded-full" style={{ background: cost.free ? "var(--green)" : "var(--amber)" }} aria-hidden />
                  <span className="text-[0.8rem] font-semibold text-[var(--ink)]">{cost.label}</span>
                  <span className="mono-font ml-auto text-[0.78rem] text-[var(--ink-soft)]">{cost.perRun}</span>
                </div>
              </div>
            </div>

            {/* before / after — 정적 비교(드래그 핸들 없이 깔끔하게) */}
            <Section title="Before / after">
              <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl bg-black/[0.08] sm:grid-cols-2">
                <div className="bg-[var(--paper-2)] p-4">
                  <span className="text-[0.74rem] font-semibold text-[var(--ink-soft)]">Before · 제작자</span>
                  <p className="mt-2 text-[0.86rem] leading-6 text-[var(--ink)]/85">{recipe.beforeSample}</p>
                </div>
                <div className="bg-white p-4">
                  <span className="inline-flex items-center gap-1.5 text-[0.74rem] font-semibold text-[var(--green)]">
                    <span className="size-1.5 rounded-full bg-[var(--green)]" aria-hidden />
                    After · 재실행
                  </span>
                  <p className="mt-2 text-[0.86rem] leading-6 text-[var(--ink)]/85">{recipe.afterSample}</p>
                </div>
              </div>
            </Section>

            {/* 받는 것 */}
            {(recipe.steps || recipe.bundleCount) && (
              <Section title="받는 것">
                <div className="flex flex-wrap gap-2">
                  {recipe.bundleCount && (
                    <span
                      className="rounded-lg px-3 py-1.5 text-[0.86rem] font-semibold text-[var(--ink)]"
                      style={{ background: "color-mix(in srgb, var(--sun) 45%, white)" }}
                    >
                      번들 {recipe.bundleCount}종 포함
                    </span>
                  )}
                  {recipe.steps?.map((step, i) => (
                    <span
                      key={step}
                      className="inline-flex items-center gap-2 rounded-lg bg-[var(--paper-2)] px-3 py-1.5 text-[0.86rem] text-[var(--ink)]"
                    >
                      <span className="mono-font text-[0.74rem] font-semibold text-[var(--ink-soft)]">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {step}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {/* 결과 갤러리 */}
            {recipe.results.length > 0 && (
              <Section title="결과 갤러리" aside={`${recipe.results.length}개`}>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {recipe.results.map((g) => (
                    <figure
                      key={g.id}
                      className="overflow-hidden rounded-xl border border-black/[0.07] bg-[var(--paper-2)]"
                    >
                      <div
                        className="relative w-full"
                        style={{ aspectRatio: String(1 / g.aspect), background: g.color }}
                      >
                        {g.image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={g.image}
                            alt={g.caption}
                            loading="lazy"
                            draggable={false}
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <figcaption className="px-2.5 py-2">
                        <p className="truncate text-[0.78rem] font-medium text-[var(--ink)]">{g.caption}</p>
                        <p className="mt-0.5 truncate text-[0.72rem] text-[var(--ink-soft)]">by {g.author}</p>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </Section>
            )}

            {/* 크리에이터 */}
            {creator && (
              <Link
                href={`/creator/${creator.id}`}
                onClick={onClose}
                className="mt-7 flex items-center gap-3.5 rounded-2xl bg-[var(--paper-2)] p-4 transition-colors hover:bg-[#ece6db]"
              >
                <span
                  className="grid size-11 shrink-0 place-items-center rounded-full text-base font-bold text-[var(--ink)]"
                  style={{ background: `color-mix(in srgb, ${creator.color} 60%, white)` }}
                >
                  {creator.name.at(0)}
                </span>
                <div className="min-w-0">
                  <p className="text-[0.95rem] font-semibold leading-tight text-[var(--ink)]">
                    {creator.name}
                    {creator.verified && <span className="ml-1 text-[var(--cobalt)]">✓</span>}
                  </p>
                  <p className="truncate text-[0.8rem] text-[var(--ink-soft)]">@{creator.handle}</p>
                </div>
                <span className="ml-auto shrink-0 text-[0.8rem] font-medium text-[var(--ink-soft)]">
                  재현성 {creator.avgRepro}%
                </span>
              </Link>
            )}
          </div>

          {/* ── 푸터 ── */}
          <div className="flex items-center gap-3 border-t border-black/10 bg-[var(--paper)]/95 px-6 py-4 backdrop-blur sm:px-8">
            <div className="min-w-0">
              <p className="mono-font text-[1.4rem] font-bold leading-none text-[var(--ink)]">
                {krw(recipe.priceKrw)}
              </p>
              <p className="mt-1.5 flex items-center gap-1.5 text-[0.8rem] text-[var(--ink-soft)]">
                <span
                  className="size-1.5 rounded-full"
                  style={{ background: scoreColor(recipe.reproducibility) }}
                  aria-hidden
                />
                재현성 {recipe.reproducibility}%
              </p>
            </div>
            <button
              type="button"
              aria-pressed={isSaved}
              aria-label={isSaved ? "저장 취소" : "작업실에 저장"}
              onClick={() => saved.toggle(recipe.slug)}
              className="focus-ring ml-auto grid size-11 shrink-0 place-items-center rounded-full border border-black/10 bg-white text-lg transition-colors hover:border-black/20"
              style={{ color: isSaved ? "var(--verm)" : "var(--ink-soft)" }}
            >
              {isSaved ? "★" : "☆"}
            </button>
            <Link
              href={`/recipe/${recipe.slug}`}
              onClick={onClose}
              className="focus-ring inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[var(--ink)] px-6 py-3 text-[0.9rem] font-semibold text-white transition-transform hover:-translate-y-0.5"
            >
              자세히 · 구매
              <span aria-hidden>→</span>
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
