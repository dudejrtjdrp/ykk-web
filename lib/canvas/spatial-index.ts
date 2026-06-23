// 균일 그리드 공간 인덱스 — 뷰포트 질의를 O(보이는 셀)로 (기획서 2.7 가상화)
import type { CanvasNode, WorldRect } from "@/lib/types";
import { canvasNodes } from "@/lib/mock-data";
import { TILE_H, TILE_W, WORLD } from "./constants";
import { rectsIntersect } from "./math";

const CELL = 700;
const MAX_HALF = 160; // 노드 최대 반치수 (질의 패딩용)

const buckets = new Map<string, CanvasNode[]>();

function key(cx: number, cy: number) {
  return `${cx}|${cy}`;
}

for (const n of canvasNodes) {
  const cx = Math.floor(n.x / CELL);
  const cy = Math.floor(n.y / CELL);
  const k = key(cx, cy);
  const arr = buckets.get(k);
  if (arr) arr.push(n);
  else buckets.set(k, [n]);
}

function bbox(n: CanvasNode): WorldRect {
  return { x: n.x - n.w / 2, y: n.y - n.h / 2, w: n.w, h: n.h };
}

/** 단일 콘텐츠 타일 내에서 world 사각형과 교차하는 노드들 */
export function queryRect(rect: WorldRect): CanvasNode[] {
  const x0 = Math.floor((rect.x - MAX_HALF) / CELL);
  const x1 = Math.floor((rect.x + rect.w + MAX_HALF) / CELL);
  const y0 = Math.floor((rect.y - MAX_HALF) / CELL);
  const y1 = Math.floor((rect.y + rect.h + MAX_HALF) / CELL);

  const out: CanvasNode[] = [];
  for (let cx = x0; cx <= x1; cx++) {
    for (let cy = y0; cy <= y1; cy++) {
      const arr = buckets.get(key(cx, cy));
      if (!arr) continue;
      for (const n of arr) {
        if (rectsIntersect(bbox(n), rect)) out.push(n);
      }
    }
  }
  return out;
}

/** 한 노드를 (tx, ty) 타일로 평행이동한 인스턴스. 타일별로 캐시해 매 질의마다 객체를 새로 만들지 않음 */
function offsetNode(n: CanvasNode, tx: number, ty: number): CanvasNode {
  if (tx === 0 && ty === 0) return n;
  return {
    ...n,
    id: `${n.id}#${tx},${ty}`, // React key 충돌 방지 (slug는 그대로 → 클릭 시 동일 레시피)
    x: n.x + tx * TILE_W,
    y: n.y + ty * TILE_H,
  };
}

// 타일 인스턴스 캐시: "tx,ty" → (원본 id → 평행이동된 노드)
const tileCache = new Map<string, Map<string, CanvasNode>>();
function tiledNode(n: CanvasNode, tx: number, ty: number): CanvasNode {
  if (tx === 0 && ty === 0) return n;
  const tk = `${tx},${ty}`;
  let m = tileCache.get(tk);
  if (!m) {
    m = new Map();
    tileCache.set(tk, m);
  }
  let inst = m.get(n.id);
  if (!inst) {
    inst = offsetNode(n, tx, ty);
    m.set(n.id, inst);
  }
  return inst;
}

/**
 * 무한 캔버스 질의 — 콘텐츠 타일을 TILE_W × TILE_H 격자로 무한 반복.
 * 뷰포트가 걸치는 타일들만 골라(보통 1~4개) 각 타일의 로컬 좌표로 질의 후 평행이동.
 */
export function queryRectInfinite(rect: WorldRect): CanvasNode[] {
  const tx0 = Math.floor((rect.x - WORLD.minX) / TILE_W);
  const tx1 = Math.floor((rect.x + rect.w - WORLD.minX) / TILE_W);
  const ty0 = Math.floor((rect.y - WORLD.minY) / TILE_H);
  const ty1 = Math.floor((rect.y + rect.h - WORLD.minY) / TILE_H);

  const out: CanvasNode[] = [];
  for (let tx = tx0; tx <= tx1; tx++) {
    for (let ty = ty0; ty <= ty1; ty++) {
      const local: WorldRect = {
        x: rect.x - tx * TILE_W,
        y: rect.y - ty * TILE_H,
        w: rect.w,
        h: rect.h,
      };
      const base = queryRect(local);
      for (const n of base) out.push(tiledNode(n, tx, ty));
    }
  }
  return out;
}
