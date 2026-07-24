"use client";

import { useReducedMotion } from "framer-motion";
import useReveal from "@/hooks/useReveal";

export default function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, visible } = useReveal();
  const reduceMotion = useReducedMotion();

  // 모션 최소화 설정이면 이동/페이드 없이 즉시 보여준다.
  const style = reduceMotion
    ? { opacity: 1 }
    : {
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0px)" : "translateY(32px)",
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      };

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
