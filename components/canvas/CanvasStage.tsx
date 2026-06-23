"use client";

// 무한 캔버스 화면 (기획서 2장) — 엔진 + 가상화 렌더 + HUD + 접근성
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { CanvasNode } from "@/lib/types";
import { useCanvasEngine } from "@/lib/canvas/use-canvas-engine";
import { LOD_FAR, LOD_NEAR, PAN_KEY_STEP } from "@/lib/canvas/constants";
import { useSaved } from "@/lib/store";
import { useRecipeModal } from "@/components/recipe/RecipeModalProvider";
import { compact } from "@/lib/format";
import { regions } from "@/lib/mock-data";
import { StickerNode, type Tier } from "./StickerNode";
import { HoverPreview, type HoverState } from "./HoverPreview";
import { RegionLabels } from "./RegionLabels";
import { ZoomControls } from "./ZoomControls";
import { SearchTeleport } from "./SearchTeleport";
import { Onboarding } from "./Onboarding";

export function CanvasStage({ onRequestFeed }: { onRequestFeed: () => void }) {
  const engine = useCanvasEngine();
  const saved = useSaved();
  const { openRecipe } = useRecipeModal();
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [hover, setHover] = useState<HoverState | null>(null);
  const closeTimer = useRef<number | null>(null);
  // 포커스(검색 이동·선택)된 카드 id. 빈 캔버스를 누르면 해제.
  const [focusedId, setFocusedId] = useState<string | null>(null);

  const cancelClose = () => {
    if (closeTimer.current != null) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };
  // 카드 → 미리보기로 마우스가 건너가는 동안 사라지지 않도록 닫기를 잠깐 지연
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => setHover(null), 160);
  };

  const zoom = engine.view.zoom;
  const tier: Tier = zoom < LOD_FAR ? "far" : zoom < LOD_NEAR ? "mid" : "near";

  // 줌/뷰 변화 시 hover 정리 (스크린 좌표 stale 방지)
  useEffect(() => {
    cancelClose();
    setHover(null);
  }, [engine.view]);

  // 언마운트 시 대기 중인 닫기 타이머 정리
  useEffect(() => () => cancelClose(), []);

  // 블루프린트 그리드가 월드 변환(팬·줌)을 따라가도록 매 프레임 갱신
  useEffect(() => {
    const stage = engine.stageRef.current;
    if (!stage) return;
    const MINOR = 40;
    const MAJOR = 200;
    return engine.subscribe((cam, size) => {
      if (!size.w) return;
      const z = cam.zoom;
      const ms = MINOR * z;
      const Ms = MAJOR * z;
      const ox = -cam.x * z + size.w / 2;
      const oy = -cam.y * z + size.h / 2;
      stage.style.backgroundSize = `${ms}px ${ms}px, ${ms}px ${ms}px, ${Ms}px ${Ms}px, ${Ms}px ${Ms}px`;
      stage.style.backgroundPosition = `${ox}px ${oy}px, ${ox}px ${oy}px, ${ox}px ${oy}px, ${ox}px ${oy}px`;
    });
  }, [engine]);

  // 카드 선택 = 포커스 + 상세 열기
  const openNode = (node: CanvasNode) => {
    cancelClose();
    setHover(null);
    setFocusedId(node.id);
    openRecipe(node.slug);
  };

  const flyToRegion = (r: (typeof regions)[number]) => {
    setFocusedId(null);
    engine.flyTo({ x: r.cx, y: r.cy, zoom: 1.0 });
  };

  // 카드/HUD 가 아닌 빈 캔버스를 누르면 포커스 해제
  const clearFocusOnBackground = (e: React.PointerEvent<HTMLDivElement>) => {
    const t = e.target as HTMLElement;
    if (t.closest(".cut-sticker") || t.closest("[data-canvas-ui]")) return;
    setFocusedId(null);
  };

  const onHoverStart = (node: CanvasNode, rect: DOMRect) => {
    const stage = engine.stageRef.current;
    if (!stage) return;
    const sr = stage.getBoundingClientRect();
    const topY = rect.top - sr.top;
    const bottomY = rect.bottom - sr.top;
    // 위쪽 공간이 미리보기 추정 높이보다 좁으면 카드 아래로 띄워 잘림 방지
    const EST_H = 360;
    const placement: HoverState["placement"] = topY >= EST_H + 12 ? "above" : "below";
    cancelClose();
    setHover({
      node,
      x: rect.left - sr.left + rect.width / 2,
      topY,
      bottomY,
      placement,
    });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const tag = (e.target as HTMLElement).tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    if (e.key === "/") {
      e.preventDefault();
      searchInputRef.current?.focus();
    } else if (e.key === "+" || e.key === "=") {
      engine.zoomByButton(1.25);
    } else if (e.key === "-" || e.key === "_") {
      engine.zoomByButton(0.8);
    } else if (e.key === "f" || e.key === "F") {
      engine.fit();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      engine.panByKey(PAN_KEY_STEP, 0);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      engine.panByKey(-PAN_KEY_STEP, 0);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      engine.panByKey(0, PAN_KEY_STEP);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      engine.panByKey(0, -PAN_KEY_STEP);
    }
  };

  return (
    <div
      ref={engine.stageRef}
      tabIndex={0}
      role="application"
      aria-label="ykk 무한 캔버스. 화살표 키로 이동, +/− 로 확대·축소, F 로 전체 보기, / 로 검색."
      onKeyDown={onKeyDown}
      onPointerDownCapture={(e) => {
        // 미리보기 내부를 누른 경우엔 닫지 않음 (버튼·카드 클릭이 정상 동작하도록)
        if ((e.target as HTMLElement).closest("[data-hover-preview]")) return;
        cancelClose();
        setHover(null);
        clearFocusOnBackground(e);
      }}
      className="canvas-stage blueprint-bg relative h-full w-full overflow-hidden outline-none"
    >
      {/* 변환되는 월드 레이어 */}
      <div ref={engine.worldRef} className="canvas-world">
        <RegionLabels engine={engine} />
        {engine.view.nodes.map((node) => (
          <StickerNode
            key={node.id}
            node={node}
            tier={tier}
            focused={focusedId === node.id}
            onOpen={openNode}
            onHoverStart={onHoverStart}
            onHoverEnd={scheduleClose}
          />
        ))}
      </div>

      {/* hover 미리보기 (스크린 좌표) */}
      {hover && tier !== "far" && (
        <div data-canvas-ui data-hover-preview>
          <HoverPreview
            hover={hover}
            saved={saved.isSaved(hover.node.slug)}
            onOpen={openNode}
            onToggleSave={saved.toggle}
            onPointerEnter={cancelClose}
            onPointerLeave={scheduleClose}
          />
        </div>
      )}

      {/* 상단 HUD */}
      <div
        data-canvas-ui
        className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-between gap-3 p-3 sm:p-4"
      >
        <Link href="/" aria-label="ykk 홈" className="pointer-events-auto shrink-0">
          <img
            src="/logo.png"
            alt="ykk"
            width={48}
            height={48}
            draggable={false}
            className="block size-11 select-none sm:size-12"
          />
        </Link>

        <div className="pointer-events-auto">
          <SearchTeleport
            engine={engine}
            inputRef={searchInputRef}
            onTeleport={(node) => setFocusedId(node.id)}
          />
        </div>

        <nav className="pointer-events-auto hidden items-center gap-2 md:flex">
          <Link href="/library" className="hud-chip relative rounded-full px-4 py-2 text-sm font-semibold">
            작업실
            {saved.hydrated && saved.count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 grid min-w-5 place-items-center rounded-full border-[1.5px] border-[var(--ink)] bg-[var(--verm)] px-1 text-[0.6rem] font-bold text-white">
                {compact(saved.count)}
              </span>
            )}
          </Link>
          <Link href="/upload" className="rounded-full border-[1.5px] border-[var(--ink)] bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-[var(--paper)] shadow-[var(--shadow-soft)]">
            업로드
          </Link>
        </nav>
      </div>

      {/* 좌측 카테고리 네비 — 클릭 시 해당 존으로 이동 */}
      <nav
        data-canvas-ui
        aria-label="카테고리 바로가기"
        className="pointer-events-auto absolute left-3 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-1.5 sm:flex"
      >
        {regions.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => flyToRegion(r)}
            title={`${r.label}(으)로 이동`}
            className="focus-ring group flex items-center gap-2 rounded-full border-[1.5px] border-[var(--ink)] bg-[var(--paper)]/85 px-2.5 py-1.5 text-xs font-semibold shadow-[var(--shadow-soft)] backdrop-blur transition-transform hover:translate-x-1"
          >
            <span
              className="size-3 shrink-0 rounded-full border border-[var(--ink)]"
              style={{ background: r.color }}
            />
            <span className="whitespace-nowrap">{r.category}</span>
          </button>
        ))}
      </nav>

      {/* 우하단 HUD: 줌 컨트롤 */}
      <div data-canvas-ui className="pointer-events-auto absolute bottom-4 right-4 z-30">
        <ZoomControls engine={engine} />
      </div>

      {/* 좌하단: 리스트뷰 전환 (전 사이즈 공통) */}
      <div data-canvas-ui className="pointer-events-auto absolute bottom-4 left-4 z-30">
        <button
          type="button"
          onClick={onRequestFeed}
          className="hud-chip rounded-full px-4 py-2 text-sm font-semibold"
          title="리스트(피드)로 보기 — 접근성·정밀 탐색"
        >
          ☰ 리스트
        </button>
      </div>

      {/* 온보딩 */}
      <div data-canvas-ui>
        <Onboarding />
      </div>
    </div>
  );
}
