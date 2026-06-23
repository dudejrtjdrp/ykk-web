// world ↔ screen 변환 및 기하 유틸
import type { WorldRect } from "@/lib/types";

export interface Camera {
  x: number; // 화면 중심에 오는 world 좌표
  y: number;
  zoom: number;
}

export interface Point {
  x: number;
  y: number;
}

export const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/** world 점 → screen 픽셀 */
export function worldToScreen(
  p: Point,
  cam: Camera,
  vw: number,
  vh: number,
): Point {
  return {
    x: (p.x - cam.x) * cam.zoom + vw / 2,
    y: (p.y - cam.y) * cam.zoom + vh / 2,
  };
}

/** screen 픽셀 → world 점 */
export function screenToWorld(
  p: Point,
  cam: Camera,
  vw: number,
  vh: number,
): Point {
  return {
    x: (p.x - vw / 2) / cam.zoom + cam.x,
    y: (p.y - vh / 2) / cam.zoom + cam.y,
  };
}

/** 현재 카메라가 보는 world 사각형 */
export function viewportRect(cam: Camera, vw: number, vh: number): WorldRect {
  const w = vw / cam.zoom;
  const h = vh / cam.zoom;
  return { x: cam.x - w / 2, y: cam.y - h / 2, w, h };
}

export function rectsIntersect(a: WorldRect, b: WorldRect): boolean {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

/** 사각형을 사방으로 pad */
export function padRect(r: WorldRect, pad: number): WorldRect {
  return { x: r.x - pad, y: r.y - pad, w: r.w + pad * 2, h: r.h + pad * 2 };
}

/** 결정론적 PRNG (mulberry32) — SSR/CSR 일치를 위해 시드 고정 */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
