"use client";

// 상세 페이지 (기획서 4장) — 재현 가능성을 파는 화면
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import type { CanvasNode, Creator, Recipe } from "@/lib/types";
import { krw, modelCost, typeLabel } from "@/lib/format";
import { useSaved } from "@/lib/store";
import { ReproGauge } from "@/components/ui/ReproGauge";
import { EnvCard } from "@/components/ui/EnvCard";
import { ResultCompare } from "@/components/ui/ResultCompare";
import { PromptAnatomy } from "@/components/ui/PromptAnatomy";
import { VersionTimeline } from "@/components/ui/VersionTimeline";
import { MasonryGallery } from "@/components/ui/MasonryGallery";
import { CautionCard } from "@/components/ui/CautionCard";
import { NodeCard } from "@/components/NodeCard";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { Magnetic } from "@/components/ui/Magnetic";
import { popIn, spring } from "@/lib/motion";

type PurchaseState = "idle" | "processing" | "done";

export function RecipeView({
  recipe,
  creator,
  related,
  sameCreator,
}: {
  recipe: Recipe;
  creator?: Creator;
  related: CanvasNode[];
  sameCreator: CanvasNode[];
}) {
  const saved = useSaved();
  const router = useRouter();
  const isSaved = saved.isSaved(recipe.slug);
  const isPurchased = saved.isPurchased(recipe.slug);
  const cost = modelCost(recipe.model);
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<PurchaseState>("idle");

  const buy = () => {
    setState("processing");
    setTimeout(() => {
      saved.purchase(recipe.slug); // 구매 → AI 도움말 잠금 해제 + 작업실 저장
      setState("done");
    }, 1100);
  };

  return (
    <main className="mx-auto max-w-5xl px-4 pb-28 pt-6">
      {/* breadcrumb */}
      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-black/55">
        <Link href="/" className="hover:text-black">탐험</Link>
        <span aria-hidden>›</span>
        <span>{recipe.category}</span>
        <span aria-hidden>›</span>
        <span className="font-semibold text-black">{recipe.title}</span>
      </div>

      {/* hero: 제목·메타 (슬림) */}
      <Reveal>
        <section className="sticker p-4 sm:p-5">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="mono-font rounded-full border-2 border-black bg-[var(--paper-2)] px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-[0.14em]">
              {typeLabel[recipe.type]}
            </span>
            <span className="pill px-3 py-1 text-xs font-bold" style={{ background: recipe.color }}>{recipe.badge}</span>
            <span className="mono-font text-[0.7rem] text-black/55">{recipe.version}</span>
          </div>
          <h1 className="display-font text-4xl font-black leading-[0.95] text-black sm:text-5xl">{recipe.title}</h1>
          <p className="mt-3 max-w-2xl text-pretty text-sm leading-7 text-black/75">{recipe.summary}</p>
        </section>
      </Reveal>

      {/* 결과물 비교 — 판매자 제출 vs 서버 재실행 (미디어 우선, 최상단) (솔루션 ①) */}
      {recipe.verify && (
        <Reveal className="mt-4">
          <ResultCompare verify={recipe.verify} variant="full" />
        </Reveal>
      )}

      {/* 재현성 + 환경 */}
      <StaggerGroup gap={0.08} amount={0.1} className="mt-4 grid gap-4 lg:grid-cols-2">
        <StaggerItem className="sticker flex items-center gap-4 p-4">
          <ReproGauge score={recipe.reproducibility} />
          <div className="text-sm leading-6 text-black/70">
            <p className="font-semibold text-black">독립 재실행 검증</p>
            <p className="mt-1">동일 환경에서 여러 번 재실행해 제작자 결과와 일치한 비율입니다.</p>
          </div>
        </StaggerItem>
        <StaggerItem>
          <EnvCard env={recipe.env} />
        </StaggerItem>
      </StaggerGroup>

      {/* AI 도움말 — 프롬프트 해부 (솔루션 ③). 구매 후 잠금 해제 */}
      <div id="ai-help">
        <Reveal className="mt-4">
          <PromptAnatomy
            unlocked={isPurchased}
            promptBody={recipe.promptBody}
            anatomy={recipe.anatomy}
            slug={recipe.slug}
          />
        </Reveal>
      </div>

      {/* 받는 것 + 단계 */}
      {(recipe.steps || recipe.bundleCount) && (
        <section className="mt-4 sticker p-4">
          <p className="mono-font text-[0.62rem] uppercase tracking-[0.2em] text-black/55">what you get</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {recipe.bundleCount && (
              <span className="pill bg-[var(--sun)] px-3 py-1.5 text-sm font-bold">번들 {recipe.bundleCount}종 포함</span>
            )}
            {recipe.steps?.map((s, i) => (
              <span key={s} className="pill px-3 py-1.5 text-sm font-semibold">
                <span className="mono-font mr-1 text-black/45">{i + 1}</span>
                {s}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* 주의사항 — 재배포 금지 등 이용 약관 (받는 것 바로 다음에 배치) */}
      <Reveal className="mt-4">
        <CautionCard cautions={recipe.cautions} />
      </Reveal>

      {/* 타임라인 */}
      <section className="mt-4">
        <VersionTimeline history={recipe.versionHistory} />
      </section>

      {/* 구매자 결과 갤러리 */}
      <Reveal>
      <section className="mt-4 sticker p-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="mono-font text-[0.62rem] uppercase tracking-[0.2em] text-black/55">community proof</p>
            <h2 className="display-font text-2xl font-black">구매자 결과 갤러리</h2>
          </div>
          <span className="text-xs text-black/50">{recipe.results.length}개의 실사용 결과</span>
        </div>
        <div className="mt-4">
          <MasonryGallery results={recipe.results} />
        </div>
      </section>
      </Reveal>

      {/* 리뷰 + 크리에이터 */}
      <Reveal className="mt-4 grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="sticker p-4">
          <p className="mono-font text-[0.62rem] uppercase tracking-[0.2em] text-black/55">reviews</p>
          <div className="mt-3 space-y-3">
            {recipe.reviews.map((r) => (
              <div key={r.name} className="rounded-xl border-2 border-black bg-[var(--paper-2)] p-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold">{r.name}</span>
                  <span className="mono-font text-sm" style={{ color: "var(--amber)" }}>{"★".repeat(r.rating)}</span>
                </div>
                <p className="mt-1 text-sm leading-6 text-black/75">{r.text}</p>
              </div>
            ))}
          </div>
        </div>

        {creator && (
          <Link href={`/creator/${creator.id}`} className="sticker block p-4 transition-transform hover:-translate-y-0.5">
            <p className="mono-font text-[0.62rem] uppercase tracking-[0.2em] text-black/55">creator</p>
            <div className="mt-3 flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-full border-2 border-black mono-font text-lg font-black" style={{ background: creator.color }}>
                {creator.name.at(0)}
              </span>
              <div>
                <p className="display-font text-lg font-black leading-none">
                  {creator.name}
                  {creator.verified && <span className="ml-1 text-[var(--cobalt)]">✓</span>}
                </p>
                <p className="mono-font text-xs text-black/55">@{creator.handle}</p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-black/70">{creator.bio}</p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              {[["판매", creator.sales.toLocaleString()], ["팔로워", creator.followers.toLocaleString()], ["재현성", `${creator.avgRepro}%`]].map(([l, v]) => (
                <div key={l} className="rounded-lg border-2 border-black bg-[var(--paper-2)] p-2">
                  <p className="display-font text-base font-black leading-none">{v}</p>
                  <p className="mono-font text-[0.55rem] uppercase tracking-wide text-black/50">{l}</p>
                </div>
              ))}
            </div>
          </Link>
        )}
      </Reveal>

      {/* 같은 작가의 다른 레시피 */}
      {sameCreator.length > 0 && (
        <section className="mt-6">
          <Reveal>
            <div className="mb-3 flex items-end justify-between gap-2">
              <h2 className="display-font text-xl font-black">
                {creator ? `${creator.name}님의 다른 레시피` : "같은 작가의 다른 레시피"}
              </h2>
              {creator && (
                <Link href={`/creator/${creator.id}`} className="shrink-0 text-sm font-semibold text-black/55 hover:text-black">
                  작업실 전체 보기 →
                </Link>
              )}
            </div>
          </Reveal>
          <StaggerGroup gap={0.05} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sameCreator.map((n) => (
              <StaggerItem key={n.id}>
                <NodeCard node={n} />
              </StaggerItem>
            ))}
          </StaggerGroup>
        </section>
      )}

      {/* 같은 분야의 다른 레시피 */}
      {related.length > 0 && (
        <section className="mt-6">
          <Reveal>
            <h2 className="display-font mb-3 text-xl font-black">같은 분야의 다른 레시피</h2>
          </Reveal>
          <StaggerGroup gap={0.05} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((n) => (
              <StaggerItem key={n.id}>
                <NodeCard node={n} />
              </StaggerItem>
            ))}
          </StaggerGroup>
        </section>
      )}

      {/* sticky 구매 바 */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-black bg-[var(--paper)]">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{recipe.title}</p>
            <p className="mono-font flex items-center gap-1.5 text-xs text-black/55">
              <span className="truncate">{recipe.model} · 재현성 {recipe.reproducibility}%</span>
              <span
                className="inline-flex shrink-0 items-center gap-1 rounded-full border border-black/30 px-1.5 py-0.5 text-[0.6rem] font-bold text-black/70"
                style={{ background: cost.free ? "var(--mint)" : "var(--paper-2)" }}
              >
                <span className="size-1.5 rounded-full" style={{ background: cost.free ? "var(--green)" : "var(--amber)" }} aria-hidden />
                {cost.free ? "무료 실행" : "유료 실행"}
              </span>
            </p>
          </div>
          <span className="mono-font ml-auto text-lg font-black">{krw(recipe.priceKrw)}</span>
          <motion.button
            type="button"
            aria-pressed={isSaved}
            onClick={() => saved.toggle(recipe.slug)}
            whileTap={{ scale: 0.82 }}
            className="grid size-11 place-items-center rounded-full border-2 border-black bg-white text-lg"
            style={{ color: isSaved ? "var(--verm)" : "#1a1a18" }}
            aria-label={isSaved ? "저장 취소" : "작업실에 저장"}
          >
            <motion.span
              key={isSaved ? "on" : "off"}
              initial={{ scale: 0.4, rotate: -25 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={spring.snappy}
              className="leading-none"
            >
              {isSaved ? "★" : "☆"}
            </motion.span>
          </motion.button>
          {isPurchased ? (
            <Magnetic>
              <button
                type="button"
                onClick={() => router.push("/library")}
                className="btn-glow rounded-full border-2 border-black bg-[var(--green)] px-6 py-2.5 text-sm font-semibold text-white"
              >
                구매함 · 작업실
              </button>
            </Magnetic>
          ) : (
            <Magnetic>
              <button
                type="button"
                onClick={() => { setOpen(true); setState("idle"); }}
                className="btn-glow rounded-full border-2 border-black bg-[#111] px-6 py-2.5 text-sm font-semibold text-white"
              >
                구매하기
              </button>
            </Magnetic>
          )}
        </div>
      </div>

      {/* 구매 모달 */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-black/60 px-4"
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div className="w-full max-w-md sticker p-5" variants={popIn} initial="hidden" animate="show" exit="exit">
            {state === "done" ? (
              <div className="text-center">
                <div className="mx-auto grid size-14 place-items-center rounded-full border-2 border-black bg-[var(--mint)] text-2xl">✓</div>
                <h3 className="mt-3 display-font text-2xl font-black">작업실에 담겼어요</h3>
                <p className="mt-2 text-sm text-black/65">
                  {recipe.title} · 이제 <b>AI 도움말</b>이 열렸어요 — 이 프롬프트가 왜 작동하는지 문장 단위로 볼 수 있어요.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      setTimeout(() => document.getElementById("ai-help")?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
                    }}
                    className="rounded-full border-2 border-black bg-[var(--sun)] px-4 py-2.5 text-sm font-semibold"
                  >
                    AI 도움말 보기
                  </button>
                  <button type="button" onClick={() => router.push("/library")} className="rounded-full border-2 border-black bg-[#111] px-4 py-2.5 text-sm font-semibold text-white">작업실 가기</button>
                </div>
              </div>
            ) : (
              <>
                <p className="mono-font text-[0.62rem] uppercase tracking-[0.2em] text-black/55">checkout</p>
                <h3 className="mt-1 display-font text-2xl font-black">{krw(recipe.priceKrw)} 결제</h3>
                <p className="mt-2 text-sm leading-6 text-black/65">환경·재현성·결과물을 확인했어요. 결제하면 즉시 작업실에 추가됩니다.</p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setOpen(false)} className="rounded-full border-2 border-black bg-white px-4 py-2.5 text-sm font-semibold" disabled={state === "processing"}>닫기</button>
                  <button type="button" onClick={buy} disabled={state === "processing"} className="rounded-full border-2 border-black bg-[var(--verm)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
                    {state === "processing" ? "처리 중…" : "결제하기"}
                  </button>
                </div>
              </>
            )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
