"use client";

// 테마 존 라벨 — 줌아웃 시 또렷, 줌인 시 옅어짐 (기획서 2.3.2)
// 무한 캔버스: 콘텐츠 타일이 반복되므로 라벨도 보이는 타일마다 함께 반복한다.
import { useEffect, useState } from "react";
import type { CanvasEngine } from "@/lib/canvas/use-canvas-engine";
import { TILE_H, TILE_W } from "@/lib/canvas/constants";
import { viewportRect } from "@/lib/canvas/math";
import { regions } from "@/lib/mock-data";

interface LabelView {
  txMin: number;
  txMax: number;
  tyMin: number;
  tyMax: number;
  opacity: number;
}

const opacityFor = (zoom: number) => (zoom < 0.4 ? 1 : zoom < 0.9 ? 0.55 : 0.12);

export function RegionLabels({ engine }: { engine: CanvasEngine }) {
  const [v, setV] = useState<LabelView>({ txMin: 0, txMax: 0, tyMin: 0, tyMax: 0, opacity: 0.55 });

  useEffect(() => {
    return engine.subscribe((cam, size) => {
      if (size.w === 0) return;
      const vr = viewportRect(cam, size.w, size.h);
      const txMin = Math.floor(vr.x / TILE_W) - 1;
      const txMax = Math.floor((vr.x + vr.w) / TILE_W) + 1;
      const tyMin = Math.floor(vr.y / TILE_H) - 1;
      const tyMax = Math.floor((vr.y + vr.h) / TILE_H) + 1;
      const opacity = opacityFor(cam.zoom);
      // 타일 범위나 투명도 밴드가 바뀔 때만 리렌더
      setV((prev) =>
        prev.txMin === txMin &&
        prev.txMax === txMax &&
        prev.tyMin === tyMin &&
        prev.tyMax === tyMax &&
        prev.opacity === opacity
          ? prev
          : { txMin, txMax, tyMin, tyMax, opacity },
      );
    });
  }, [engine]);

  if (v.opacity <= 0.12) return null; // 가까이서는 숨김 (DOM 절약)

  const tiles: { tx: number; ty: number }[] = [];
  for (let tx = v.txMin; tx <= v.txMax; tx++) {
    for (let ty = v.tyMin; ty <= v.tyMax; ty++) tiles.push({ tx, ty });
  }

  return (
    <>
      {tiles.map(({ tx, ty }) =>
        regions.map((r) => (
          <div
            key={`${r.id}#${tx},${ty}`}
            className="pointer-events-none absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300"
            style={{
              transform: `translate(${r.cx + tx * TILE_W}px, ${r.cy - 980 + ty * TILE_H}px) translate(-50%, -50%)`,
              opacity: v.opacity,
            }}
          >
            <span
              className="mono-font whitespace-nowrap rounded-full border-2 border-[var(--ink)] px-4 py-1.5 text-sm font-bold uppercase tracking-[0.2em]"
              style={{ background: r.color }}
            >
              {r.label}
            </span>
          </div>
        )),
      )}
    </>
  );
}
