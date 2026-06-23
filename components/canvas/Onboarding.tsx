"use client";

// 비차단형 온보딩 힌트 (기획서 3.7) — 설명서가 아니라 가벼운 한 줄 힌트
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { spring } from "@/lib/motion";

const KEY = "ykk.onboarded.v1";

export function Onboarding() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(KEY)) setShow(true);
    } catch {
      /* ignore */
    }
  }, []);

  const dismiss = () => {
    setShow(false);
    try {
      window.localStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
  };

  if (!show) return null;

  return (
    <div className="pointer-events-auto absolute bottom-6 left-1/2 z-40 -translate-x-1/2">
      <motion.div
        initial={{ opacity: 0, y: 14, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={spring.soft}
        className="hud-chip flex items-center gap-3 py-2 pl-4 pr-2 text-sm"
      >
        <span className="font-semibold">떠다니다 발견하세요</span>
        <span className="hidden text-black/55 sm:inline">드래그로 이동 · 스크롤로 줌 · 클릭으로 상세</span>
        <button
          type="button"
          onClick={dismiss}
          aria-label="힌트 닫기"
          className="grid size-6 shrink-0 place-items-center rounded-full text-black/45 hover:bg-[var(--paper-2)] hover:text-black"
        >
          ✕
        </button>
      </motion.div>
    </div>
  );
}
