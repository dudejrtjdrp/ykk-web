"use client";

// 업로드/등록 (기획서 6.2) — 핵심: 재현성 자동 검증을 흐름에 내장
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { SiteHeader } from "@/components/SiteHeader";
import { AuthGate } from "@/components/auth/AuthGate";
import { scoreColor } from "@/lib/format";
import { Magnetic } from "@/components/ui/Magnetic";
import { EASE } from "@/lib/motion";
import { useSaved } from "@/lib/store";
import { categories, CATEGORY_COLOR, regions } from "@/lib/mock-data";
import { OUTPUT_BY_CATEGORY, youtubeId, type OutputSpec } from "@/lib/output-formats";
import type { Category, MyRecipe } from "@/lib/types";

const STEPS = ["콘텐츠", "환경", "재현 검증", "결과물", "가격·공개", "게시"];

export default function UploadPage() {
  const saved = useSaved();
  const [step, setStep] = useState(0);
  const [verifying, setVerifying] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [published, setPublished] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  // 게시에 쓰일 입력값 — 작업실의 "내가 올린 레시피"로 저장된다
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState<Category>(categories[0]);
  const [model, setModel] = useState("GPT-5");
  const [price, setPrice] = useState("19000");

  // 결과물 — 분야에 따라 받는 형식이 달라진다
  const [files, setFiles] = useState<File[]>([]);
  const [ytUrl, setYtUrl] = useState("");
  const spec = OUTPUT_BY_CATEGORY[category];
  const hasResult = spec.format === "video" ? !!youtubeId(ytUrl) : files.length > 0;

  // 분야가 바뀌면 업로드 형식이 달라지므로 입력 초기화
  useEffect(() => {
    setFiles([]);
    setYtUrl("");
  }, [category]);

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  const publish = () => {
    const slug = `my-${Date.now()}`;
    const region = regions.find((r) => r.category === category);
    const recipe: MyRecipe = {
      id: slug,
      slug,
      type: "prompt",
      title: title.trim() || "제목 없는 레시피",
      category,
      regionId: region?.id ?? "",
      creatorId: "me",
      creatorName: "나",
      priceKrw: Math.max(0, parseInt(price.replace(/[^0-9]/g, ""), 10) || 0),
      reproducibility: score ?? 0,
      model: model.trim() || "GPT-5",
      x: 0,
      y: 0,
      w: 160,
      h: 160,
      rotation: 0,
      color: CATEGORY_COLOR[category],
      shape: "blob",
      image: "",
      summary: summary.trim(),
      status: "review",
      createdAt: new Date().toISOString(),
    };
    saved.publishRecipe(recipe);
    setPublished(true);
  };

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
      <AuthGate
        title="레시피를 올리려면 로그인"
        description="내 레시피는 계정에 연결돼 작업실에 보관돼요. 로그인하거나 가입하면 바로 올릴 수 있어요."
      >
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
              <p className="mt-2 text-sm text-black/65">
                <b>내 작업실</b>에 담겼어요. 검토 후 캔버스에 스티커로 안착합니다. 재현성 {score}%로 등록되었어요.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Link href="/library" className="rounded-full border-2 border-black bg-[var(--sun)] px-5 py-2.5 text-sm font-semibold">
                  작업실에서 보기
                </Link>
                <Link href="/" className="rounded-full border-2 border-black bg-[#111] px-5 py-2.5 text-sm font-semibold text-white">캔버스로</Link>
              </div>
            </div>
          ) : step === 0 ? (
            <div className="space-y-3">
              <Field label="레시피 제목" placeholder="예: 면접 대비 자소서 시스템" value={title} onChange={setTitle} />
              <Field label="한 줄 요약" placeholder="무엇을 해결하나요?" value={summary} onChange={setSummary} />
              <div className="rounded-xl border-2 border-black bg-[var(--paper-2)] p-3">
                <span className="mono-font text-[0.6rem] uppercase tracking-[0.16em] text-black/55">분야</span>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {categories.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCategory(c)}
                      className="rounded-full border-2 border-black px-3 py-1 text-xs font-semibold transition-transform hover:-translate-y-0.5"
                      style={category === c ? { background: "#1a1a18", color: "#fff" } : { background: CATEGORY_COLOR[c] }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <p className="mt-2.5 text-[0.72rem] leading-5 text-black/60">
                  <span aria-hidden>{spec.icon}</span> 이 분야의 결과물은 <b>{spec.label}</b>로 받아요 — 예: {spec.example}
                </p>
              </div>
              <TextArea label="프롬프트 / 워크플로우" placeholder="프롬프트 전문 또는 단계를 붙여넣으세요." />
            </div>
          ) : step === 1 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Model" placeholder="GPT-5" value={model} onChange={setModel} mono />
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
            <ResultStep spec={spec} files={files} setFiles={setFiles} ytUrl={ytUrl} setYtUrl={setYtUrl} />
          ) : step === 4 ? (
            <div className="space-y-3">
              <Field label="가격 (₩)" placeholder="19000" value={price} onChange={setPrice} mono />
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
                  [`결과물 업로드 (${spec.label})`, hasResult],
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
                  onClick={publish}
                  className="btn-glow rounded-full border-2 border-black bg-[var(--verm)] px-6 py-2.5 text-sm font-semibold text-white"
                >
                  게시하기
                </button>
              </Magnetic>
            )}
          </div>
        )}
      </main>
      </AuthGate>
    </>
  );
}

function Field({
  label,
  placeholder,
  defaultValue,
  value,
  onChange,
  mono,
}: {
  label: string;
  placeholder?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (v: string) => void;
  mono?: boolean;
}) {
  const controlled = value !== undefined && onChange !== undefined;
  return (
    <label className="block rounded-xl border-2 border-black bg-[var(--paper-2)] p-3">
      <span className="mono-font text-[0.6rem] uppercase tracking-[0.16em] text-black/55">{label}</span>
      <input
        {...(controlled ? { value, onChange: (e) => onChange(e.target.value) } : { defaultValue })}
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

// 결과물 업로드 — 분야(spec.format)에 따라 받는 형식이 달라진다
function ResultStep({
  spec,
  files,
  setFiles,
  ytUrl,
  setYtUrl,
}: {
  spec: OutputSpec;
  files: File[];
  setFiles: (f: File[]) => void;
  ytUrl: string;
  setYtUrl: (v: string) => void;
}) {
  const isVideo = spec.format === "video";
  const isImage = spec.format === "image" || spec.format === "images";

  // 이미지 미리보기 object URL (선택 변경/언마운트 시 해제)
  const previews = useMemo(
    () => (isImage ? files.map((f) => URL.createObjectURL(f)) : []),
    [files, isImage],
  );
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

  const vid = isVideo ? youtubeId(ytUrl) : null;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <p className="mono-font text-[0.62rem] uppercase tracking-[0.2em] text-black/55">결과물 업로드</p>
        <span className="pill inline-flex items-center gap-1 px-2.5 py-0.5 text-[0.7rem] font-bold" style={{ background: "var(--sun)" }}>
          {spec.icon} {spec.label}
        </span>
      </div>
      <p className="mt-2 text-sm text-black/65">
        {spec.hint}. 이 분야는 <b>{spec.label}</b> 형식만 받아요.
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {/* 판매자 업로드 슬롯 — 형식별 */}
        <div>
          <span className="mono-font text-[0.55rem] font-bold uppercase tracking-[0.14em] text-black/45">제작자 결과 업로드</span>
          <div className="mt-1.5">
            {isVideo ? (
              <div>
                <input
                  type="url"
                  inputMode="url"
                  value={ytUrl}
                  onChange={(e) => setYtUrl(e.target.value)}
                  placeholder="https://youtu.be/..."
                  className="w-full rounded-xl border-2 border-black bg-[var(--paper-2)] px-3 py-2.5 text-sm outline-none placeholder:text-black/35"
                />
                {ytUrl && !vid && (
                  <p className="mt-1.5 text-xs text-[var(--verm)]">올바른 YouTube 링크가 아니에요.</p>
                )}
                {vid && (
                  <div className="mt-2 overflow-hidden rounded-xl border-2 border-black">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://img.youtube.com/vi/${vid}/hqdefault.jpg`}
                      alt="영상 썸네일"
                      className="block aspect-video w-full object-cover"
                    />
                  </div>
                )}
              </div>
            ) : (
              <label className="grid min-h-32 cursor-pointer place-items-center rounded-xl border-2 border-dashed border-black/40 bg-[var(--paper-2)] p-3 text-center text-sm text-black/55 transition-colors hover:border-black/70">
                <input
                  type="file"
                  accept={spec.accept}
                  multiple={spec.multiple}
                  onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                  className="hidden"
                />
                {files.length === 0 ? (
                  <span>
                    {spec.icon} {spec.label} 선택
                    <span className="mono-font mt-1 block text-xs text-black/40">＋ 클릭해서 선택</span>
                  </span>
                ) : isImage ? (
                  <div className="grid w-full grid-cols-3 gap-1.5">
                    {previews.slice(0, 6).map((u, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={i}
                        src={u}
                        alt={`업로드 ${i + 1}`}
                        className="aspect-square w-full rounded-md border border-black/20 object-cover"
                      />
                    ))}
                  </div>
                ) : (
                  <span className="break-all">
                    {spec.icon} {files[0].name}
                    <span className="mono-font mt-1 block text-xs text-black/40">다시 선택하려면 클릭</span>
                  </span>
                )}
              </label>
            )}
          </div>
        </div>

        {/* 서버 자동 재실행 슬롯 */}
        <div>
          <span className="mono-font text-[0.55rem] font-bold uppercase tracking-[0.14em] text-black/45">재실행 결과 (자동 첨부)</span>
          <div className="mt-1.5 grid min-h-32 place-items-center rounded-xl border-2 border-black bg-white p-3 text-center">
            <div>
              <span className="pill inline-flex items-center gap-1 px-2.5 py-0.5 text-[0.7rem] font-bold" style={{ background: "var(--mint)" }}>
                ✓ 자동
              </span>
              <p className="mt-2 text-sm leading-6 text-black/65">
                게시하면 서버가 동일 형식(<b>{spec.short}</b>)으로 재실행 결과를 자동 첨부해 나란히 비교합니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
