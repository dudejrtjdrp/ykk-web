# ykk — 탐험형 AI 레시피 마켓

> **make it, prove it.** 검증된 AI 레시피·노하우를 *무한 캔버스*에서 발견하고, *재현성*으로 신뢰하고, 내 것으로 만든다.

기획서(`ykk_UX_기획서.docx`)를 프로덕션 수준으로 구현한 **Next.js 15 (App Router) · React 19 · TypeScript · Tailwind** 코드베이스입니다.

---

## 실행

```bash
npm install      # 최초 1회 (이미 설치돼 있으면 생략)
npm run dev      # 개발 서버 → http://localhost:3000
npm run build    # 프로덕션 빌드
npm start        # 빌드 결과 실행
```

> 이 코드는 `tsc --noEmit` 타입체크를 통과합니다.

---

## 무엇이 구현돼 있나

### 1. 무한 캔버스 (메인, 기획서 2·3장) — 핵심
- **무한 좌표계 + 카메라**: 좌·우·상·하·대각선 자유 패닝, `world ↔ screen` 변환 (`lib/canvas/math.ts`)
- **관성 패닝 / zoom-to-cursor / 핀치 줌 / flyTo(텔레포트)** (`lib/canvas/use-canvas-engine.ts`)
- **가상화 + LOD**: 균일 그리드 공간 인덱스로 뷰포트 + 버퍼만 질의·렌더, 줌 레벨별 정보 밀도 3단계 (far/mid/near)
- **성능 설계**: 패닝/줌은 DOM `transform`을 직접 갱신(60fps), React 리렌더는 가시 노드 집합이 임계값 이상 변할 때만
- **스티커 노드**: 타입별(Prompt·Bundle·Workflow·Creator) 색·회전, hover 확대 미리보기
- **HUD**: 미니맵(클릭 순간이동) · 줌 컨트롤 · 검색=텔레포트 · 비차단형 온보딩 · 테마 존 라벨

### 2. 상세 페이지 (기획서 4장) — 재현성을 파는 화면
- **Before/After 재현 비교** 드래그 슬라이더 · **환경 카드**(모노 표기 + 복사) · **재현성 원형 게이지**(카운트업)
- **버전 타임라인** · **구매자 결과 매스너리 갤러리** · 리뷰 · 크리에이터 카드 · sticky 구매 바 + 결제 모달

### 3. 크리에이터 프로필 (5장) · 라이브러리 · 업로드 (6장)
- 작업실 메타포 프로필 / 저장한 레시피 보관함(localStorage) / **재현성 자동검증을 내장한 업로드 위저드**

### 4. 접근성·모바일 (8·9장)
- 키보드 내비(화살표 패닝, `+/-` 줌, `F` 전체보기, `/` 검색) · `prefers-reduced-motion` 존중
- 모바일/접근성 **대체 피드 뷰**(매스너리) — 데스크톱은 공간 탐험, 모바일은 공간의 단면을 흐르는 피드. 언제든 전환.

---

## 구조

```
app/
  page.tsx                 # 홈: 데스크톱=캔버스 / 모바일=피드 오케스트레이터
  recipe/[slug]/page.tsx   # 상세 (SSG, generateStaticParams)
  creator/[id]/page.tsx    # 크리에이터 작업실
  library/page.tsx         # 내 작업실(저장함)
  upload/page.tsx          # 업로드 위저드(+재현 검증)
  layout.tsx               # 폰트 + SavedProvider
  globals.css              # 디자인 토큰(오프화이트 캔버스·리소 액센트·모션)
components/
  canvas/                  # CanvasStage, StickerNode, HoverPreview, Minimap, ZoomControls, SearchTeleport, RegionLabels, Onboarding
  recipe/RecipeView.tsx    # 상세 인터랙티브 본문
  feed/FeedView.tsx        # 피드/접근성 대체뷰
  ui/                      # ReproGauge, CompareSlider, EnvCard, VersionTimeline, MasonryGallery
  NodeCard.tsx, SiteHeader.tsx
lib/
  canvas/                  # constants, math, spatial-index, use-canvas-engine
  api.ts                   # 데이터 어댑터(교체 지점)
  mock-data.ts             # 지역·크리에이터·레시피 + 결정론적 캔버스 노드 생성
  store.tsx                # 저장(localStorage) 컨텍스트
  types.ts, format.ts, utils.ts
```

---

## 데이터 / 백엔드 경계

현재 데이터는 **인메모리 목 데이터**(`lib/mock-data.ts`)이고, 모든 조회는 **어댑터**(`lib/api.ts`)를 거칩니다.
실제 백엔드 연결 시 이 어댑터만 교체하면 됩니다. 예:

```ts
// lib/api.ts
export async function fetchNodesInViewport(rect: WorldRect): Promise<CanvasNode[]> {
  return fetch(`/api/canvas?x=${rect.x}&y=${rect.y}&w=${rect.w}&h=${rect.h}`).then(r => r.json());
}
```

- 캔버스 노드 좌표/회전은 **시드 고정 PRNG**로 생성 → SSR/CSR 하이드레이션 일치.
- 인증·결제·임베딩 기반 추천·실제 재현성 검증 파이프라인은 어댑터 뒤의 **TODO(목 시뮬레이션)** 으로 표시.

---

## 다음 단계
- 어댑터를 실제 API/DB로 교체, 인증·결제 연동
- 좌표 기반 캔버스 API(`/api/canvas`) + 임베딩 군집 좌표 매핑
- 업로드의 재현성 검증을 실제 재실행 잡으로 구현
