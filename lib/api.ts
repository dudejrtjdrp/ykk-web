// API 어댑터 — 지금은 인메모리 목 데이터, 추후 실제 백엔드 fetch로 교체 가능한 경계.
// 캔버스 가상화는 성능을 위해 동기 질의(queryNodesSync)를 사용하고,
// fetchNodesInViewport는 네트워크 교체 지점을 문서화한다.
import type { CanvasNode, Creator, Recipe, Region, WorldRect } from "@/lib/types";
import {
  buildRecipe,
  canvasNodes,
  creators,
  creatorsById,
  nodeBySlug,
  recipeContents,
  regions,
} from "@/lib/mock-data";
import { queryRectInfinite } from "@/lib/canvas/spatial-index";

/** 프레임마다 호출되는 동기 뷰포트 질의 (가상화 + 무한 타일링) */
export function queryNodesSync(rect: WorldRect): CanvasNode[] {
  return queryRectInfinite(rect);
}

/**
 * 실제 백엔드 교체 지점.
 * 예) return fetch(`/api/canvas?x=${rect.x}&y=${rect.y}&w=${rect.w}&h=${rect.h}`).then(r => r.json())
 */
export async function fetchNodesInViewport(rect: WorldRect): Promise<CanvasNode[]> {
  return Promise.resolve(queryRectInfinite(rect));
}

export function getRecipe(slug: string): Recipe | undefined {
  const node = nodeBySlug[slug];
  return node ? buildRecipe(node) : undefined;
}

export function getCreator(id: string): Creator | undefined {
  return creatorsById[id];
}

/** 크리에이터의 모든 캔버스 노드 (작업실 전시용) */
export function getNodesByCreator(id: string): CanvasNode[] {
  return canvasNodes.filter((n) => n.creatorId === id);
}

export function allRegions(): Region[] {
  return regions;
}

export function allCreators(): Creator[] {
  return creators;
}

export function totalNodeCount(): number {
  return canvasNodes.length;
}

/** 검색 기본 추천 — 입력 전 보여줄 저작(리치) 레시피 노드 */
export function featuredNodes(limit = 8): CanvasNode[] {
  return recipeContents
    .map((c) => nodeBySlug[c.slug])
    .filter(Boolean)
    .slice(0, limit);
}

/** 검색 — 제목·카테고리·크리에이터·모델 매칭 */
export function searchNodes(q: string, limit = 24): CanvasNode[] {
  const query = q.trim().toLowerCase();
  if (!query) return [];
  return canvasNodes
    .filter((n) =>
      [n.title, n.category, n.creatorName, n.model]
        .join(" ")
        .toLowerCase()
        .includes(query),
    )
    .slice(0, limit);
}

/** 검색어가 가리키는 군집 중심 (텔레포트 목적지) */
export function searchCentroid(q: string): { x: number; y: number } | null {
  const hits = searchNodes(q, 60);
  if (hits.length === 0) return null;
  const sum = hits.reduce(
    (acc, n) => ({ x: acc.x + n.x, y: acc.y + n.y }),
    { x: 0, y: 0 },
  );
  return { x: sum.x / hits.length, y: sum.y / hits.length };
}
