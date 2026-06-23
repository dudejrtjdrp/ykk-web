// ykk 도메인 타입 — 캔버스 노드 / 레시피 / 크리에이터 / 지역

export type RecipeType = "prompt" | "bundle" | "workflow" | "creator";

export type Category =
  | "학업"
  | "취업"
  | "창업"
  | "디자인"
  | "개발"
  | "이미지"
  | "글쓰기"
  | "마케팅";

/** 테마 존 — 임베딩 유사도로 군집화된 영역을 표현 */
export interface Region {
  id: string;
  label: string;
  category: Category;
  cx: number; // world center x
  cy: number; // world center y
  color: string;
}

export interface EnvSpec {
  model: string;
  version: string;
  temperature: number;
  maxTokens: number;
  language: string;
}

export interface VersionEntry {
  tag: string;
  date: string;
  note: string;
}

/** 구매자 결과 갤러리 항목 (매스너리) */
export interface GalleryResult {
  id: string;
  author: string;
  kind: string;
  caption: string;
  aspect: number; // height / width
  color: string;
  image: string; // 목 생성형 이미지 경로 (/mock/gen-NN.png)
}

export interface Review {
  name: string;
  rating: number;
  text: string;
}

/** AI 도움말 — 프롬프트를 문장/블록 단위로 해부한 한 조각 */
export interface PromptSegment {
  label: string; // 이 조각이 맡는 역할 (예: "역할 부여", "출력 형식 고정")
  snippet: string; // 실제 프롬프트에서 발췌한 문장
  effect: string; // 왜 이게 좋은 결과를 만드는지 짧은 설명
}

/** 플랫폼 자동 재실행 검증 로그 (등록 시 1회 실행 → 캐싱) */
export interface VerifyLog {
  runs: number; // 재실행 횟수
  match: number; // 제작자 결과와의 일치율(%) = 재현성
  verifiedAt: string; // 검증 시점 (YYYY-MM-DD)
  model: string; // 검증에 쓰인 모델
  sample: string; // 재실행 결과 요약
}

/** 캔버스에 떠 있는 가벼운 노드(렌더 단위) */
export interface CanvasNode {
  id: string;
  slug: string;
  type: RecipeType;
  title: string;
  category: Category;
  regionId: string;
  creatorId: string;
  creatorName: string;
  priceKrw: number;
  reproducibility: number;
  model: string;
  // world 좌표 (스티커 배치)
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number; // deg, -3 ~ +3
  color: string;
  shape: string; // 종이 컷아웃 실루엣 id (lib/canvas/shapes)
  image: string; // 카드 실루엣을 채우는 썸네일 이미지 (/mock/gen-NN.jpg)
}

/** 상세 페이지용 풀 레시피 */
export interface Recipe extends CanvasNode {
  summary: string;
  badge: string;
  env: EnvSpec;
  version: string;
  versionHistory: VersionEntry[];
  results: GalleryResult[];
  reviews: Review[];
  beforeSample: string;
  afterSample: string;
  bundleCount?: number;
  steps?: string[];
  /** AI 도움말 본문 — 구매 후 노출. 없으면 steps/summary에서 파생 */
  promptBody?: string;
  anatomy?: PromptSegment[];
  /** 자동 검증 비교 로그 — buildRecipe에서 파생 주입 */
  verify?: VerifyLog;
}

export interface Creator {
  id: string;
  handle: string;
  name: string;
  bio: string;
  verified: boolean;
  followers: number;
  sales: number;
  avgRepro: number;
  regionId: string;
  color: string;
  recipeSlugs: string[];
}

/** world-space 사각형 (뷰포트 질의용) */
export interface WorldRect {
  x: number;
  y: number;
  w: number;
  h: number;
}
