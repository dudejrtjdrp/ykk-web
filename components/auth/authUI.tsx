"use client";

// 로그인/회원가입 공용 UI — 상단 로고 바 + 가운데 종이 카드 + 입력 필드
import Link from "next/link";
import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/Reveal";

export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="min-h-screen wall-grain">
      <header className="border-b-2 border-black bg-[var(--canvas)]">
        <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-3">
          <Link href="/" aria-label="ykk 홈" className="flex items-center">
            <img src="/logo.png" alt="ykk" width={44} height={44} draggable={false} className="block size-11 select-none" />
          </Link>
          <Link href="/" className="ml-1 hidden text-sm font-semibold text-black/55 hover:text-black sm:block">
            ← 탐험으로
          </Link>
        </div>
      </header>

      <main className="mx-auto grid min-h-[calc(100vh-69px)] max-w-5xl place-items-center px-4 py-10">
        <Reveal className="sticker w-full max-w-md p-7 sm:p-8">
          <p className="mono-font text-[0.62rem] uppercase tracking-[0.2em] text-black/55">{eyebrow}</p>
          <h1 className="mt-1 display-font text-3xl font-black">{title}</h1>
          {subtitle && <p className="mt-2 text-sm leading-6 text-black/65">{subtitle}</p>}
          <div className="mt-5">{children}</div>
          {footer && <div className="mt-5 border-t-2 border-dashed border-black/15 pt-4 text-center text-sm">{footer}</div>}
        </Reveal>
      </main>
    </div>
  );
}

export function AuthInput({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  name,
  mono,
  onEnter,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  name?: string;
  mono?: boolean;
  onEnter?: () => void;
}) {
  return (
    <label className="block rounded-xl border-2 border-black bg-[var(--paper-2)] p-3">
      <span className="mono-font text-[0.6rem] uppercase tracking-[0.16em] text-black/55">{label}</span>
      <input
        type={type}
        name={name}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onEnter) onEnter();
        }}
        placeholder={placeholder}
        className={`mt-1 w-full border-0 bg-transparent text-sm outline-none placeholder:text-black/35 ${mono ? "mono-font" : ""}`}
      />
    </label>
  );
}

export function AuthError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      className="rounded-lg border-2 px-3 py-2 text-sm font-medium"
      style={{
        borderColor: "var(--verm)",
        background: "color-mix(in srgb, var(--verm) 8%, white)",
        color: "var(--verm)",
      }}
    >
      {message}
    </p>
  );
}
