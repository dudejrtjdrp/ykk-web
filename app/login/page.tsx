"use client";

// 로그인 — 저장된 계정을 검증. 성공 시 next(또는 마이페이지)로 이동.
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { AuthShell, AuthInput, AuthError } from "@/components/auth/authUI";
import { Magnetic } from "@/components/ui/Magnetic";

function LoginInner() {
  const { logIn, user, hydrated, demoCredentials } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/mypage";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | undefined>();

  // 이미 로그인 상태면 통과
  useEffect(() => {
    if (hydrated && user) router.replace(next);
  }, [hydrated, user, next, router]);

  const submit = () => {
    const res = logIn(email, password);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    router.replace(next);
  };

  const fillDemo = () => {
    setEmail(demoCredentials.email);
    setPassword(demoCredentials.password);
    setError(undefined);
  };

  return (
    <AuthShell
      eyebrow="welcome back"
      title="로그인"
      subtitle="검증된 AI 레시피를 작업실에 모으고, 내 레시피를 올려보세요."
      footer={
        <>
          아직 계정이 없으세요?{" "}
          <Link href={`/signup?next=${encodeURIComponent(next)}`} className="font-bold underline underline-offset-2">
            회원가입
          </Link>
        </>
      }
    >
      <div className="space-y-3">
        <AuthError message={error} />
        <AuthInput
          label="이메일"
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          mono
        />
        <AuthInput
          label="비밀번호"
          type="password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
          onEnter={submit}
        />
        <Magnetic className="w-full">
          <button
            type="button"
            onClick={submit}
            className="btn-glow w-full rounded-full border-2 border-black bg-[#111] px-6 py-3 text-sm font-semibold text-white"
          >
            로그인
          </button>
        </Magnetic>

        {/* 시연용 데모 계정 안내 */}
        <div className="rounded-xl border-2 border-dashed border-black/25 bg-[var(--paper-2)] p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs leading-5 text-black/60">
              <span className="mono-font font-bold text-black">데모 계정</span>으로 바로 둘러보기
              <br />
              <span className="mono-font">{demoCredentials.email}</span> / <span className="mono-font">{demoCredentials.password}</span>
            </p>
            <button
              type="button"
              onClick={fillDemo}
              className="shrink-0 rounded-full border-2 border-black bg-[var(--sun)] px-3 py-1.5 text-xs font-semibold transition-transform hover:-translate-y-0.5"
            >
              채우기
            </button>
          </div>
        </div>
      </div>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
