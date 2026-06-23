import { notFound } from "next/navigation";
import { getCreator, getNodesByCreator } from "@/lib/api";
import { creators } from "@/lib/mock-data";
import { SiteHeader } from "@/components/SiteHeader";
import { NodeCard } from "@/components/NodeCard";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/ui/Reveal";

export function generateStaticParams() {
  return creators.map((c) => ({ id: c.id }));
}

export default async function CreatorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const creator = getCreator(id);
  if (!creator) notFound();
  const nodes = getNodesByCreator(id);

  const stats: Array<[string, string]> = [
    ["총 판매", creator.sales.toLocaleString()],
    ["팔로워", creator.followers.toLocaleString()],
    ["재현성 평균", `${creator.avgRepro}%`],
    ["작품", String(nodes.length)],
  ];

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 pb-16 pt-6">
        {/* 작업실 헤더 (상점이 아니라 작업실) */}
        <Reveal as="section" className="sticker overflow-hidden">
          <div className="h-24 w-full border-b-2 border-black wall-grain" style={{ background: creator.color }} />
          <div className="p-5">
            <div className="-mt-12 flex items-end gap-4">
              <span className="grid size-20 place-items-center rounded-2xl border-2 border-black bg-[var(--paper)] display-font text-3xl font-black shadow-[var(--shadow-hard-sm)]">
                {creator.name.at(0)}
              </span>
              <div className="pb-1">
                <h1 className="display-font text-3xl font-black leading-none">
                  {creator.name}
                  {creator.verified && <span className="ml-1 text-[var(--cobalt)]" title="인증됨">✓</span>}
                </h1>
                <p className="mono-font text-sm text-black/55">@{creator.handle}</p>
              </div>
            </div>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-black/75">{creator.bio}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {stats.map(([l, v]) => (
                <div key={l} className="rounded-xl border-2 border-black bg-[var(--paper-2)] p-3 text-center">
                  <p className="display-font text-2xl font-black leading-none">{v}</p>
                  <p className="mono-font mt-1 text-[0.55rem] uppercase tracking-[0.16em] text-black/50">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* 작업실 = 작품 벽 */}
        <h2 className="display-font mb-3 mt-6 text-xl font-black">작업실</h2>
        <StaggerGroup gap={0.05} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {nodes.map((n) => (
            <StaggerItem key={n.id}>
              <NodeCard node={n} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      </main>
    </>
  );
}
