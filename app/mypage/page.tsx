"use client";

// 마이페이지 — 프로필 + 활동 요약(저장/구매/게시) + 프로필 편집 + 로그아웃.
//  · AuthGate 로 보호: 미로그인 시 그 자리에 로그인/회원가입 CTA.
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, AVATAR_COLORS } from "@/lib/auth";
import { useSaved } from "@/lib/store";
import { SiteHeader } from "@/components/SiteHeader";
import { AuthGate } from "@/components/auth/AuthGate";
import { Avatar } from "@/components/auth/Avatar";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { Magnetic } from "@/components/ui/Magnetic";

export default function MyPage() {
  return (
    <>
      <SiteHeader />
      <AuthGate
        title="마이페이지는 로그인 후에"
        description="프로필과 활동 내역은 내 계정에 연결돼요. 로그인하거나 가입하면 바로 볼 수 있어요."
      >
        <MyPageContent />
      </AuthGate>
    </>
  );
}

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return iso.slice(0, 10);
  }
}

function MyPageContent() {
  const { user, updateProfile, logOut } = useAuth();
  const saved = useSaved();
  const router = useRouter();

  const [nickname, setNickname] = useState(user?.nickname ?? "");
  const [color, setColor] = useState(user?.avatarColor ?? AVATAR_COLORS[0]);
  const [savedFlash, setSavedFlash] = useState(false);

  if (!user) return null;

  const dirty = nickname.trim() !== user.nickname || color !== user.avatarColor;

  const save = () => {
    if (!dirty) return;
    updateProfile({ nickname, avatarColor: color });
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1600);
  };

  const handleLogout = () => {
    logOut();
    router.push("/");
  };

  const stats: Array<{ label: string; value: number; href: string; tint: string }> = [
    { label: "저장한 레시피", value: saved.count, href: "/library", tint: "var(--sun)" },
    { label: "구매한 레시피", value: saved.purchased.length, href: "/library", tint: "var(--mint)" },
    { label: "내가 올린 레시피", value: saved.mine.length, href: "/library", tint: "var(--sky)" },
  ];

  return (
    <main className="mx-auto max-w-3xl px-4 pb-16 pt-6">
      <p className="mono-font text-[0.62rem] uppercase tracking-[0.2em] text-black/55">my account</p>
      <h1 className="display-font text-3xl font-black">마이페이지</h1>

      {/* 프로필 카드 */}
      <Reveal className="mt-5 sticker flex flex-wrap items-center gap-4 p-5">
        <Avatar nickname={user.nickname} color={user.avatarColor} size={64} />
        <div className="min-w-0">
          <p className="display-font text-2xl font-black leading-tight">{user.nickname}</p>
          <p className="mono-font truncate text-sm text-black/55">{user.email}</p>
          <p className="mt-1 text-xs text-black/45">가입일 · {fmtDate(user.createdAt)}</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="ml-auto rounded-full border-2 border-black bg-[var(--paper)] px-4 py-2 text-sm font-semibold transition-transform hover:-translate-y-0.5"
          style={{ color: "var(--verm)" }}
        >
          로그아웃
        </button>
      </Reveal>

      {/* 활동 요약 */}
      <h2 className="mt-7 display-font text-lg font-black">활동 요약</h2>
      <StaggerGroup gap={0.05} className="mt-3 grid gap-3 sm:grid-cols-3">
        {stats.map((s) => (
          <StaggerItem key={s.label}>
            <Link
              href={s.href}
              className="block rounded-2xl border-2 border-black bg-[var(--paper)] p-4 shadow-[var(--shadow-hard-sm)] transition-transform hover:-translate-y-0.5"
            >
              <span className="inline-block size-3 rounded-full border-2 border-black" style={{ background: s.tint }} />
              <p className="mono-font mt-2 text-3xl font-black tabular-nums">{saved.hydrated ? s.value : "·"}</p>
              <p className="mt-0.5 text-sm text-black/60">{s.label}</p>
            </Link>
          </StaggerItem>
        ))}
      </StaggerGroup>
      <p className="mt-2 text-xs text-black/45">
        카드를 누르면 <Link href="/library" className="font-semibold underline underline-offset-2">내 작업실</Link>로 이동해요.
      </p>

      {/* 프로필 편집 */}
      <h2 className="mt-7 display-font text-lg font-black">프로필 편집</h2>
      <Reveal className="mt-3 sticker space-y-4 p-5">
        <label className="block rounded-xl border-2 border-black bg-[var(--paper-2)] p-3">
          <span className="mono-font text-[0.6rem] uppercase tracking-[0.16em] text-black/55">닉네임</span>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="닉네임"
            className="mt-1 w-full border-0 bg-transparent text-sm outline-none placeholder:text-black/35"
          />
        </label>

        <div className="rounded-xl border-2 border-black bg-[var(--paper-2)] p-3">
          <span className="mono-font text-[0.6rem] uppercase tracking-[0.16em] text-black/55">아바타 색</span>
          <div className="mt-2 flex items-center gap-3">
            <Avatar nickname={nickname || user.nickname} color={color} size={44} />
            <div className="flex flex-wrap gap-1.5">
              {AVATAR_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`색 ${c}`}
                  onClick={() => setColor(c)}
                  className="size-6 rounded-full border-2 border-black transition-transform hover:-translate-y-0.5"
                  style={{
                    background: `var(${c})`,
                    outline: color === c ? "2px solid var(--ink)" : "none",
                    outlineOffset: "2px",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Magnetic>
            <button
              type="button"
              onClick={save}
              disabled={!dirty}
              className="btn-glow rounded-full border-2 border-black bg-[#111] px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
            >
              변경사항 저장
            </button>
          </Magnetic>
          {savedFlash && (
            <span className="mono-font text-sm font-semibold" style={{ color: "var(--green)" }}>
              ✓ 저장됐어요
            </span>
          )}
        </div>
      </Reveal>
    </main>
  );
}
