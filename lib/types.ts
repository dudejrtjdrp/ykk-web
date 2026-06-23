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
