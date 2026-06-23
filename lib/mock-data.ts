// ykk 목 데이터 — 지역(테마 존) · 크리에이터 · 레시피 콘텐츠 + 결정론적 캔버스 노드 생성
// ⚠️ 모든 좌표/회전은 시드 고정 PRNG로 생성 → SSR/CSR 하이드레이션 일치
import { clamp, mulberry32 } from "@/lib/canvas/math";
import { WORLD } from "@/lib/canvas/constants";
import { CUT_SHAPES } from "@/lib/canvas/shapes";
import type {
  CanvasNode,
  Category,
  Creator,
  EnvSpec,
  GalleryResult,
  Recipe,
  RecipeType,
  Region,
  Review,
  VersionEntry,
} from "@/lib/types";

export const categories: Category[] = [
  "학업",
  "취업",
  "창업",
  "디자인",
  "개발",
  "이미지",
  "글쓰기",
  "마케팅",
];

export const CATEGORY_COLOR: Record<Category, string> = {
  학업: "#8ecbf1",
  취업: "#ffd54d",
  창업: "#f5a78e",
  디자인: "#c7f0d3",
  개발: "#b9c4ff",
  이미지: "#f3c4e6",
  글쓰기: "#f3f0c4",
  마케팅: "#ffd0b8",
};

// 테마 존 중심 — 카테고리끼리 모은 기준 좌표.
// REGION_SPREAD가 작을수록 존끼리 더 모여 사이 여백이 줄어든다. (기준 배치 × SPREAD)
const REGION_SPREAD = 0.55;

const REGION_BASE: { id: string; label: string; category: Category; cx: number; cy: number }[] = [
  { id: "r-study", label: "학업", category: "학업", cx: -3500, cy: -1700 },
  { id: "r-job", label: "취업", category: "취업", cx: -700, cy: -2750 },
  { id: "r-startup", label: "창업", category: "창업", cx: 2900, cy: -2000 },
  { id: "r-dev", label: "개발", category: "개발", cx: 3900, cy: 400 },
  { id: "r-image", label: "이미지 생성", category: "이미지", cx: 2500, cy: 2300 },
  { id: "r-design", label: "디자인", category: "디자인", cx: -1000, cy: 1700 },
  { id: "r-writing", label: "글쓰기", category: "글쓰기", cx: -3800, cy: 1300 },
  { id: "r-marketing", label: "마케팅", category: "마케팅", cx: 600, cy: -150 },
];

export const regions: Region[] = REGION_BASE.map((r) => ({
  ...r,
  cx: Math.round(r.cx * REGION_SPREAD),
  cy: Math.round(r.cy * REGION_SPREAD),
  color: CATEGORY_COLOR[r.category],
}));

export const regionsById: Record<string, Region> = Object.fromEntries(
  regions.map((r) => [r.id, r]),
);

export const creators: Creator[] = [
  { id: "c-junho", handle: "junho.makes", name: "이준호", bio: "발표·문서 자동화에 진심인 경영학과 4학년. 슬라이드는 구조가 8할.", verified: true, followers: 3120, sales: 1840, avgRepro: 93, regionId: "r-study", color: "#8ecbf1", recipeSlugs: [] },
  { id: "c-seoyeon", handle: "seoyeon.kit", name: "김서연", bio: "자소서·면접 코칭 3년. 합격하는 문장에는 패턴이 있다.", verified: true, followers: 5280, sales: 3410, avgRepro: 91, regionId: "r-job", color: "#ffd54d", recipeSlugs: [] },
  { id: "c-minjae", handle: "minjae.deck", name: "박민재", bio: "예비창업패키지 출신. IR과 데이터 리서치 자동화.", verified: true, followers: 2740, sales: 1290, avgRepro: 95, regionId: "r-startup", color: "#f5a78e", recipeSlugs: [] },
  { id: "c-arin", handle: "arin.codes", name: "정아린", bio: "풀스택 개발자. 검증된 프롬프트 체인만 올립니다.", verified: true, followers: 6210, sales: 2980, avgRepro: 96, regionId: "r-dev", color: "#b9c4ff", recipeSlugs: [] },
  { id: "c-doha", handle: "doha.pixels", name: "한도하", bio: "비주얼 디렉터. 미드저니/SDXL 시드까지 공개하는 사람.", verified: true, followers: 8430, sales: 4120, avgRepro: 89, regionId: "r-image", color: "#f3c4e6", recipeSlugs: [] },
  { id: "c-yuna", handle: "yuna.layout", name: "오유나", bio: "프로덕트 디자이너. 컴포넌트 사고를 프롬프트로.", verified: false, followers: 1980, sales: 760, avgRepro: 90, regionId: "r-design", color: "#c7f0d3", recipeSlugs: [] },
  { id: "c-sehun", handle: "sehun.writes", name: "임세훈", bio: "카피라이터. 글의 톤은 온도다.", verified: false, followers: 2210, sales: 980, avgRepro: 88, regionId: "r-writing", color: "#f3f0c4", recipeSlugs: [] },
  { id: "c-jiwoo", handle: "jiwoo.growth", name: "신지우", bio: "그로스 마케터. 퍼포먼스 카피 A/B의 정석.", verified: true, followers: 3870, sales: 2010, avgRepro: 92, regionId: "r-marketing", color: "#ffd0b8", recipeSlugs: [] },
];
export const creatorsById: Record<string, Creator> = Object.fromEntries(
  creators.map((c) => [c.id, c]),
);

// ---------- 저작(rich) 레시피 콘텐츠 ----------
interface RecipeContent {
  slug: string;
  title: string;
  type: RecipeType;
  category: Category;
  creatorId: string;
  priceKrw: number;
  reproducibility: number;
  model: string;
  version: string;
  badge: string;
  summary: string;
  env: EnvSpec;
  versionHistory: VersionEntry[];
  results: GalleryResult[];
  reviews: Review[];
  beforeSample: string;
  afterSample: string;
  bundleCount?: number;
  steps?: string[];
}

const G = (id: string, author: string, kind: string, caption: string, aspect: number, color: string): GalleryResult => ({ id, author, kind, caption, aspect, color, image: "" });

const MOCK_IMG_COUNT = 18;
const mockImg = (n: number) => `/mock/gen-${String((n % MOCK_IMG_COUNT) + 1).padStart(2, "0")}.jpg`;

export const recipeContents: RecipeContent[] = [
  {
    slug: "presentation-a-plus",
    title: "A+ 발표자료 레시피",
    type: "prompt",
    category: "학업",
    creatorId: "c-junho",
    priceKrw: 19000,
    reproducibility: 94,
    model: "GPT-5",
    version: "v1.2",
    badge: "Verified Prompt",
    summary: "주제 분해 → 슬라이드 구조화 → 발표자 노트까지 한 번에 생성하는 대학생 발표용 레시피.",
    env: { model: "GPT-5", version: "2026-06", temperature: 0.7, maxTokens: 4000, language: "KO" },
    versionHistory: [
      { tag: "v1.0", date: "2026-05-02", note: "기본 발표 흐름과 슬라이드 구조 확립" },
      { tag: "v1.1", date: "2026-05-21", note: "도표 생성 지시와 요약 품질 개선" },
      { tag: "v1.2", date: "2026-06-12", note: "교수 평가 기준에 맞춘 문장 톤 조정" },
    ],
    results: [
      G("g1", "민서", "공모전", "발표 12장 + 발표자 노트", 1.3, "#8ecbf1"),
      G("g2", "지훈", "수업 발표", "8장 압축 구성", 0.8, "#ffd54d"),
      G("g3", "수아", "학회", "포스터형 1장 요약", 1.1, "#c7f0d3"),
      G("g4", "현수", "조별과제", "역할 분담 슬라이드", 0.9, "#f3c4e6"),
    ],
    reviews: [
      { name: "민서", rating: 5, text: "구조가 바로 잡혀서 준비 시간이 절반으로 줄었어요." },
      { name: "지훈", rating: 5, text: "예시랑 결과가 거의 같아서 신뢰가 갔습니다." },
    ],
    beforeSample: "발표 주제: 'ESG 경영 사례' — 그냥 자료 찾아서 슬라이드 채움. 흐름이 들쭉날쭉.",
    afterSample: "주제를 3개 핵심 주장으로 분해 → 각 주장에 근거 슬라이드 1장 + 데이터 시각화 지시 + 발표자 노트(말할 문장)까지 자동 구성.",
    steps: ["주제 분해", "주장-근거 매핑", "슬라이드 골격", "비주얼 지시", "발표자 노트"],
  },
  {
    slug: "job-statement-kit",
    title: "자기소개서·면접 키트",
    type: "bundle",
    category: "취업",
    creatorId: "c-seoyeon",
    priceKrw: 24000,
    reproducibility: 91,
    model: "Claude",
    version: "v2.0",
    badge: "Top Creator",
    summary: "자소서 초안 → STAR 구조화 → 예상 질문 → 면접 답변 리허설까지 이어지는 취업 준비 번들.",
    env: { model: "Claude 3.7", version: "2026-05", temperature: 0.5, maxTokens: 3000, language: "KO" },
    versionHistory: [
      { tag: "v1.0", date: "2026-04-28", note: "자소서 초안과 첨삭 흐름 추가" },
      { tag: "v1.5", date: "2026-05-18", note: "면접 질문 생성·모의답변 추가" },
      { tag: "v2.0", date: "2026-06-18", note: "직무별 맞춤 리포트로 재설계" },
    ],
    results: [
      G("g1", "수빈", "대기업", "서류 합격 자소서", 1.4, "#ffd54d"),
      G("g2", "도현", "스타트업", "면접 리허설 로그", 0.9, "#8ecbf1"),
      G("g3", "예나", "공기업", "직무 역량 매핑", 1.1, "#ffd0b8"),
    ],
    reviews: [
      { name: "수빈", rating: 5, text: "면접 질문이 현실적이라 실전 대비에 좋았어요." },
      { name: "도현", rating: 4, text: "업데이트 내역이 보여서 구매가 쉬웠습니다." },
    ],
    beforeSample: "자소서 문항에 경험을 나열만 함. 'STAR'가 뭔지도 모르고 두루뭉술.",
    afterSample: "경험을 Situation–Task–Action–Result로 자동 구조화하고, 직무 키워드에 맞춰 문장을 재작성. 예상 면접 질문 12개와 모범 답변까지.",
    bundleCount: 4,
    steps: ["자소서 초안", "STAR 구조화", "예상 질문", "모의 답변"],
  },
  {
    slug: "startup-ir-deck",
    title: "스타트업 IR Deck 플로우",
    type: "workflow",
    category: "창업",
    creatorId: "c-minjae",
    priceKrw: 29000,
    reproducibility: 96,
    model: "GPT-5",
    version: "v1.4",
    badge: "Premium",
    summary: "시장조사 → BM 정리 → 투자자 시나리오까지 포함하는 초기 창업용 피치덱 제작 워크플로우.",
    env: { model: "GPT-5", version: "2026-06", temperature: 0.4, maxTokens: 5000, language: "KO+EN" },
    versionHistory: [
      { tag: "v1.0", date: "2026-05-08", note: "시장조사·가설 검증 흐름 구성" },
      { tag: "v1.2", date: "2026-05-26", note: "IR 발표용 구조·카피 개선" },
      { tag: "v1.4", date: "2026-06-20", note: "데이터 리서치·Q&A 대응 섹션 추가" },
    ],
    results: [
      G("g1", "예진", "데모데이", "10장 피치덱", 1.3, "#f5a78e"),
      G("g2", "현우", "예창패", "사업계획서 제출본", 1.5, "#b9c4ff"),
      G("g3", "보람", "IR", "투자자 Q&A 스크립트", 0.85, "#ffd54d"),
    ],
    reviews: [
      { name: "예진", rating: 5, text: "흐름이 깔끔해서 바로 적용했어요." },
      { name: "현우", rating: 5, text: "재현성 점수가 높아 안심됐습니다." },
    ],
    beforeSample: "아이디어는 있는데 투자자에게 어떻게 보여줄지 막막. 덱이 산만함.",
    afterSample: "문제–해결–시장(TAM/SAM/SOM)–BM–트랙션–팀–Ask의 표준 IR 구조로 10장 생성. 각 장 발표 스크립트와 예상 Q&A까지.",
    steps: ["시장조사", "BM 캔버스", "IR 골격", "카피라이팅", "Q&A 대응"],
  },
  {
    slug: "rag-chain-starter",
    title: "RAG 체인 스타터 워크플로우",
    type: "workflow",
    category: "개발",
    creatorId: "c-arin",
    priceKrw: 34000,
    reproducibility: 96,
    model: "Claude",
    version: "v3.1",
    badge: "Dev Verified",
    summary: "문서 임베딩 → 검색 → 리랭크 → 답변 생성까지, 환각을 줄이는 RAG 파이프라인 프롬프트 체인.",
    env: { model: "Claude 3.7", version: "2026-06", temperature: 0.2, maxTokens: 4096, language: "EN" },
    versionHistory: [
      { tag: "v2.0", date: "2026-04-10", note: "리랭킹 단계와 인용 강제 추가" },
      { tag: "v3.0", date: "2026-05-22", note: "툴 콜링·구조화 출력 스키마 도입" },
      { tag: "v3.1", date: "2026-06-19", note: "환각 가드레일·평가 프롬프트 보강" },
    ],
    results: [
      G("g1", "tae", "사내봇", "정확도 +18%p", 0.8, "#b9c4ff"),
      G("g2", "lia", "문서검색", "인용 포함 응답", 1.2, "#8ecbf1"),
      G("g3", "kev", "고객지원", "오답률 절반", 1.0, "#c7f0d3"),
    ],
    reviews: [
      { name: "tae", rating: 5, text: "프롬프트 스키마가 바로 붙여 쓸 수준이에요." },
      { name: "lia", rating: 5, text: "온도·토큰까지 공개돼서 재현이 정확했습니다." },
    ],
    beforeSample: "LLM에 그냥 질문 → 그럴듯하지만 출처 없는 환각 답변.",
    afterSample: "검색된 청크만 근거로 쓰도록 강제하고, 인용 ID를 구조화 출력으로 반환. 평가 프롬프트로 답변 신뢰도를 자가 채점.",
    steps: ["임베딩", "검색", "리랭크", "근거 강제", "자가 평가"],
  },
  {
    slug: "midjourney-product-shot",
    title: "미드저니 제품샷 시드팩",
    type: "bundle",
    category: "이미지",
    creatorId: "c-doha",
    priceKrw: 22000,
    reproducibility: 88,
    model: "Midjourney",
    version: "v2.2",
    badge: "Seed Included",
    summary: "스튜디오 조명 제품 사진을 일관되게 뽑는 프롬프트 + 시드 + 파라미터 번들.",
    env: { model: "Midjourney v7", version: "2026-06", temperature: 0, maxTokens: 0, language: "EN" },
    versionHistory: [
      { tag: "v2.0", date: "2026-04-30", note: "조명 프리셋 4종 정리" },
      { tag: "v2.2", date: "2026-06-15", note: "배경 분리·그림자 일관성 개선" },
    ],
    results: [
      G("g1", "nina", "코스메틱", "화장품 3컷", 1.0, "#f3c4e6"),
      G("g2", "ray", "전자제품", "이어버드 누끼", 0.9, "#8ecbf1"),
      G("g3", "mona", "F&B", "음료 스튜디오샷", 1.4, "#ffd0b8"),
      G("g4", "ken", "패션", "신발 측면샷", 0.8, "#c7f0d3"),
    ],
    reviews: [
      { name: "nina", rating: 5, text: "시드를 줘서 같은 룩이 진짜 재현됐어요." },
      { name: "ray", rating: 4, text: "파라미터 설명이 친절합니다." },
    ],
    beforeSample: "제품 사진 프롬프트마다 톤이 달라서 브랜드 일관성이 깨짐.",
    afterSample: "고정 시드 + 조명/렌즈/배경 파라미터를 묶어, 매번 같은 스튜디오 룩의 제품샷을 생성. 누끼·그림자까지 일관.",
    bundleCount: 6,
  },
  {
    slug: "design-system-prompt",
    title: "디자인 시스템 토큰 생성기",
    type: "prompt",
    category: "디자인",
    creatorId: "c-yuna",
    priceKrw: 18000,
    reproducibility: 90,
    model: "GPT-5",
    version: "v1.1",
    badge: "Verified Prompt",
    summary: "브랜드 키워드에서 컬러·타이포·스페이싱 토큰과 컴포넌트 가이드를 한 번에 뽑는 프롬프트.",
    env: { model: "GPT-5", version: "2026-06", temperature: 0.6, maxTokens: 3500, language: "KO+EN" },
    versionHistory: [
      { tag: "v1.0", date: "2026-05-12", note: "토큰 스케일 생성 로직" },
      { tag: "v1.1", date: "2026-06-10", note: "접근성 대비 체크 단계 추가" },
    ],
    results: [
      G("g1", "rin", "앱", "라이트/다크 토큰", 1.1, "#c7f0d3"),
      G("g2", "max", "웹", "타이포 스케일", 0.9, "#b9c4ff"),
    ],
    reviews: [
      { name: "rin", rating: 5, text: "토큰 네이밍이 실무 그대로라 바로 썼어요." },
      { name: "max", rating: 4, text: "대비 체크까지 해줘서 좋네요." },
    ],
    beforeSample: "컬러를 감으로 고르고 토큰 네이밍이 제각각.",
    afterSample: "브랜드 키워드 → HSL 스케일 + 시맨틱 토큰 + WCAG 대비 검증 + 컴포넌트별 사용 가이드를 일관된 네이밍으로 출력.",
    steps: ["키워드 분석", "컬러 스케일", "타이포/스페이싱", "대비 검증"],
  },
  {
    slug: "essay-tone-tuner",
    title: "에세이 톤 튜너",
    type: "prompt",
    category: "글쓰기",
    creatorId: "c-sehun",
    priceKrw: 14000,
    reproducibility: 88,
    model: "Claude",
    version: "v1.3",
    badge: "Verified Prompt",
    summary: "같은 내용을 6가지 톤(담백·따뜻·단정·위트…)으로 재작성하고 톤 일관성을 유지하는 프롬프트.",
    env: { model: "Claude 3.7", version: "2026-05", temperature: 0.8, maxTokens: 2000, language: "KO" },
    versionHistory: [
      { tag: "v1.0", date: "2026-03-30", note: "톤 6종 프리셋" },
      { tag: "v1.3", date: "2026-06-08", note: "문단 단위 톤 고정 기능" },
    ],
    results: [
      G("g1", "joy", "블로그", "따뜻한 톤 리라이트", 1.2, "#f3f0c4"),
      G("g2", "sun", "뉴스레터", "담백한 톤", 0.85, "#ffd0b8"),
    ],
    reviews: [
      { name: "joy", rating: 5, text: "톤이 진짜 일관되게 유지돼요." },
      { name: "sun", rating: 4, text: "예시 비교가 명확합니다." },
    ],
    beforeSample: "글마다 톤이 흔들리고 AI 티가 남.",
    afterSample: "원문의 의미는 유지하면서 지정한 톤으로 문단 단위 재작성. 톤 가이드 표를 함께 출력해 일관성 유지.",
  },
  {
    slug: "growth-ad-ab",
    title: "퍼포먼스 광고 A/B 카피 세트",
    type: "bundle",
    category: "마케팅",
    creatorId: "c-jiwoo",
    priceKrw: 21000,
    reproducibility: 92,
    model: "GPT-5",
    version: "v2.1",
    badge: "Top Creator",
    summary: "타깃·오퍼 입력 → 후크 10종 + A/B 변형 + 채널별 길이 최적화 카피를 생성하는 번들.",
    env: { model: "GPT-5", version: "2026-06", temperature: 0.9, maxTokens: 2500, language: "KO" },
    versionHistory: [
      { tag: "v2.0", date: "2026-05-15", note: "채널별(메타/구글/틱톡) 포맷 분리" },
      { tag: "v2.1", date: "2026-06-17", note: "금칙어·과장표현 가드 추가" },
    ],
    results: [
      G("g1", "bom", "메타", "CTR 2.1x 후크", 0.8, "#ffd0b8"),
      G("g2", "kai", "구글", "검색 카피 세트", 1.0, "#ffd54d"),
      G("g3", "via", "틱톡", "훅 스크립트", 1.5, "#f3c4e6"),
    ],
    reviews: [
      { name: "bom", rating: 5, text: "후크 다양성이 좋아서 테스트가 빨라졌어요." },
      { name: "kai", rating: 5, text: "채널 포맷까지 맞춰줘서 편합니다." },
    ],
    beforeSample: "광고 카피를 한두 개 써보고 감으로 집행.",
    afterSample: "타깃·오퍼에서 서로 다른 심리 후크 10종을 뽑고, 각 후크를 채널 규격(길이/포맷)에 맞춰 A/B 변형으로 확장.",
    bundleCount: 10,
  },
];

// 결과 갤러리에 목 생성형 이미지를 결정론적으로 매핑 (전 데이터에 고루 분산)
let _imgCursor = 0;
for (const c of recipeContents) {
  for (const r of c.results) {
    r.image = mockImg(_imgCursor++);
  }
}

export const contentBySlug: Record<string, RecipeContent> = Object.fromEntries(
  recipeContents.map((c) => [c.slug, c]),
);
const contentByCategory: Record<string, RecipeContent[]> = {};
for (const c of recipeContents) {
  (contentByCategory[c.category] ||= []).push(c);
}

// ---------- 캔버스 노드 결정론적 생성 ----------
// 카드는 텍스트 없는 "종이 컷아웃 실루엣" — 다양한 형태 + 다양한 크기로 흩뿌린다.
const MIN_SIDE = 80;
const MAX_SIDE = 264; // 공간 인덱스 MAX_HALF(150)와 정합

/** 결정론적으로 셰이프 + 크기(형태 비율 반영)를 뽑는다 */
function pickShapeSize(rng: () => number, prominent: boolean) {
  const shape = CUT_SHAPES[Math.floor(rng() * CUT_SHAPES.length)];
  // 긴 변 길이 — 저작 레시피는 살짝 크게(눈에 띄게)
  const long = prominent ? 196 + rng() * 70 : 128 + rng() * 120;
  let w: number;
  let h: number;
  if (shape.aspect >= 1) {
    w = long;
    h = long / shape.aspect;
  } else {
    h = long;
    w = long * shape.aspect;
  }
  w = Math.max(MIN_SIDE, Math.min(MAX_SIDE, w));
  h = Math.max(MIN_SIDE, Math.min(MAX_SIDE, h));
  return { shape: shape.id, w: Math.round(w), h: Math.round(h) };
}

/**
 * 충돌 완화(spacing) — 카드끼리 과하게 겹치지 않도록 밀어낸다.
 * 약한 겹침은 허용(ALLOW), 과한 겹침은 방지. rng 미사용 → SSR/CSR 결정론 유지.
 */
function relaxNodes(nodes: CanvasNode[]) {
  const n = nodes.length;
  // 외접원 반지름(bbox 대각선의 절반) → 두 원이 안 겹치면 실루엣은 절대 안 겹침
  const rad = nodes.map((d) => 0.5 * Math.hypot(d.w, d.h));
  const GAP = 6; // 목표 최소 여백(world px) — 작게: 카드끼리 가깝게
  const ALLOW = 0; // 겹침 0 (요소끼리 절대 안 겹치게)
  for (let it = 0; it < 170; it++) {
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const a = nodes[i];
        const b = nodes[j];
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let dist = Math.hypot(dx, dy);
        if (dist < 0.01) {
          dx = ((i % 7) - 3) || 1;
          dy = ((j % 5) - 2) || 1;
          dist = Math.hypot(dx, dy);
        }
        const minDist = (rad[i] + rad[j] + GAP) * (1 - ALLOW);
        if (dist < minDist) {
          const push = (minDist - dist) / 2;
          const ux = dx / dist;
          const uy = dy / dist;
          a.x -= ux * push;
          a.y -= uy * push;
          b.x += ux * push;
          b.y += uy * push;
        }
      }
    }
  }
  // 콘텐츠 타일 경계 안쪽으로 클램프 (무한 타일 이음새 겹침 방지)
  for (const d of nodes) {
    const hw = d.w / 2 + 10;
    const hh = d.h / 2 + 10;
    d.x = Math.round(clamp(d.x, WORLD.minX + hw, WORLD.maxX - hw));
    d.y = Math.round(clamp(d.y, WORLD.minY + hh, WORLD.maxY - hh));
  }
}

const FILLER_TITLES: Record<Category, string[]> = {
  학업: ["리포트 개요 생성기", "논문 요약 체인", "시험 정리 노트", "참고문헌 정리", "강의 복습 카드"],
  취업: ["면접 답변 코치", "포트폴리오 정리", "경력기술서 빌더", "인적성 요약", "직무 분석기"],
  창업: ["린 캔버스 코치", "고객 인터뷰 설계", "PMF 점검 체크", "지원사업 매칭", "재무 추정 도우미"],
  디자인: ["무드보드 키워드", "UX 라이팅 도우미", "와이어프레임 설명", "아이콘 컨셉", "랜딩 카피"],
  개발: ["코드 리뷰 프롬프트", "테스트 케이스 생성", "버그 리프로 도우미", "SQL 작성기", "리팩터 가이드"],
  이미지: ["로고 컨셉 시드", "일러스트 스타일팩", "썸네일 생성기", "캐릭터 시트", "배경 프리셋"],
  글쓰기: ["뉴스레터 초안", "스토리 아웃라인", "카피 다듬기", "제목 후보 생성", "요약 압축기"],
  마케팅: ["SEO 키워드 맵", "콘텐츠 캘린더", "이메일 시퀀스", "랜딩 후크", "리텐션 카피"],
};

function makeNode(opts: {
  id: string;
  slug: string;
  type: RecipeType;
  title: string;
  category: Category;
  regionId: string;
  creatorId: string;
  priceKrw: number;
  reproducibility: number;
  model: string;
  x: number;
  y: number;
  rotation: number;
  paper: boolean;
  shape: string;
  w: number;
  h: number;
  image: string;
}): CanvasNode {
  return {
    id: opts.id,
    slug: opts.slug,
    type: opts.type,
    title: opts.title,
    category: opts.category,
    regionId: opts.regionId,
    creatorId: opts.creatorId,
    creatorName: creatorsById[opts.creatorId]?.name ?? "ykk creator",
    priceKrw: opts.priceKrw,
    reproducibility: opts.reproducibility,
    model: opts.model,
    x: Math.round(opts.x),
    y: Math.round(opts.y),
    w: opts.w,
    h: opts.h,
    rotation: opts.rotation,
    color: opts.paper ? "#fbfaf6" : CATEGORY_COLOR[opts.category],
    shape: opts.shape,
    image: opts.image,
  };
}

function generateNodes(): CanvasNode[] {
  const rng = mulberry32(20260624);
  const nodes: CanvasNode[] = [];
  const models = ["GPT-5", "Claude", "Gemini 2", "Midjourney", "Llama 4"];
  let counter = 0;
  let imgCursor = 0; // 카드 썸네일 이미지 순환 분배 (rng 미소비 → 레이아웃 불변)

  for (const region of regions) {
    const authored = contentByCategory[region.category] ?? [];
    // 1) 저작 레시피를 존 중심 근처에 배치 (클릭 시 풀 상세)
    authored.forEach((content, i) => {
      const angle = (i / Math.max(1, authored.length)) * Math.PI * 2 + rng() * 0.6;
      const radius = Math.sqrt(rng()) * 220; // √반경 = 면적 균등 분포
      const ss = pickShapeSize(rng, true);
      nodes.push(
        makeNode({
          id: `n-${counter++}`,
          slug: content.slug,
          type: content.type,
          title: content.title,
          category: region.category,
          regionId: region.id,
          creatorId: content.creatorId,
          priceKrw: content.priceKrw,
          reproducibility: content.reproducibility,
          model: content.model,
          x: region.cx + Math.cos(angle) * radius,
          y: region.cy + Math.sin(angle) * radius,
          rotation: rng() * 10 - 5,
          paper: false,
          shape: ss.shape,
          w: ss.w,
          h: ss.h,
          image: mockImg(imgCursor++),
        }),
      );
    });

    // 2) 존을 채우는 필러 노드 (상세는 같은 카테고리 템플릿 기반 합성)
    const fillerCount = 15 + Math.floor(rng() * 8);
    const titles = FILLER_TITLES[region.category];
    const regionCreators = creators.filter((c) => c.regionId === region.id);
    for (let i = 0; i < fillerCount; i++) {
      const angle = rng() * Math.PI * 2;
      const radius = Math.sqrt(rng()) * 560; // √반경 = 면적 균등 분포 (균일 간격)
      const type: RecipeType = (["prompt", "prompt", "bundle", "workflow"] as RecipeType[])[
        Math.floor(rng() * 4)
      ];
      const creator = regionCreators.length
        ? regionCreators[Math.floor(rng() * regionCreators.length)]
        : creators[Math.floor(rng() * creators.length)];
      const repro = 78 + Math.floor(rng() * 20);
      const ss = pickShapeSize(rng, false);
      nodes.push(
        makeNode({
          id: `n-${counter++}`,
          slug: `${region.id}-f${i}`,
          type,
          title: titles[i % titles.length] + (i >= titles.length ? ` ${Math.floor(i / titles.length) + 1}` : ""),
          category: region.category,
          regionId: region.id,
          creatorId: creator.id,
          priceKrw: 9000 + Math.floor(rng() * 22) * 1000,
          reproducibility: repro,
          model: models[Math.floor(rng() * models.length)],
          x: region.cx + Math.cos(angle) * radius,
          y: region.cy + Math.sin(angle) * radius * 0.92,
          rotation: rng() * 10 - 5,
          paper: rng() > 0.62,
          shape: ss.shape,
          w: ss.w,
          h: ss.h,
          image: mockImg(imgCursor++),
        }),
      );
    }
  }
  relaxNodes(nodes);
  return nodes;
}

export const canvasNodes: CanvasNode[] = generateNodes();
export const nodeBySlug: Record<string, CanvasNode> = Object.fromEntries(
  canvasNodes.map((n) => [n.slug, n]),
);

// 크리에이터별 저작 레시피 슬러그 채우기
for (const content of recipeContents) {
  creatorsById[content.creatorId]?.recipeSlugs.push(content.slug);
}

// ---------- 상세 합성 ----------
function deriveContent(node: CanvasNode): RecipeContent {
  const base =
    contentByCategory[node.category]?.[0] ?? recipeContents[0];
  return {
    ...base,
    slug: node.slug,
    title: node.title,
    type: node.type,
    category: node.category,
    creatorId: node.creatorId,
    priceKrw: node.priceKrw,
    reproducibility: node.reproducibility,
    model: node.model,
    badge: node.color === "#fbfaf6" ? "Community" : base.badge,
    env: { ...base.env, model: node.model },
  };
}

/** 노드 + 콘텐츠 → 풀 레시피 */
export function buildRecipe(node: CanvasNode): Recipe {
  const content = contentBySlug[node.slug] ?? deriveContent(node);
  return { ...content, ...node };
}

// ---------- 헤더용 통계 ----------
export const stats = [
  { label: "등록 레시피", value: `${canvasNodes.length}+` },
  { label: "재현성 평균", value: "92%" },
  { label: "실사용 결과물", value: "1,240" },
  { label: "크리에이터", value: `${creators.length}` },
];

// 레거시 호환 (구 페이지에서 쓰던 형태)
export const recipes: Recipe[] = recipeContents.map((c) =>
  buildRecipe(nodeBySlug[c.slug]),
);
