import type { RecipeType } from "@/lib/types";

export const krw = (n: number) =>
  n === 0 ? "무료" : "₩" + n.toLocaleString("ko-KR");

/** 재현성 점수 → 색 (기획서 4.3.3) */
export const scoreColor = (s: number) =>
  s >= 90 ? "var(--green)" : s >= 80 ? "var(--amber)" : "var(--verm)";

export const typeLabel: Record<RecipeType, string> = {
  prompt: "PROMPT",
  bundle: "BUNDLE",
  workflow: "WORKFLOW",
  creator: "CREATOR",
};

export const typeGlyph: Record<RecipeType, string> = {
  prompt: "❝",
  bundle: "▤",
  workflow: "⌥",
  creator: "◎",
};

export const compact = (n: number) =>
  n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1) + "k" : String(n);

/** 모델·비용 표시 — 검증/실행에 드는 비용을 모델명에서 파생 (무료 가능 여부 포함) */
export interface ModelCost {
  free: boolean; // 무료 모델/요금제로 실행 가능한가
  label: string; // 칩 라벨
  perRun: string; // 1회 실행 추정 비용
  note: string; // 한 줄 설명
}

// 무료 요금제로 돌릴 수 있는 모델군 (부분 일치)
const FREE_MODELS = ["gemini", "llama"];

/** 모델명 → 실제 실행 가능한 공식 사이트 (내 환경에 적용) */
export interface ModelSite {
  name: string; // 사이트 표기명
  url: string; // 새 탭으로 여는 주소
}

export function modelSite(model: string): ModelSite {
  const m = model.toLowerCase();
  if (m.includes("gpt") || m.includes("chatgpt") || m.includes("dall") || m.includes("o1") || m.includes("o3"))
    return { name: "ChatGPT", url: "https://chatgpt.com/" };
  if (m.includes("claude")) return { name: "Claude", url: "https://claude.ai/" };
  if (m.includes("gemini")) return { name: "Gemini", url: "https://gemini.google.com/app" };
  if (m.includes("midjourney")) return { name: "Midjourney", url: "https://www.midjourney.com/explore" };
  if (m.includes("llama") || m.includes("meta")) return { name: "Meta AI", url: "https://www.meta.ai/" };
  if (m.includes("sdxl") || m.includes("stable")) return { name: "Stability AI", url: "https://stability.ai/" };
  // 알 수 없는 모델 → 검색으로 안내
  return { name: model, url: `https://www.google.com/search?q=${encodeURIComponent(model + " 공식 사이트")}` };
}

export function modelCost(model: string): ModelCost {
  const m = model.toLowerCase();
  const free = FREE_MODELS.some((f) => m.includes(f));
  if (free) {
    return {
      free: true,
      label: "무료 실행 가능",
      perRun: "₩0",
      note: `${model} 무료 요금제로 그대로 실행할 수 있어요.`,
    };
  }
  // 이미지 모델은 구독형, 텍스트 모델은 토큰 종량
  const image = m.includes("midjourney") || m.includes("sdxl") || m.includes("dall");
  return image
    ? { free: false, label: "유료 실행", perRun: "구독 필요", note: `${model}는 구독형 — 별도 크레딧으로 실행돼요.` }
    : { free: false, label: "유료 실행", perRun: "실행당 ~₩30", note: `${model} 유료 API 기준, 1회 실행에 약 ₩30 안팎이 들어요.` };
}
