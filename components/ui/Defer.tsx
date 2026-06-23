"use client";

// 지연 마운트 래퍼 — 뷰포트 근처(rootMargin)에 올 때까지 무거운 자식 렌더를 미룬다.
// IntersectionObserver 로 화면 앞에서 1회 마운트하고 이후 유지(언마운트 X → 다시 스크롤해도 깜빡임 없음).
// 긴 이미지 그리드(피드)에서 화면 밖 타일의 SVG/이미지/그림자 페인트·디코드를 건너뛰기 위함.
// "안 보이는 부분은 늦게 렌더링" — 보일 땐 100% 동일, 안 보일 땐 비용 0.
import { useEffect, useRef, useState, type ReactNode } from "react";

export function Defer({
  children,
  rootMargin = "600px",
  className,
}: {
  children: ReactNode;
  /** 뷰포트보다 이만큼 앞에서 미리 마운트 (보이기 전에 준비 → 팝인 안 보임) */
  rootMargin?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (show) return;
    const el = ref.current;
    if (!el) return;
    // IO 미지원 환경(구형/SSR 등)에선 즉시 마운트해 안전 폴백
    if (typeof IntersectionObserver === "undefined") {
      setShow(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [show, rootMargin]);

  return (
    <span ref={ref} className={className}>
      {show ? children : null}
    </span>
  );
}
