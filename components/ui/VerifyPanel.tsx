// 자동 검증 비교 (솔루션 ① 자동 검증 비교)
//  · 판매자 제출 결과 vs 플랫폼이 자동 재실행한 결과를 나란히 노출
//  · 별점이 아니라 "실제로 재현되는 결과"로 신뢰를 판다
//  · 검증은 등록 시 1회 → 캐싱. 비용은 판매량이 아니라 등록량에 비례
import type { VerifyLog } from "@/lib/types";
import { scoreColor } from "@/lib/format";

function Meta({ k, v }: { k: string; v: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border-2 border-black bg-[var(--paper-2)] px-2.5 py-1">
      <span className="mono-font text-[0.55rem] uppercase tracking-[0.12em] text-black/50">{k}</span>
      <span className="mono-font text-xs font-bold">{v}</span>
    </span>
  );
}

export function VerifyPanel({
  verify,
  sellerOutput,
}: {
  verify: VerifyLog;
  sellerOutput: string;
}) {
  const c = scoreColor(verify.match);
  return (
    <div className="sticker p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mono-font text-[0.62rem] uppercase tracking-[0.2em] text-black/55">
          auto verification
        </span>
        <span
          className="pill inline-flex items-center gap-1 px-2.5 py-0.5 text-[0.7rem] font-bold"
          style={{ background: "var(--mint)" }}
        >
          ✓ 검증 통과
        </span>
        <span
          className="ml-auto inline-flex items-center gap-1.5 text-sm font-bold"
          style={{ color: c }}
        >
          <span className="size-2 rounded-full" style={{ background: c }} aria-hidden />
          {verify.match}% 일치
        </span>
      </div>

      <h2 className="mt-1 display-font text-2xl font-black">시스템이 직접 돌려 확인했어요</h2>
      <p className="mt-1 max-w-2xl text-sm leading-6 text-black/65">
        등록되면 시스템이 프롬프트를 자동 실행해 결과를 만들고, 판매자가 올린 결과와 나란히 둡니다.
        별점이 아니라 <b>실제로 재현되는 결과</b>를 보고 판단하세요.
      </p>

      {/* 두 열 비교: 판매자 제출 vs 플랫폼 자동 재실행 */}
      <div className="mt-3 grid grid-cols-1 gap-px overflow-hidden rounded-xl border-2 border-black bg-black/10 sm:grid-cols-2">
        <div className="bg-[var(--paper-2)] p-3.5">
          <span className="mono-font rounded-full border-2 border-black bg-white px-2 py-0.5 text-[0.55rem] font-bold uppercase tracking-[0.14em]">
            판매자 제출 결과
          </span>
          <p className="mt-2 text-sm leading-6 text-black/80">{sellerOutput}</p>
        </div>
        <div className="bg-[var(--paper)] p-3.5">
          <span
            className="mono-font inline-flex items-center gap-1 rounded-full border-2 border-black px-2 py-0.5 text-[0.55rem] font-bold uppercase tracking-[0.14em]"
            style={{ background: "var(--mint)" }}
          >
            플랫폼 자동 재실행
          </span>
          <p className="mt-2 text-sm leading-6 text-black/80">{verify.sample}</p>
        </div>
      </div>

      {/* 메타 + 캐싱/비용 노트 */}
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
