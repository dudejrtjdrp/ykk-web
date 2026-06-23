// 결과물 비교 (솔루션 ① 자동 검증) — 미디어 우선
//  · 상단: 판매자가 올린 결과(미디어)  vs  서버가 재실행한 결과(미디어)
//  · 하단: 두 결과의 차이를 텍스트로 설명 → 재현성 비율(%)로 환산
//  · 상세(full)·모달(compact) 양쪽에서 같은 컴포넌트를 쓴다
import type { VerifyLog } from "@/lib/types";
import { scoreColor } from "@/lib/format";
import { formatLabel } from "@/lib/output-formats";
import { ResultViewer } from "@/components/ui/ResultViewer";

function Meta({ k, v }: { k: string; v: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border-2 border-black bg-[var(--paper-2)] px-2.5 py-1">
      <span className="mono-font text-[0.55rem] uppercase tracking-[0.12em] text-black/50">{k}</span>
      <span className="mono-font text-xs font-bold">{v}</span>
    </span>
  );
}

export function ResultCompare({
  verify,
  variant = "full",
}: {
  verify: VerifyLog;
  variant?: "full" | "compact";
}) {
  const c = scoreColor(verify.match);
  const compact = variant === "compact";

  // ── 미디어 두 열: 판매자 제출 vs 서버 재실행 (텍스트 아님) ──
  const media = (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div>
        <span className="mono-font inline-flex items-center rounded-full border-2 border-black bg-white px-2 py-0.5 text-[0.55rem] font-bold uppercase tracking-[0.12em]">
          판매자가 올린 결과
        </span>
        <div className="mt-2">
          <ResultViewer artifact={verify.sellerResult} compact={compact} />
        </div>
        <p className="mt-1.5 text-[0.72rem] leading-5 text-black/55">{verify.sellerResult.note}</p>
      </div>
      <div>
        <span
          className="mono-font inline-flex items-center rounded-full border-2 border-black px-2 py-0.5 text-[0.55rem] font-bold uppercase tracking-[0.12em]"
          style={{ background: "var(--mint)" }}
        >
          우리 서버가 재실행한 결과
        </span>
        <div className="mt-2">
          <ResultViewer artifact={verify.serverResult} compact={compact} />
        </div>
        <p className="mt-1.5 text-[0.72rem] leading-5 text-black/55">{verify.serverResult.note}</p>
      </div>
    </div>
  );

  // ── 하단 텍스트 설명: 차이 → 재현성 환산 ──
  const diffToScore = (
    <div className="mt-3 flex flex-col gap-3 rounded-xl border-2 border-black bg-white p-3.5 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <span className="mono-font text-[0.55rem] font-bold uppercase tracking-[0.14em] text-black/45">
          두 결과의 차이
        </span>
        <p className="mt-1 text-sm leading-6 text-black/80">{verify.diff}</p>
      </div>
      <span className="hidden text-2xl text-black/30 sm:block" aria-hidden>
        →
      </span>
      <div
        className="flex shrink-0 items-center justify-between gap-3 rounded-lg border-2 border-black px-3 py-2 sm:flex-col sm:items-center sm:justify-center sm:text-center"
        style={{ background: `color-mix(in srgb, ${c} 18%, white)` }}
      >
        <span className="mono-font text-[0.55rem] font-bold uppercase tracking-[0.14em] text-black/55">
          재현성
        </span>
        <span className="display-font text-2xl font-black leading-none" style={{ color: c }}>
          {verify.match}%
        </span>
      </div>
    </div>
  );

  if (compact) {
    return (
      <div>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <h3 className="text-[0.92rem] font-semibold tracking-tight text-[var(--ink)]">결과물 · 재현성 검증</h3>
          <span className="mono-font rounded-full border border-black/15 bg-[var(--paper-2)] px-2 py-0.5 text-[0.58rem] font-bold text-black/55">
            {formatLabel[verify.outputFormat]}
          </span>
          <span className="ml-auto inline-flex items-center gap-1.5 text-sm font-bold" style={{ color: c }}>
            <span className="size-2 rounded-full" style={{ background: c }} aria-hidden />
            {verify.match}% 일치
          </span>
        </div>
        {media}
        {diffToScore}
        <p className="mono-font mt-2 text-[0.66rem] leading-5 text-black/50">
          등록 시 {verify.runs}회 재실행 · {verify.model} 검증 — 텍스트가 아니라 실제 결과물을 눈으로 비교하세요.
        </p>
      </div>
    );
  }

  // full (상세 페이지)
  return (
    <div className="sticker p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mono-font text-[0.62rem] uppercase tracking-[0.2em] text-black/55">auto verification</span>
        <span className="pill inline-flex items-center gap-1 px-2.5 py-0.5 text-[0.7rem] font-bold" style={{ background: "var(--mint)" }}>
          ✓ 검증 통과
        </span>
        <span className="mono-font rounded-full border border-black/15 bg-[var(--paper-2)] px-2 py-0.5 text-[0.62rem] font-bold text-black/55">
          {formatLabel[verify.outputFormat]}
        </span>
        <span className="ml-auto inline-flex items-center gap-1.5 text-sm font-bold" style={{ color: c }}>
          <span className="size-2 rounded-full" style={{ background: c }} aria-hidden />
          {verify.match}% 일치
        </span>
      </div>

      <h2 className="mt-1 display-font text-2xl font-black">판매자 결과 vs 서버 재실행 — 눈으로 비교하세요</h2>
      <p className="mt-1 max-w-2xl text-sm leading-6 text-black/65">
        등록되면 시스템이 동일 환경에서 자동 실행해 결과물을 만들고, <b>판매자가 올린 결과</b>와 나란히 둡니다. 두
        결과물의 차이를 측정해 <b>재현성 비율</b>로 환산해요 — 별점이 아니라 실제로 재현되는 결과를 보고 판단하세요.
      </p>

      <div className="mt-3">{media}</div>
      {diffToScore}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Meta k="재실행" v={`${verify.runs}회`} />
        <Meta k="검증 모델" v={verify.model} />
        <Meta k="검증일" v={verify.verifiedAt} />
      </div>
      <p className="mono-font mt-2 text-[0.66rem] leading-5 text-black/50">
        등록 시 1회 검증 후 캐싱 — 검증 비용은 판매량이 아니라 등록량에 비례합니다.
      </p>
    </div>
  );
}
