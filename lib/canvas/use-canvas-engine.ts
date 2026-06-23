"use client";

// 무한 캔버스 엔진 (기획서 2.5–2.7)
// - 패닝/줌은 DOM transform을 직접 갱신(60fps), React 리렌더는 가시 집합이
//   임계값 이상 변할 때만 → 대량 노드에서도 부드러움
// - 관성 패닝, zoom-to-cursor, 핀치 줌, flyTo(텔레포트), 가상화 + LOD
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CanvasNode } from "@/lib/types";
import { queryNodesSync } from "@/lib/api";
import {
  FLY_DURATION,
  INERTIA_FRICTION,
  MIN_VELOCITY,
  VIEWPORT_BUFFER,
  WORLD,
  ZOOM_DEFAULT,
  ZOOM_MAX,
  ZOOM_MIN,
} from "./constants";
import {
  type Camera,
  clamp,
  easeInOutCubic,
  padRect,
  screenToWorld,
  viewportRect,
} from "./math";

interface View {
  nodes: CanvasNode[];
  zoom: number;
}

type Subscriber = (cam: Camera, size: { w: number; h: number }) => void;

export interface CanvasEngine {
  stageRef: React.RefObject<HTMLDivElement | null>;
  worldRef: React.RefObject<HTMLDivElement | null>;
  view: View;
  subscribe: (cb: Subscriber) => () => void;
  flyTo: (target: { x: number; y: number; zoom?: number }, dur?: number) => void;
  focusNode: (node: { x: number; y: number }) => void;
  zoomByButton: (factor: number) => void;
  panByKey: (dx: number, dy: number) => void;
  fit: () => void;
  getCamera: () => Camera;
  getSize: () => { w: number; h: number };
  prefersReducedMotion: () => boolean;
}

export function useCanvasEngine(): CanvasEngine {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const worldRef = useRef<HTMLDivElement | null>(null);

  const cameraRef = useRef<Camera>({ x: -200, y: -300, zoom: 0.5 });
  const sizeRef = useRef({ w: 0, h: 0 });
  const lastQueryRef = useRef<Camera>({ x: Infinity, y: Infinity, zoom: 1 });
  const subsRef = useRef<Set<Subscriber>>(new Set());
  const rafRef = useRef<number | null>(null);
  const reducedRef = useRef(false);

  const [view, setView] = useState<View>({ nodes: [], zoom: ZOOM_DEFAULT });

  // ---- 변환 적용 ----
  const applyTransform = useCallback(() => {
    const el = worldRef.current;
    if (!el) return;
    const { x, y, zoom } = cameraRef.current;
    const { w, h } = sizeRef.current;
    el.style.transform = `translate(${w / 2}px, ${h / 2}px) scale(${zoom}) translate(${-x}px, ${-y}px)`;
  }, []);

  const notify = useCallback(() => {
    const cam = cameraRef.current;
    const size = sizeRef.current;
    subsRef.current.forEach((cb) => cb(cam, size));
  }, []);

  const recomputeVisible = useCallback((force: boolean) => {
    const cam = cameraRef.current;
    const size = sizeRef.current;
    if (size.w === 0) return;
    const last = lastQueryRef.current;
    const moved = Math.hypot(cam.x - last.x, cam.y - last.y);
    const zoomRatio = cam.zoom / last.zoom;
    const threshold = (VIEWPORT_BUFFER * 0.5) / cam.zoom;
    if (
      !force &&
      moved < threshold &&
      zoomRatio < 1.06 &&
      zoomRatio > 0.94
    ) {
      return;
    }
    lastQueryRef.current = { ...cam };
    const rect = padRect(viewportRect(cam, size.w, size.h), VIEWPORT_BUFFER / cam.zoom);
    const nodes = queryNodesSync(rect);
    setView({ nodes, zoom: cam.zoom });
  }, []);

  const commit = useCallback(
    (force = false) => {
      applyTransform();
      notify();
      recomputeVisible(force);
    },
    [applyTransform, notify, recomputeVisible],
  );

  // ---- 줌 (포인터 앵커 유지) ----
  const zoomAt = useCallback(
    (screenX: number, screenY: number, factor: number) => {
      const cam = cameraRef.current;
      const size = sizeRef.current;
      const nextZoom = clamp(cam.zoom * factor, ZOOM_MIN, ZOOM_MAX);
      if (nextZoom === cam.zoom) return;
      const world = screenToWorld({ x: screenX, y: screenY }, cam, size.w, size.h);
      cam.zoom = nextZoom;
      cam.x = world.x - (screenX - size.w / 2) / nextZoom;
      cam.y = world.y - (screenY - size.h / 2) / nextZoom;
      commit();
    },
    [commit],
  );

  // ---- 애니메이션 카메라 이동 (flyTo) ----
  const animateTo = useCallback(
    (target: { x: number; y: number; zoom?: number }, dur: number) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      const start = { ...cameraRef.current };
      const end = {
        x: target.x,
        y: target.y,
        zoom: clamp(target.zoom ?? cameraRef.current.zoom, ZOOM_MIN, ZOOM_MAX),
      };
      if (reducedRef.current || dur <= 0) {
        cameraRef.current = end;
        commit(true);
        return;
      }
      const t0 = performance.now();
      const step = (now: number) => {
        const t = clamp((now - t0) / dur, 0, 1);
        const e = easeInOutCubic(t);
        cameraRef.current = {
          x: start.x + (end.x - start.x) * e,
          y: start.y + (end.y - start.y) * e,
          zoom: start.zoom + (end.zoom - start.zoom) * e,
        };
        commit();
        if (t < 1) rafRef.current = requestAnimationFrame(step);
        else rafRef.current = null;
      };
      rafRef.current = requestAnimationFrame(step);
    },
    [commit],
  );

  const flyTo = useCallback(
    (target: { x: number; y: number; zoom?: number }, dur = FLY_DURATION) =>
      animateTo(target, dur),
    [animateTo],
  );

  const focusNode = useCallback(
    (node: { x: number; y: number }) =>
      animateTo({ x: node.x, y: node.y, zoom: Math.max(cameraRef.current.zoom, 1.5) }, FLY_DURATION),
    [animateTo],
  );

  const zoomByButton = useCallback(
    (factor: number) => {
      const size = sizeRef.current;
      zoomAt(size.w / 2, size.h / 2, factor);
    },
    [zoomAt],
  );

  const panByKey = useCallback(
    (dx: number, dy: number) => {
      const cam = cameraRef.current;
      cam.x += dx / cam.zoom;
      cam.y += dy / cam.zoom;
      commit();
    },
    [commit],
  );

  const fit = useCallback(() => {
    const size = sizeRef.current;
    const worldW = WORLD.maxX - WORLD.minX;
    const worldH = WORLD.maxY - WORLD.minY;
    const zoom = clamp(Math.min(size.w / worldW, size.h / worldH) * 0.92, ZOOM_MIN, ZOOM_MAX);
    animateTo({ x: (WORLD.minX + WORLD.maxX) / 2, y: (WORLD.minY + WORLD.maxY) / 2, zoom }, FLY_DURATION);
  }, [animateTo]);

  const subscribe = useCallback((cb: Subscriber) => {
    subsRef.current.add(cb);
    cb(cameraRef.current, sizeRef.current);
    return () => {
      subsRef.current.delete(cb);
    };
  }, []);

  // ---- 마운트: 크기 측정 + 입력 리스너 ----
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    reducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ro = new ResizeObserver(() => {
      const rect = stage.getBoundingClientRect();
      sizeRef.current = { w: rect.width, h: rect.height };
      commit(true);
    });
    ro.observe(stage);

    // ----- 포인터 패닝 + 핀치 -----
    const pointers = new Map<number, { x: number; y: number }>();
    let panning = false;
    let lastX = 0;
    let lastY = 0;
    let vx = 0;
    let vy = 0;
    let lastT = 0;
    let pinchDist = 0;
    let inertiaRaf: number | null = null;
    let downX = 0;
    let downY = 0;

    const stopInertia = () => {
      if (inertiaRaf) {
        cancelAnimationFrame(inertiaRaf);
        inertiaRaf = null;
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      // HUD / 오버레이 위에서는 패닝 시작하지 않음
      if ((e.target as HTMLElement)?.closest("[data-canvas-ui]")) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      stopInertia();
      if (pointers.size === 1) {
        panning = true;
        stage.setAttribute("data-panning", "true");
        lastX = e.clientX;
        lastY = e.clientY;
        downX = e.clientX;
        downY = e.clientY;
        vx = 0;
        vy = 0;
        lastT = performance.now();
      } else if (pointers.size === 2) {
        panning = false;
        stage.removeAttribute("data-panning");
        const pts = [...pointers.values()];
        pinchDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (pointers.size >= 2) {
        const pts = [...pointers.values()];
        const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        const mid = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
        const rect = stage.getBoundingClientRect();
        if (pinchDist > 0) {
          zoomAt(mid.x - rect.left, mid.y - rect.top, dist / pinchDist);
        }
        pinchDist = dist;
        return;
      }

      if (!panning) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      const now = performance.now();
      const dt = Math.max(1, now - lastT);
      vx = dx / dt;
      vy = dy / dt;
      lastT = now;
      const cam = cameraRef.current;
      cam.x -= dx / cam.zoom;
      cam.y -= dy / cam.zoom;
      commit();
    };

    const endPointer = (e: PointerEvent) => {
      pointers.delete(e.pointerId);
      if (pointers.size < 2) pinchDist = 0;
      if (pointers.size === 0 && panning) {
        panning = false;
        stage.removeAttribute("data-panning");
        const moved = Math.hypot(e.clientX - downX, e.clientY - downY);
        // 관성 (reduced-motion이면 생략)
        if (!reducedRef.current && moved > 6 && (Math.abs(vx) > MIN_VELOCITY || Math.abs(vy) > MIN_VELOCITY)) {
          let velX = vx * 16;
          let velY = vy * 16;
          const decay = () => {
            const cam = cameraRef.current;
            cam.x -= velX / cam.zoom;
            cam.y -= velY / cam.zoom;
            velX *= INERTIA_FRICTION;
            velY *= INERTIA_FRICTION;
            commit();
            if (Math.abs(velX) > 0.5 || Math.abs(velY) > 0.5) {
              inertiaRaf = requestAnimationFrame(decay);
            } else {
              inertiaRaf = null;
            }
          };
          inertiaRaf = requestAnimationFrame(decay);
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      // HUD(검색 결과 등) 스크롤은 줌으로 가로채지 않음
      if ((e.target as HTMLElement)?.closest("[data-canvas-ui]")) return;
      e.preventDefault();
      const rect = stage.getBoundingClientRect();
      // ctrl+wheel(트랙패드 핀치) 또는 일반 휠 → 줌
      const factor = Math.exp(-e.deltaY * 0.0016);
      zoomAt(e.clientX - rect.left, e.clientY - rect.top, factor);
    };

    stage.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", endPointer);
    window.addEventListener("pointercancel", endPointer);
    stage.addEventListener("wheel", onWheel, { passive: false });

    // 초기 커밋
    const rect = stage.getBoundingClientRect();
    sizeRef.current = { w: rect.width, h: rect.height };
    commit(true);

    return () => {
      ro.disconnect();
      stopInertia();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      stage.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", endPointer);
      window.removeEventListener("pointercancel", endPointer);
      stage.removeEventListener("wheel", onWheel);
    };
  }, [commit, zoomAt]);

  return useMemo<CanvasEngine>(
    () => ({
      stageRef,
      worldRef,
      view,
      subscribe,
      flyTo,
      focusNode,
      zoomByButton,
      panByKey,
      fit,
      getCamera: () => cameraRef.current,
      getSize: () => sizeRef.current,
      prefersReducedMotion: () => reducedRef.current,
    }),
    [view, subscribe, flyTo, focusNode, zoomByButton, panByKey, fit],
  );
}
