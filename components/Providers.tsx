"use client";

// 앱 전역 클라이언트 프로바이더
// - MotionConfig reducedMotion="user": OS 의 "동작 줄이기" 설정을 모든 Framer Motion 에 자동 반영
// - 기존 SavedProvider(작업실 저장 상태) 유지
import { MotionConfig } from "framer-motion";
import { SavedProvider } from "@/lib/store";
import { RecipeModalProvider } from "@/components/recipe/RecipeModalProvider";
import { EASE } from "@/lib/motion";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.4, ease: EASE.standard }}>
      <SavedProvider>
        <RecipeModalProvider>{children}</RecipeModalProvider>
      </SavedProvider>
    </MotionConfig>
  );
}
