"use client";

// 이니셜 아바타 — 닉네임 첫 글자 + 토큰 색면, 종이 테두리.
import { cn } from "@/lib/utils";
import type { AvatarColor } from "@/lib/auth";

export function Avatar({
  nickname,
  color,
  size = 36,
  className,
}: {
  nickname: string;
  color: AvatarColor;
  size?: number;
  className?: string;
}) {
  const initial = (nickname.trim()[0] ?? "?").toUpperCase();
  // 밝은 톤(옐로/민트/스카이)은 잉크 글자, 진한 톤은 흰 글자
  const lightBg = color === "--sun" || color === "--mint" || color === "--sky";
  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center rounded-full border-2 border-black font-black leading-none",
        className,
      )}
      style={{
        width: size,
        height: size,
        background: `var(${color})`,
        color: lightBg ? "var(--ink)" : "#fff",
        fontSize: size * 0.44,
      }}
    >
      {initial}
    </span>
  );
}
