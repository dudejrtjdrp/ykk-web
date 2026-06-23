"use client";

import Link from "next/link";
import { useSaved } from "@/lib/store";
import { nodeBySlug } from "@/lib/mock-data";
import { SiteHeader } from "@/components/SiteHeader";
import { NodeCard } from "@/components/NodeCard";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { Magnetic } from "@/components/ui/Magnetic";

export default function LibraryPage() {
  const saved = useSaved();
  const nodes = saved.saved.map((s) => nodeBySlug[s]).filter(Boolean);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 pb-16 pt-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="mono-font text-[0.62rem] uppercase tracking-[0.2em] text-black/55">my studio</p>
            <h1 className="display-font text-3xl font-black">내 작업실</h1>
          </div>
          <Magnetic>
            <Link href="/" className="btn-glow rounded-full border-2 border-black bg-[#111] px-4 py-2 text-sm font-semibold text-white">
              탐험하러 가기
            </Link>
          </Magnetic>
        </div>

        {!saved.hydrated ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton h-44 rounded-2xl border-2 border-black" />
            ))}
          </div>
        ) : nodes.length === 0 ? (
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
            <p className="mt-3 text-sm text-black/55">
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
        )}
      </main>
    </>
  );
}
