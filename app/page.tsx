"use client";

// 홈 — 데스크톱은 무한 캔버스, 모바일은 큐레이션 피드 (기획서 2.9 / 8.1)
// 같은 데이터, 다른 투영. 언제든 서로 전환.
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CanvasStage } from "@/components/canvas/CanvasStage";
import { FeedView } from "@/components/feed/FeedView";

type Mode = "canvas" | "feed";

// 브랜드 로더 — 스피너 대신, 살짝 떠다니는 로고 + 숨쉬는 점 3개
function Splash() {
  return (
    <div className="grid h-dvh w-full place-items-center bg-[var(--canvas)] wall-grain">
      <div className="text-center">
        <motion.img
          src="/logo.png"
          alt="ykk"
          width={88}
          height={88}
          draggable={false}
          className="mx-auto block size-20 select-none"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1, y: [0, -7, 0] }}
          transition={{
            opacity: { duration: 0.4, ease: "easeOut" },
            scale: { duration: 0.4, ease: "easeOut" },
            y: { duration: 1.9, repeat: Infinity, ease: "easeInOut", delay: 0.4 },
          }}
        />
        <p className="mono-font mt-5 text-xs uppercase tracking-[0.3em] text-black/55">캔버스를 불러오는 중…</p>
        <div className="mt-3 flex justify-center gap-1.5" aria-hidden>
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="size-2 rounded-full bg-black/35"
              animate={{ y: [0, -6, 0], opacity: [0.35, 1, 0.35] }}
              transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut", delay: i * 0.15 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<Mode>("canvas");

  useEffect(() => {
    setMounted(true);
    try {
      if (window.matchMedia("(max-width: 767px)").matches) setMode("feed");
    } catch {
      /* ignore */
    }
  }, []);

  if (!mounted) return <Splash />;

  if (mode === "canvas") {
    return (
      <div className="h-dvh w-full overflow-hidden">
        <CanvasStage onRequestFeed={() => setMode("feed")} />
      </div>
    );
  }
  return <FeedView onRequestCanvas={() => setMode("canvas")} />;
}
