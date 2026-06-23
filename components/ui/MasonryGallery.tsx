// 구매자 결과 갤러리 — Pinterest형 매스너리 (기획서 4.3.5)
// hover 시: 색면(이미지)이 프레임 안에서 살짝 확대(depth) + 카드가 부드럽게 떠오름
import type { GalleryResult } from "@/lib/types";

export function MasonryGallery({ results }: { results: GalleryResult[] }) {
  return (
    <div className="gap-3 [column-gap:0.75rem] columns-2 md:columns-3">
      {results.map((g) => (
        <figure
          key={g.id}
          className="img-frame lift group mb-3 break-inside-avoid overflow-hidden rounded-xl border-2 border-black hover:-translate-y-1 hover:shadow-[0_16px_28px_-18px_rgba(20,20,18,0.4)]"
        >
          <div className="relative" style={{ aspectRatio: String(1 / g.aspect) }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={g.image}
              alt={g.caption}
              loading="lazy"
              draggable={false}
              className="img-zoom absolute inset-0 h-full w-full object-cover"
              style={{ background: g.color }}
            />
            <span className="absolute left-2 top-2 mono-font rounded-full border-2 border-black bg-white px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.1em]">
              {g.kind}
            </span>
          </div>
          <figcaption className="border-t-2 border-black bg-[var(--paper)] p-3">
            <p className="text-sm font-semibold leading-snug text-[var(--ink)]">{g.caption}</p>
            <p className="mt-1 text-[0.72rem] font-medium text-[var(--ink-soft)]">by {g.author}</p>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
