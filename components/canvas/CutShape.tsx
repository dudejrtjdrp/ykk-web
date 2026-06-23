"use client";

// 종이 컷아웃 실루엣 렌더러 — 노드/피드 카드 공용.
// image 가 있으면 실루엣 모양으로 썸네일을 클립해 채우고(없으면 색면), 위에 잉크 외곽선.
import { memo, useId } from "react";
import { getShape } from "@/lib/canvas/shapes";

function CutShapeBase({
  shape,
  color,
  image,
  title,
}: {
  shape: string;
  color: string;
  image?: string;
  title?: string;
}) {
  const s = getShape(shape);
  const uid = useId();
  const clipId = `cut-${uid}`;
  return (
    <svg
      className="cut-shape"
      viewBox={`0 0 ${s.w} ${s.h}`}
      preserveAspectRatio="none"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      <defs>
        <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
          <path d={s.d} />
        </clipPath>
      </defs>
      {/* 로딩 폴백 색면 */}
      <path d={s.d} fill={color} />
      {/* 썸네일 — 실루엣 모양으로 cover 클립 */}
      {image ? (
        <image
          href={image}
          x="0"
          y="0"
          width={s.w}
          height={s.h}
          preserveAspectRatio="xMidYMid slice"
          clipPath={`url(#${clipId})`}
        />
      ) : null}
      {/* 잉크 외곽선 (위에) */}
      <path className="cut-outline" d={s.d} />
    </svg>
  );
}

export const CutShape = memo(CutShapeBase);
