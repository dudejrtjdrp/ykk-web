// 무한 캔버스 엔진 상수 (기획서 2.3 / 2.7)

export const ZOOM_MIN = 0.18;
export const ZOOM_MAX = 3.2;
export const ZOOM_DEFAULT = 0.85;

/** 줌 레벨별 정보 밀도(LOD) 임계값 */
export const LOD_FAR = 0.45; // 이하: 점/라벨만
export const LOD_NEAR = 1.35; // 이상: 풀 카드 정보

/** 가상화 버퍼 — 뷰포트 밖 이 거리(world px)까지는 미리 렌더 */
export const VIEWPORT_BUFFER = 520;

/**
 * 콘텐츠 월드 경계 (한 "타일" = 한 벌의 콘텐츠가 분포하는 영역).
 *
 * 실제 노드 분포는 약 5680(가로)×3900(세로) world px 영역에 모여 있다.
 * 타일(=WORLD 폭/높이)이 이 분포보다 크면, 그 차이만큼이 타일 사이의 빈 여백이
 * 되어 드래그 시 다음 캔버스가 나올 때까지 빈 공간을 지나야 한다.
 *   가로 여백 = TILE_W − 콘텐츠 가로폭 ,  세로 여백 = TILE_H − 콘텐츠 세로높이
 *
 * 따라서 경계를 콘텐츠에 바짝 맞춰, 타일 사이 여백을 한 "이음새"(가로 ~820 /
 * 세로 ~700 world px) 정도로만 남긴다. 콘텐츠는 거의 원점 대칭이라 ± 대칭 유지.
 * (값을 더 줄이면 여백이 더 좁아지나, 너무 줄이면 인접 타일 군집이 붙어 보인다.)
 */
export const WORLD = {
  minX: -3250,
  maxX: 3250,
  minY: -2300,
  maxY: 2300,
};

/**
 * 무한 캔버스 = 위 콘텐츠 타일을 끝없이 반복.
 * 타일 크기를 콘텐츠 월드 폭/높이와 정확히 일치시켜, 인접 타일이
 * 빈틈·겹침 없이 맞물리도록 한다. (panning 시 '끝'이 사라짐)
 */
export const TILE_W = WORLD.maxX - WORLD.minX;
export const TILE_H = WORLD.maxY - WORLD.minY;

export const PAN_KEY_STEP = 240; // 화살표 키 1회 이동(px)
export const WHEEL_ZOOM_SPEED = 0.0015;
export const FLY_DURATION = 640; // ms
export const INERTIA_FRICTION = 0.92; // 관성 감속 계수
export const MIN_VELOCITY = 0.04;
