"use client";

// 보호 라우트 래퍼 — 미로그인 시 children 대신 그 자리에 로그인/회원가입 CTA 를 띄운다.
//  · 하이드레이션 전에는 스켈레톤(레이아웃 점프 방지)
//  · 로그인 후 원래 페이지로 복귀하도록 next 파라미터를 실어 보냄
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Reveal } from "@/components/ui/Reveal";
import { Magnetic } from "@/components/ui/Magnetic";

export function AuthGate({
  children,
  title = "로그인이 필요해요",
  description = "이 공간은 ykk 멤버를 위한 곳이에요. 로그인하거나 가입하면 바로 이어집니다.",
}: {
  children: React.ReactNode;
  title?: string;
  description?: string;
}) {
  const { user, hydrated } = useAuth();
  const pathname = usePathname();
  const next = encodeURIComponent(pathname || "/");

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="skeleton mx-auto h-64 max-w-md rounded-2xl border-2 border-black" />
      </div>
    );
  }

  if (user) return <>{children}</>;

  return (
    <main className="mx-auto grid min-h-[70vh] max-w-5xl place-items-center px-4 py-10">
      <Reveal className="sticker w-full max-w-md p-8 text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-full border-2 border-black bg-[var(--sun)] text-2xl">
          🔒
        </div>
        <h1 className="mt-4 display-font text-2xl font-black">{title}</h1>
        <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-black/65">{description}</p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Magnetic>
            <Link
              href={`/login?next=${next}`}
              className="btn-glow inline-block rounded-full border-2 border-black bg-[#111] px-6 py-2.5 text-sm font-semibold text-white"
            >
              로그인
            </Link>
          </Magnetic>
          <Magnetic>
            <Link
              href={`/signup?next=${next}`}
              className="btn-glow inline-block rounded-full border-2 border-black bg-[var(--sun)] px-6 py-2.5 text-sm font-semibold"
              data-glow="ink"
            >
              회원가입
            </Link>
          </Magnetic>
        </div>
        <Link href="/" className="mono-font mt-4 inline-block text-xs text-black/45 underline-offset-2 hover:underline">
          ← 캔버스로 돌아가기
        </Link>
      </Reveal>
    </main>
  );
}
