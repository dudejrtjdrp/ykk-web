// 모션 프리셋 — globals.css 의 모션 토큰과 동일한 감성으로 통일
// (--ease-standard, --ease-entrance / 단단하지만 부드러운 종이 물성)
import type { SpringOptions, Transition, Variants } from "framer-motion";

/** cubic-bezier 토큰 (CSS 변수와 1:1 매칭) */
export const EASE = {
  standard: [0.2, 0, 0, 1] as [number, number, number, number], // --ease-standard
  entrance: [0, 0.6, 0.3, 1] as [number, number, number, number], // --ease-entrance
  out: [0.16, 1, 0.3, 1] as [number, number, number, number], // 부드러운 감속
};

/** 스프링 프리셋 — 과하지 않은, 살짝 살아있는 정도 */
export const spring: Record<"soft" | "snappy" | "gentle" | "marsh", Transition> = {
  // 카드 hover / 일반 UI
  soft: { type: "spring", stiffness: 180, damping: 22, mass: 0.9 },
  // 버튼 press, 별 저장 등 또렷한 반응
  snappy: { type: "spring", stiffness: 360, damping: 24, mass: 0.7 },
  // 페이지 등장 — 아주 옅은 spring
  gentle: { type: "spring", stiffness: 120, damping: 20, mass: 1 },
  // 마그네틱/마시멜로 따라오기 — 느슨하고 말랑
  marsh: { type: "spring", stiffness: 150, damping: 15, mass: 0.6 },
};

/** useSpring 용 옵션(타입 'spring' 제외) — motion value 스프링에 사용 */
export const springOpts: Record<"soft" | "snappy" | "marsh", SpringOptions> = {
  soft: { stiffness: 180, damping: 22, mass: 0.9 },
  snappy: { stiffness: 360, damping: 24, mass: 0.7 },
  marsh: { stiffness: 150, damping: 15, mass: 0.6 },
};

/** 요소 1개 등장: opacity + 살짝 위로. scale 은 쓰지 않음(기획 원칙) */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE.entrance } },
};

/** 부모(스태거 컨테이너): 자식들을 순차적으로 깨움 */
export const stagger = (gap = 0.06, delay = 0.02): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: gap, delayChildren: delay } },
});

/** 오버레이/미리보기 pop-in */
export const popIn: Variants = {
  hidden: { opacity: 0, y: 8, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: spring.snappy },
  exit: { opacity: 0, y: 6, scale: 0.97, transition: { duration: 0.14, ease: EASE.standard } },
};
