"use client";

// 계정/세션 상태 — localStorage 영속, SSR 안전 가드 (store.tsx 와 동일 패턴)
//  · 데모 MVP 용 인증: 회원가입 시 계정을 localStorage 에 저장, 로그인 시 검증.
//  · 비밀번호는 데모 목적의 가벼운 해시(djb2)로만 저장 — 실서비스 보안용 아님.
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const ACCOUNTS_KEY = "ykk.accounts.v1";
const SESSION_KEY = "ykk.session.v1";

/** 아바타 색 팔레트 — 디자인 토큰(globals.css)과 1:1 */
export const AVATAR_COLORS = ["--sun", "--verm", "--cobalt", "--green", "--sky", "--mint"] as const;
export type AvatarColor = (typeof AVATAR_COLORS)[number];

/** 저장되는 계정 레코드 (passHash 포함 — 내부용) */
interface Account {
  email: string;
  passHash: string;
  nickname: string;
  avatarColor: AvatarColor;
  createdAt: string; // ISO
}

/** 화면에 노출되는 사용자 (비밀번호 해시 제외) */
export type PublicUser = Omit<Account, "passHash">;

export interface SignUpInput {
  email: string;
  password: string;
  nickname: string;
  avatarColor?: AvatarColor;
}

export interface AuthResult {
  ok: boolean;
  error?: string;
}

interface AuthContextValue {
  user: PublicUser | null;
  hydrated: boolean;
  signUp: (input: SignUpInput) => AuthResult;
  logIn: (email: string, password: string) => AuthResult;
  logOut: () => void;
  updateProfile: (patch: Partial<Pick<Account, "nickname" | "avatarColor">>) => void;
  /** 시연 안내용 — 미리 심어둔 데모 계정 자격증명 */
  demoCredentials: { email: string; password: string };
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ── 헬퍼 ──────────────────────────────────────────────
/** 데모용 가벼운 해시 (djb2). 비밀번호를 평문으로 두지 않기 위한 최소 장치일 뿐. */
function hash(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export function isEmail(v: string): boolean {
  return EMAIL_RE.test(v.trim());
}

/** 이메일에서 결정적으로 아바타 색 하나 고르기 */
export function colorFromEmail(email: string): AvatarColor {
  const n = parseInt(hash(email.toLowerCase()), 36);
  return AVATAR_COLORS[n % AVATAR_COLORS.length];
}

const DEMO = {
  email: "demo@ykk.kr",
  password: "demo1234",
  nickname: "데모 탐험가",
};

function seedDemo(): Account {
  return {
    email: DEMO.email,
    passHash: hash(DEMO.password),
    nickname: DEMO.nickname,
    avatarColor: "--sun",
    createdAt: "2026-01-02T09:00:00.000Z",
  };
}

const toPublic = (a: Account): PublicUser => ({
  email: a.email,
  nickname: a.nickname,
  avatarColor: a.avatarColor,
  createdAt: a.createdAt,
});

// ── Provider ─────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let loaded: Account[] = [];
    try {
      const raw = window.localStorage.getItem(ACCOUNTS_KEY);
      if (raw) loaded = JSON.parse(raw) as Account[];
    } catch {
      // ignore
    }
    // 데모 계정이 없으면 심어둔다 (바로 로그인 시연 가능)
    if (!loaded.some((a) => a.email === DEMO.email)) loaded = [seedDemo(), ...loaded];
    setAccounts(loaded);

    try {
      const s = window.localStorage.getItem(SESSION_KEY);
      if (s && loaded.some((a) => a.email === s)) setSessionEmail(s);
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    } catch {
      // ignore
    }
  }, [accounts, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      if (sessionEmail) window.localStorage.setItem(SESSION_KEY, sessionEmail);
      else window.localStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore
    }
  }, [sessionEmail, hydrated]);

  const signUp = useCallback(
    (input: SignUpInput): AuthResult => {
      const email = input.email.trim().toLowerCase();
      const nickname = input.nickname.trim();
      if (!isEmail(email)) return { ok: false, error: "올바른 이메일 형식이 아니에요." };
      if (nickname.length < 1) return { ok: false, error: "닉네임을 입력해 주세요." };
      if (input.password.length < 4) return { ok: false, error: "비밀번호는 4자 이상이어야 해요." };
      if (accounts.some((a) => a.email === email))
        return { ok: false, error: "이미 가입된 이메일이에요. 로그인해 주세요." };

      const account: Account = {
        email,
        passHash: hash(input.password),
        nickname,
        avatarColor: input.avatarColor ?? colorFromEmail(email),
        createdAt: new Date().toISOString(),
      };
      setAccounts((prev) => [...prev, account]);
      setSessionEmail(email); // 가입 즉시 로그인
      return { ok: true };
    },
    [accounts],
  );

  const logIn = useCallback(
    (emailRaw: string, password: string): AuthResult => {
      const email = emailRaw.trim().toLowerCase();
      const account = accounts.find((a) => a.email === email);
      if (!account) return { ok: false, error: "가입되지 않은 이메일이에요." };
      if (account.passHash !== hash(password))
        return { ok: false, error: "비밀번호가 일치하지 않아요." };
      setSessionEmail(email);
      return { ok: true };
    },
    [accounts],
  );

  const logOut = useCallback(() => setSessionEmail(null), []);

  const updateProfile = useCallback(
    (patch: Partial<Pick<Account, "nickname" | "avatarColor">>) => {
      setAccounts((prev) =>
        prev.map((a) =>
          a.email === sessionEmail
            ? {
                ...a,
                ...(patch.nickname !== undefined ? { nickname: patch.nickname.trim() || a.nickname } : {}),
                ...(patch.avatarColor !== undefined ? { avatarColor: patch.avatarColor } : {}),
              }
            : a,
        ),
      );
    },
    [sessionEmail],
  );

  const user = useMemo<PublicUser | null>(() => {
    const a = accounts.find((x) => x.email === sessionEmail);
    return a ? toPublic(a) : null;
  }, [accounts, sessionEmail]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      hydrated,
      signUp,
      logIn,
      logOut,
      updateProfile,
      demoCredentials: { email: DEMO.email, password: DEMO.password },
    }),
    [user, hydrated, signUp, logIn, logOut, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
