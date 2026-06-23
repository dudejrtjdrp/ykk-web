"use client";

import { useState } from "react";
import Link from "next/link";
import { useSaved } from "@/lib/store";
import { nodeBySlug } from "@/lib/mock-data";
import { SiteHeader } from "@/components/SiteHeader";
import { AuthGate } from "@/components/auth/AuthGate";
import { NodeCard } from "@/components/NodeCard";
import { MyRecipeCard } from "@/components/MyRecipeCard";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { Magnetic } from "@/components/ui/Magnetic";

type Tab = "saved" | "mine";

export default function LibraryPage() {
  const saved = useSaved();
  const [tab, setTab] = useState<Tab>("saved");
  const nodes = saved.saved.map((s) => nodeBySlug[s]).filter(Boolean);
  const mine = saved.mine;

  const tabs: Array<{ id: Tab; label: string; count: number }> = [
    { id: "saved", label: "저장한 레시피", count: nodes.length },
    { id: "mine", label: "내가 올린 레시피", count: mine.length },
  ];

  return (
    <>
      <SiteHeader />
      <AuthGate
        title="작업실은 로그인 후에"
        description="저장한 레시피와 내가 올린 레시피는 내 계정에 보관돼요. 로그인하거나 가입하면 바로 이어집니다."
      >
      <main className="mx-auto max-w-5xl px-4 pb-16 pt-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="mono-font text-[0.62rem] uppercase tracking-[0.2em] text-black/55">my studio</p>
            <h1 className="display-font text-3xl font-black">내 작업실</h1>
          </div>
          <Magnetic>
            <Link href="/upload" className="btn-glow rounded-full border-2 border-black bg-[#111] px-4 py-2 text-sm font-semibold text-white">
              레시피 올리기
            </Link>
          </Magnetic>
        </div>

        {/* 탭 — 저장한 레시피 / 내가 올린 레시피 */}
        <div className="mt-5 inline-flex gap-1 rounded-full border-2 border-black bg-[var(--paper-2)] p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className="focus-ring rounded-full px-4 py-1.5 text-sm font-semibold transition-colors"
              style={tab === t.id ? { background: "#1a1a18", color: "#fff" } : { color: "rgba(0,0,0,0.6)" }}
            >
              {t.label}
              <span className="mono-font ml-1.5 text-xs opacity-70">{saved.hydrated ? t.count : "·"}</span>
            </button>
          ))}
        </div>

        {!saved.hydrated ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton h-44 rounded-2xl border-2 border-black" />
            ))}
          </div>
        ) : tab === "saved" ? (
          nodes.length === 0 ? (
            <Reveal className="mt-6 sticker grid place-items-center p-12 text-center">
              <div className="text-4xl">✦</div>
              <p className="mt-3 display-font text-2xl font-black">아직 비어 있어요</p>
              <p className="mt-2 max-w-sm text-sm text-black/60">
                캔버스를 떠다니다 마음에 드는 스티커를 ☆ 로 저장하면 여기에 모입니다.
              </p>
              <Magnetic>
                <Link href="/" className="btn-glow mt-4 rounded-full border-2 border-black bg-[var(--sun)] px-5 py-2.5 text-sm font-semibold" data-glow="ink">
                  캔버스로 가기
                </Link>
              </Magnetic>
            </Reveal>
          ) : (
            <>
              <p className="mt-4 text-sm text-black/55">
                저장한 레시피 <span className="mono-font font-bold text-black">{nodes.length}</span>개
              </p>
              <StaggerGroup gap={0.05} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {nodes.map((n) => (
                  <StaggerItem key={n.id}>
                    <NodeCard node={n} />
                  </StaggerItem>
                ))}
              </StaggerGroup>
            </>
          )
        ) : mine.length === 0 ? (
          <Reveal className="mt-6 sticker grid place-items-center p-12 text-center">
            <div className="text-4xl">✎</div>
            <p className="mt-3 display-font text-2xl font-black">아직 올린 레시피가 없어요</p>
            <p className="mt-2 max-w-sm text-sm text-black/60">
              재현성까지 검증해서 올리면, 검토를 거쳐 캔버스에 스티커로 안착합니다.
            </p>
            <Magnetic>
              <Link href="/upload" className="btn-glow mt-4 rounded-full border-2 border-black bg-[var(--sun)] px-5 py-2.5 text-sm font-semibold" data-glow="ink">
                레시피 올리러 가기
              </Link>
            </Magnetic>
          </Reveal>
        ) : (
          <>
            <p className="mt-4 text-sm text-black/55">
              내가 올린 레시피 <span className="mono-font font-bold text-black">{mine.length}</span>개
            </p>
            <StaggerGroup gap={0.05} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {mine.map((r) => (
                <StaggerItem key={r.slug}>
                  <MyRecipeCard recipe={r} />
                </StaggerItem>
              ))}
            </StaggerGroup>
          </>
        )}
      </main>
      </AuthGate>
    </>
  );
}
