"use client";

// 미니맵 — 현재 위치/방문 지형 (기획서 3.2). 엔진 구독으로 뷰포트 사각형을 직접 갱신.
import { useEffect, useRef } from "react";
import type { CanvasEngine } from "@/lib/canvas/use-canvas-engine";
import { WORLD } from "@/lib/canvas/constants";
import { viewportRect } from "@/lib/canvas/math";
import { regions } from "@/lib/mock-data";

const MM_W = 176;
const worldW = WORLD.maxX - WORLD.minX;
const worldH = WORLD.maxY - WORLD.minY;
const SCALE = MM_W / worldW;
const MM_H = worldH * SCALE;

const mapX = (wx: number) => (wx - WORLD.minX) * SCALE;
const mapY = (wy: number) => (wy - WORLD.minY) * SCALE;

export function Minimap({ engine }: { engine: CanvasEngine }) {
  const rectRef = useRef<SVGRectElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    return engine.subscribe((cam, size) => {
      if (size.w === 0 || !rectRef.current) return;
      const vr = viewportRect(cam, size.w, size.h);
      rectRef.current.setAttribute("x", String(mapX(vr.x)));
      rectRef.current.setAttribute("y", String(mapY(vr.y)));
      rectRef.current.setAttribute("width", String(Math.max(6, vr.w * SCALE)));
      rectRef.current.setAttribute("height", String(Math.max(6, vr.h * SCALE)));
    });
  }, [engine]);

  const jump = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const wx = px / SCALE + WORLD.minX;
    const wy = py / SCALE + WORLD.minY;
    engine.flyTo({ x: wx, y: wy });
  };

  return (
    <div className="sticker-sm overflow-hidden p-1.5" aria-hidden>
      <svg
        ref={svgRef}
        width={MM_W}
        height={MM_H}
        onClick={jump}
        className="block cursor-pointer rounded-md"
        style={{ background: "var(--canvas-deep)" }}
      >
        {regions.map((r) => (
          <g key={r.id}>
            <circle cx={mapX(r.cx)} cy={mapY(r.cy)} r={16} fill={r.color} opacity={0.5} />
            <circle cx={mapX(r.cx)} cy={mapY(r.cy)} r={3} fill="#1a1a18" />
          </g>
        ))}
        <rect
          ref={rectRef}
          x={0}
          y={0}
          width={20}
          height={14}
          fill="rgba(224,73,42,0.16)"
          stroke="var(--verm)"
          strokeWidth={2}
          rx={2}
        />
      </svg>
    </div>
  );
}
