"use client";

// 하위 페이지(상세/프로필/라이브러리/업로드) 공용 헤더
import Link from "next/link";
import { useSaved } from "@/lib/store";
import { compact } from "@/lib/format";
import { Magnetic } from "@/components/ui/Magnetic";

export function SiteHeader() {
  const saved = useSaved();
  return (
    <header className="sticky top-0 z-40 border-b-2 border-black bg-[var(--canvas)]">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
        <Link href="/" aria-label="ykk 홈" className="flex items-center">
          <img src="/logo.png" alt="ykk" width={36} height={36} draggable={false} className="block size-9 select-none" />
        </Link>
        <Link href="/" className="ml-2 hidden text-sm font-semibold text-black/60 hover:text-black sm:block">
          ← 탐험으로
        </Link>
        <nav className="ml-auto flex items-center gap-2">
          <Link href="/library" className="relative rounded-full border-2 border-black bg-[var(--paper)] px-3 py-2 text-sm font-semibold">
            작업실
            {saved.hydrated && saved.count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 grid min-w-5 place-items-center rounded-full border-2 border-black bg-[var(--verm)] px-1 text-[0.6rem] font-bold text-white">
                {compact(saved.count)}
              </span>
            )}
          </Link>
          <Magnetic>
            <Link href="/upload" className="btn-glow rounded-full border-2 border-black bg-[#111] px-3 py-2 text-sm font-semibold text-white">
              업로드
            </Link>
          </Magnetic>
        </nav>
      </div>
    </header>
  );
}
