# ykk — 탐험형 AI 레시피 마켓 (시연용 MVP)

검증된 AI 프롬프트·워크플로우("레시피")를 무한 캔버스에서 둘러보고, 재현성 근거를 확인한 뒤 구매하는 마켓플레이스의 프론트엔드 MVP입니다. 대학생을 대상으로 기획했습니다.

2026.06 · 1인 개발(커밋 기준, 기획서 작성 + 프론트엔드) · Next.js 15(App Router), React 19, TypeScript, Tailwind CSS, Framer Motion · 백엔드 없음(목 데이터 어댑터)

## 왜 만들었나

프롬프트 마켓은 대부분 상품 목록형 이커머스라서, 구매자가 "내가 돌려도 같은 결과가 나오는지" 판단할 근거가 부족합니다. ykk는 발견은 탐험처럼, 신뢰는 재현성 근거(Before/After, 실행 환경, 재현률)로 풀어 보려는 시도입니다. 기획서(`ykk_UX_기획서.docx`)를 쓰고 시연 가능한 수준까지 직접 구현했습니다.

## 주요 기능

- 무한 캔버스 홈: 자유 패닝, 관성, 커서 기준 줌, 핀치 줌, 카테고리로 순간이동(`flyTo`), 검색 순간이동
- 레시피 상세·모달: 결과물 비교 슬라이더, 실행 환경 카드, 재현성 게이지, 버전 타임라인, 구매자 결과 갤러리
- 신뢰 장치 3종: 자동 검증 비교(`VerifyPanel`), 모델별 실행 비용 표시, 구매 후 열리는 프롬프트 해설(`PromptAnatomy`)
- 카테고리별 결과물 형식(PDF/Word/이미지/YouTube)을 한 곳에서 정의(`lib/output-formats.ts`)하고, 업로드 위저드도 이에 맞춰 입력 방식이 바뀝니다
- 데모 인증(localStorage 계정·세션), 작업실(저장한 레시피 / 내가 올린 레시피), 모바일·접근성용 피드 뷰, 키보드 조작

## 기술적으로 고민한 것

**1. 무한 캔버스를 React로 60fps 유지하기**
- 문제: 패닝·줌을 할 때마다 React 상태를 바꾸면 노드 수만큼 리렌더가 일어납니다.
- 선택: 카메라 변환은 DOM `transform`을 직접 갱신합니다. 가시 노드 집합이 일정 이상 바뀔 때만 React를 리렌더합니다. 노드 조회는 700px 셀의 균일 그리드 공간 인덱스로, 뷰포트와 겹치는 셀만 질의합니다(`lib/canvas/spatial-index.ts`, `lib/canvas/use-canvas-engine.ts`).
- 결과: 콘텐츠 한 벌을 `WORLD` 크기 타일로 반복해서 끝이 없는 캔버스를 만들었습니다. 타일 사이 여백이 너무 크던 문제는 `WORLD` 상수 하나만 조정해 해결했습니다. 타일·fit이 모두 이 상수에서 파생되기 때문입니다(`lib/canvas/constants.ts`).

**2. 무거운 시각 효과와 성능의 절충**
- 문제: 종이 컷아웃 실루엣 카드의 이중 `drop-shadow`가 팬·줌 중에 매 프레임 다시 래스터화되어 버벅였습니다.
- 선택: 비주얼을 우선하는 보수적인 방향을 택했습니다. 이동 중에만 `data-busy`를 켜서 비싼 그림자를 건너뜁니다. 피드는 `content-visibility`가 그림자를 잘라 먹어서, IntersectionObserver 기반 `Defer`로 화면 밖 타일을 늦게 마운트합니다. 콜백이 매번 새로 만들어져 `StickerNode`의 `memo`가 무력화되던 문제는 `useCallback`으로 고쳤습니다.

**3. SSR 하이드레이션과 결정적 배치**
- 캔버스 노드의 좌표·회전을 시드 고정 PRNG(mulberry32)로 만들어 서버와 클라이언트 렌더 결과를 맞췄습니다. 노드가 겹치지 않도록 면적 균등 분포에 relaxation을 더했습니다(`lib/mock-data.ts`).

**4. 백엔드 교체 지점 분리**
- 모든 조회는 `lib/api.ts` 어댑터를 거칩니다. 실제 API/DB로 옮길 때는 이 파일만 바꾸면 됩니다. 인증·결제·재현성 검증은 목 시뮬레이션이며, 이 사실을 코드와 README에 밝혀 두었습니다.

## 구조

```
app/                  # 홈(캔버스/피드), recipe/[slug](SSG), creator/[id], library, upload, login, signup, mypage
components/
├── canvas/           # CanvasStage, StickerNode, HoverPreview, SearchTeleport, ZoomControls, Onboarding ...
├── recipe/           # RecipeView, RecipeModal
├── feed/FeedView.tsx # 모바일·접근성 대체 뷰
├── auth/             # AuthGate, Avatar
└── ui/               # ReproGauge, CompareSlider, VerifyPanel, PromptAnatomy, ResultViewer, Defer ...
lib/
├── canvas/           # constants, math, spatial-index, use-canvas-engine
├── api.ts            # 데이터 어댑터 (교체 지점)
├── mock-data.ts      # 카테고리·크리에이터·레시피 + 결정적 노드 배치
├── auth.tsx, store.tsx, output-formats.ts, types.ts
public/mock/          # 생성형 목 이미지
```

## 실행 방법

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm start
```

환경변수는 필요 없습니다. 로그인 화면의 데모 계정 "채우기" 버튼으로 바로 둘러볼 수 있습니다.

## 회고

기획서와 코드를 함께 만들면서, 사업계획서의 핵심 기능(검증, 비용, 해설)을 문서가 아니라 화면으로 검증해 볼 수 있었습니다. 다음 단계는 어댑터 뒤에 실제 API를 붙이고, 재현성 검증을 실제 재실행 작업으로 구현하는 것입니다.
