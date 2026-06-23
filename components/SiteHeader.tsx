"use client";

// 하위 페이지(상세/프로필/라이브러리/업로드) 공용 헤더
//  · 로그아웃 상태: 로그인 / 회원가입
//  · 로그인 상태: 작업실 · 업로드 · 아바타(→ 마이페이지)
import Link from "next/link";
import { useSaved } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { compact } from "@/lib/format";
import { Magnetic } from "@/components/ui/Magnetic";
import { Avatar } from "@/components/auth/Avatar";

export function SiteHeader() {
  const saved = useSaved();
  const { user, hydrated } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b-2 border-black bg-[var(--canvas)]">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
        <Link href="/" aria-label="ykk 홈" className="flex items-center">
          <img src="/logo.png" alt="ykk" width={48} height={48} draggable={false} className="block size-12 select-none" />
        </Link>
        <Link href="/" className="ml-2 hidden text-sm font-semibold text-black/60 hover:text-black sm:block">
          ← 탐험으로
        </Link>

        <nav className="ml-auto flex items-center gap-2">
          {!hydrated ? (
            // 하이드레이션 전: 레이아웃 점프 방지용 자리
            <span className="skeleton h-9 w-24 rounded-full border-2 border-black" />
          ) : user ? (
            <>
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
              <Link
                href="/mypage"
                aria-label="마이페이지"
                className="flex items-center gap-2 rounded-full border-2 border-black bg-[var(--paper)] py-1 pl-1 pr-3 transition-transform hover:-translate-y-0.5"
              >
                <Avatar nickname={user.nickname} color={user.avatarColor} size={30} />
                <span className="hidden max-w-[8rem] truncate text-sm font-semibold sm:block">{user.nickname}</span>
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-full border-2 border-black bg-[var(--paper)] px-4 py-2 text-sm font-semibold">
                로그인
              </Link>
              <Magnetic>
                <Link href="/signup" className="btn-glow rounded-full border-2 border-black bg-[var(--sun)] px-4 py-2 text-sm font-semibold" data-glow="ink">
                  회원가입
                </Link>
              </Magnetic>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
