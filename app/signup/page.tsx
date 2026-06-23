"use client";

// 회원가입 — 계정을 localStorage 에 저장하고 즉시 로그인. 성공 시 next(또는 마이페이지)로.
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, AVATAR_COLORS, type AvatarColor } from "@/lib/auth";
import { AuthShell, AuthInput, AuthError } from "@/components/auth/authUI";
import { Avatar } from "@/components/auth/Avatar";
import { Magnetic } from "@/components/ui/Magnetic";

function SignupInner() {
  const { signUp, user, hydrated } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/mypage";

  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [color, setColor] = useState<AvatarColor>(AVATAR_COLORS[0]);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (hydrated && user) router.replace(next);
  }, [hydrated, user, next, router]);

  const submit = () => {
    if (password !== confirm) {
      setError("비밀번호가 서로 달라요.");
      return;
    }
    const res = signUp({ nickname, email, password, avatarColor: color });
    if (!res.ok) {
      setError(res.error);
      return;
    }
    router.replace(next);
  };

  return (
    <AuthShell
      eyebrow="join ykk"
      title="회원가입"
      subtitle="이메일만 있으면 됩니다. make it, prove it — 검증된 레시피의 세계로."
      footer={
        <>
          이미 멤버이신가요?{" "}
          <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-bold underline underline-offset-2">
            로그인
          </Link>
        </>
      }
    >
      <div className="space-y-3">
        <AuthError message={error} />

        {/* 아바타 미리보기 + 색 선택 */}
        <div className="flex items-center gap-3 rounded-xl border-2 border-black bg-[var(--paper-2)] p-3">
          <Avatar nickname={nickname || "?"} color={color} size={48} />
          <div>
            <span className="mono-font text-[0.6rem] uppercase tracking-[0.16em] text-black/55">아바타 색</span>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
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

        <AuthInput label="닉네임" name="nickname" autoComplete="nickname" value={nickname} onChange={setNickname} placeholder="탐험가의 이름" />
        <AuthInput label="이메일" type="email" name="email" autoComplete="email" value={email} onChange={setEmail} placeholder="you@example.com" mono />
        <AuthInput label="비밀번호 (4자 이상)" type="password" name="new-password" autoComplete="new-password" value={password} onChange={setPassword} placeholder="••••••••" />
        <AuthInput label="비밀번호 확인" type="password" name="confirm-password" autoComplete="new-password" value={confirm} onChange={setConfirm} placeholder="••••••••" onEnter={submit} />

        <Magnetic className="w-full">
          <button
            type="button"
            onClick={submit}
            className="btn-glow w-full rounded-full border-2 border-black bg-[var(--verm)] px-6 py-3 text-sm font-semibold text-white"
          >
            가입하고 시작하기
          </button>
        </Magnetic>
        <p className="text-center text-[0.7rem] leading-5 text-black/45">
          데모용 계정은 이 브라우저(localStorage)에만 저장돼요.
        </p>
      </div>
    </AuthShell>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupInner />
    </Suspense>
  );
}
