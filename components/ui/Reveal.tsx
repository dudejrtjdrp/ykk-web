"use client";

// 등장/스크롤 리빌 프리미티브
//  · Reveal: 뷰포트에 들어올 때 opacity + 살짝 위로(스프링 없는 옅은 감속). scale 없음.
//  · StaggerGroup/Item: 자식들을 순차적으로 깨움 ("웹페이지가 깨어나는 느낌")
//  · MotionConfig reducedMotion="user" 가 transform 애니메이션을 자동 차단 → 내용은 항상 보임
import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import { EASE } from "@/lib/motion";

const MOTION_TAGS = { div: motion.div, section: motion.section, li: motion.li, article: motion.article };

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** 등장 지연(초) */
  delay?: number;
  /** 시작 y 오프셋(px) */
  y?: number;
  /** 한 번만 재생 */
  once?: boolean;
  /** 렌더할 태그 (시맨틱 유지용) */
  as?: keyof typeof MOTION_TAGS;
}

export function Reveal({ children, className, delay = 0, y = 14, once = true, as = "div" }: RevealProps) {
  const Tag = MOTION_TAGS[as];
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount: 0.2, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.55, ease: EASE.entrance, delay }}
    >
      {children}
    </Tag>
  );
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE.entrance } },
};

export function StaggerGroup({
  children,
  className,
  gap = 0.06,
  delay = 0.02,
  once = true,
  amount = 0.15,
}: {
  children: ReactNode;
  className?: string;
  gap?: number;
  delay?: number;
  once?: boolean;
  amount?: number | "some" | "all";
}) {
  return (
    <motion.div
      className={className}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap, delayChildren: delay } } }}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}
