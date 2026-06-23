"use client";

// 주의사항 카드 — 구매 전 지켜야 할 금지 항목 + 알아둘 점.
// 프롬프트 마켓 표준 라이선스(재배포·재판매 금지, 결과 비보장, 실행 비용 별도)를
// ykk 종이 미감으로 옮긴 섹션. 레시피별 cautions가 없으면 플랫폼 공통값을 쓴다.
import type { CautionItem, RecipeCautions } from "@/lib/types";

/** 플랫폼 공통 주의사항 — 모든 레시피에 기본 적용된다 */
export const DEFAULT_CAUTIONS: RecipeCautions = {
  prohibited: [
    {
      title: "재배포·재판매 금지",
      body: "구매한 레시피(프롬프트 본문·번들)를 그대로 또는 일부만 고쳐 재판매·공유·배포할 수 없어요. 구매는 이용 권리이지 저작권 양도가 아니에요.",
    },
    {
      title: "원문 공개 금지",
      body: "프롬프트 본문을 블로그·강의·다른 마켓 등 외부에 그대로 게시하면 안 돼요. 결과물은 공유해도 프롬프트 자체는 비공개로 사용하세요.",
    },
    {
      title: "제작자 표기 삭제·도용 금지",
      body: "본인이 만든 레시피처럼 다시 등록하거나, 제작자 정보를 지우고 재가공해 올리면 안 돼요.",
    },
    {
      title: "불법·침해 용도 금지",
      body: "타인의 저작권·초상권을 침해하거나 불법·유해 콘텐츠를 만드는 데 사용할 수 없어요.",
    },
  ],
  notes: [
    {
      title: "결과는 100% 보장되지 않아요",
      body: "재현성(%)은 동일 환경에서의 재실행 일치율 지표예요. AI 특성상 실행마다 결과가 달라질 수 있고, 모델이 업데이트되면 품질이 바뀔 수 있어요.",
    },
    {
      title: "실행 비용은 별도예요",
      body: "유료 모델은 본인 계정의 토큰·API 사용료가 따로 들어요. 환경 카드의 비용 표기를 확인하세요.",
    },
    {
      title: "결과물 활용·표시는 사용자 책임",
      body: "생성물의 상업적 이용 가능 여부와 AI 생성물 표시 의무는 사용자가 확인·책임져요.",
    },
  ],
};

function CautionRow({
  item,
  tone,
}: {
  item: CautionItem;
  tone: "stop" | "note";
}) {
  const stop = tone === "stop";
  return (
    <li className="flex gap-3">
      <span
        aria-hidden
        className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border-2 border-black text-[0.8rem] font-black leading-none text-white"
        style={{ background: stop ? "var(--verm)" : "var(--amber)" }}
      >
        {stop ? "✕" : "!"}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-bold leading-snug text-black">{item.title}</p>
        <p className="mt-0.5 text-[0.82rem] leading-6 text-black/70">{item.body}</p>
      </div>
    </li>
  );
}

export function CautionCard({ cautions }: { cautions?: RecipeCautions }) {
  const data = cautions ?? DEFAULT_CAUTIONS;

  return (
    <section className="sticker p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className="grid size-7 place-items-center rounded-full border-2 border-black bg-[var(--sun)] text-sm font-black"
        >
          !
        </span>
        <div>
          <p className="mono-font text-[0.62rem] uppercase tracking-[0.2em] text-black/55">
            before you buy
          </p>
          <h2 className="display-font text-2xl font-black leading-none">주의사항</h2>
        </div>
      </div>

      {/* 하면 안 돼요 */}
      {data.prohibited.length > 0 && (
        <div className="mt-4">
          <p className="mono-font mb-2 inline-flex items-center gap-1.5 rounded-full border-2 border-black bg-[var(--paper-2)] px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.14em]">
            <span className="size-1.5 rounded-full" style={{ background: "var(--verm)" }} aria-hidden />
            이것만은 하지 마세요
          </p>
          <ul className="space-y-3">
            {data.prohibited.map((item) => (
              <CautionRow key={item.title} item={item} tone="stop" />
            ))}
          </ul>
        </div>
      )}

      {/* 구매 전 알아두기 */}
      {data.notes.length > 0 && (
        <div className="mt-4 border-t-2 border-dashed border-black/15 pt-4">
          <p className="mono-font mb-2 inline-flex items-center gap-1.5 rounded-full border-2 border-black bg-[var(--paper-2)] px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.14em]">
            <span className="size-1.5 rounded-full" style={{ background: "var(--amber)" }} aria-hidden />
            구매 전 알아두기
          </p>
          <ul className="space-y-3">
            {data.notes.map((item) => (
              <CautionRow key={item.title} item={item} tone="note" />
            ))}
          </ul>
        </div>
      )}

      <p className="mono-font mt-4 text-[0.66rem] leading-5 text-black/45">
        레시피 구매 시 위 약관에 동의한 것으로 간주돼요. 위반 시 이용 권리가 회수될 수 있어요.
      </p>
    </section>
  );
}
