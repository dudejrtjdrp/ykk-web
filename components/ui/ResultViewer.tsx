"use client";

// 결과물 미디어 뷰어 — 형식(format)에 따라 다른 뷰어를 렌더한다.
//  · image / images : 단일·다중 이미지
//  · pdf            : 슬라이드형 PDF 뷰어 (툴바 + 페이저)
//  · doc            : Word 문서 뷰어 (문서 페이지)
//  · video          : lite YouTube 임베드 (포스터 클릭 시 로드)
import { useState } from "react";
import type { ResultArtifact } from "@/lib/types";

export function ResultViewer({
  artifact,
  compact = false,
}: {
  artifact: ResultArtifact;
  compact?: boolean;
}) {
  switch (artifact.format) {
    case "image":
    case "images":
      return <ImageViewer artifact={artifact} />;
    case "pdf":
      return <PagedViewer artifact={artifact} kind="pdf" compact={compact} />;
    case "doc":
      return <PagedViewer artifact={artifact} kind="doc" compact={compact} />;
    case "video":
      return <VideoViewer artifact={artifact} />;
    default:
      return <Empty label="결과물" />;
  }
}

function Empty({ label }: { label: string }) {
  return (
    <div className="grid h-28 place-items-center rounded-lg border-2 border-dashed border-black/30 bg-[var(--paper-2)] text-xs text-[var(--ink-soft)]">
      {label} 미리보기 없음
    </div>
  );
}

function ImageViewer({ artifact }: { artifact: ResultArtifact }) {
  const imgs = artifact.images ?? [];
  if (imgs.length === 0) return <Empty label="이미지" />;
  const multi = artifact.format === "images" || imgs.length > 1;

  if (!multi) {
    return (
      <figure className="overflow-hidden rounded-lg border-2 border-black bg-[var(--paper-2)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgs[0]}
          alt={artifact.note}
          loading="lazy"
          draggable={false}
          className="block w-full object-cover"
          style={{ aspectRatio: "4 / 3" }}
        />
      </figure>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-1.5">
      {imgs.slice(0, 4).map((src, i) => (
        <figure
          key={i}
          className="relative overflow-hidden rounded-lg border-2 border-black bg-[var(--paper-2)]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={`${artifact.note} ${i + 1}`}
            loading="lazy"
            draggable={false}
            className="block w-full object-cover"
            style={{ aspectRatio: "1 / 1" }}
          />
          {i === 3 && imgs.length > 4 && (
            <span className="absolute inset-0 grid place-items-center bg-black/55 text-sm font-bold text-white">
              +{imgs.length - 4}
            </span>
          )}
        </figure>
      ))}
    </div>
  );
}

function PagedViewer({
  artifact,
  kind,
  compact,
}: {
  artifact: ResultArtifact;
  kind: "pdf" | "doc";
  compact: boolean;
}) {
  const pages = artifact.pages ?? [];
  const [i, setI] = useState(0);
  if (pages.length === 0) return <Empty label={kind === "pdf" ? "PDF" : "문서"} />;
  const idx = Math.min(i, pages.length - 1);
  const page = pages[idx];
  const badge = kind === "pdf" ? "PDF" : "DOCX";

  return (
    <div className="overflow-hidden rounded-lg border-2 border-black bg-white">
      {/* 툴바 */}
      <div className="flex items-center gap-2 border-b-2 border-black bg-[var(--paper-2)] px-2.5 py-1.5">
        <span className="mono-font rounded border border-black bg-white px-1.5 py-0.5 text-[0.5rem] font-bold uppercase tracking-wide">
          {badge}
        </span>
        <span className="truncate text-[0.72rem] font-medium text-[var(--ink)]">
          {artifact.fileName ?? "결과물"}
        </span>
        <span className="mono-font ml-auto shrink-0 text-[0.62rem] text-[var(--ink-soft)]">
          {idx + 1} / {pages.length}
        </span>
      </div>

      {/* 페이지 본문 */}
      {kind === "pdf" ? (
        <div className="bg-[#e9e7e1] p-3">
          <div
            className="mx-auto flex flex-col rounded-md border border-black/15 bg-white px-4 py-3 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.35)]"
            style={{ aspectRatio: "16 / 9", minHeight: compact ? 122 : 148 }}
          >
            <h4 className="display-font text-[0.92rem] font-black leading-tight text-[var(--ink)]">
              {page.title}
            </h4>
            <ul className="mt-2 space-y-1.5">
              {page.lines.map((l, k) => (
                <li
                  key={k}
                  className="flex items-start gap-1.5 text-[0.72rem] leading-snug text-[var(--ink-soft)]"
                >
                  <span className="mt-1 size-1 shrink-0 rounded-full bg-[var(--cobalt)]" aria-hidden />
                  {l}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="bg-[#eceae4] p-3">
          <div
            className="mx-auto rounded-sm border border-black/12 bg-white px-5 py-4 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.35)]"
            style={{ minHeight: compact ? 132 : 168 }}
          >
            <h4 className="text-[0.92rem] font-bold text-[var(--ink)]">{page.title}</h4>
            <div className="mt-2 space-y-1.5">
              {page.lines.map((l, k) => (
                <p key={k} className="text-[0.72rem] leading-5 text-[var(--ink)]/80">
                  {l}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 페이저 */}
      {pages.length > 1 && (
        <div className="flex items-center justify-between border-t-2 border-black bg-[var(--paper-2)] px-2 py-1.5">
          <button
            type="button"
            onClick={() => setI((v) => Math.max(0, v - 1))}
            disabled={idx === 0}
            className="rounded border border-black bg-white px-2 py-0.5 text-[0.66rem] font-semibold disabled:opacity-35"
          >
            ‹ 이전
          </button>
          <div className="flex items-center gap-1">
            {pages.map((_, k) => (
              <button
                key={k}
                type="button"
                onClick={() => setI(k)}
                aria-label={`${k + 1}페이지`}
                className="size-1.5 rounded-full"
                style={{ background: k === idx ? "var(--ink)" : "rgba(0,0,0,0.22)" }}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setI((v) => Math.min(pages.length - 1, v + 1))}
            disabled={idx === pages.length - 1}
            className="rounded border border-black bg-white px-2 py-0.5 text-[0.66rem] font-semibold disabled:opacity-35"
          >
            다음 ›
          </button>
        </div>
      )}
    </div>
  );
}

function VideoViewer({ artifact }: { artifact: ResultArtifact }) {
  const [play, setPlay] = useState(false);
  const id = artifact.youtubeId;
  if (!id) return <Empty label="영상" />;

  return (
    <div
      className="relative overflow-hidden rounded-lg border-2 border-black bg-black"
      style={{ aspectRatio: "16 / 9" }}
    >
      {play ? (
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube.com/embed/${id}?autoplay=1&rel=0`}
          title={artifact.note}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlay(true)}
          className="group absolute inset-0 h-full w-full"
          aria-label="영상 재생"
        >
          {artifact.poster && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={artifact.poster}
              alt=""
              draggable={false}
              className="absolute inset-0 h-full w-full object-cover opacity-90"
            />
          )}
          <span className="absolute inset-0 bg-black/15 transition-colors group-hover:bg-black/25" aria-hidden />
          <span className="absolute left-1/2 top-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-black bg-white/90 pl-0.5 text-lg shadow transition-transform group-hover:scale-110">
            ▶
          </span>
          <span className="mono-font absolute left-2 top-2 inline-flex items-center gap-1 rounded border border-black bg-white px-1.5 py-0.5 text-[0.5rem] font-bold uppercase tracking-wide">
            ▷ YouTube
          </span>
          {artifact.durationLabel && (
            <span className="mono-font absolute bottom-2 right-2 rounded bg-black/75 px-1.5 py-0.5 text-[0.62rem] font-bold text-white">
              {artifact.durationLabel}
            </span>
          )}
        </button>
      )}
    </div>
  );
}
