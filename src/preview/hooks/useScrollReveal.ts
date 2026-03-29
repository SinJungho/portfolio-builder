"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

type RevealPreset = "fadeUp" | "fadeIn" | "scaleIn";

interface UseScrollRevealOptions {
  threshold?: number;
  delay?: number;
  once?: boolean;
}

const PRESETS: Record<RevealPreset, { from: React.CSSProperties; to: React.CSSProperties }> = {
  fadeUp: {
    from: { opacity: 0, transform: "translateY(40px)" },
    to: { opacity: 1, transform: "translateY(0)" },
  },
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  scaleIn: {
    from: { opacity: 0, transform: "scale(0.92)" },
    to: { opacity: 1, transform: "scale(1)" },
  },
};

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  preset: RevealPreset = "fadeUp",
  options: UseScrollRevealOptions = {}
): { ref: RefObject<T | null>; style: React.CSSProperties } {
  const { threshold = 0.15, delay = 0, once = true } = options;
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, once]);

  const { from, to } = PRESETS[preset];

  const style: React.CSSProperties = {
    ...(isVisible ? to : from),
    transition: `opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
    willChange: "opacity, transform",
  };

  return { ref, style };
}

/** Stagger helper — returns an array of { ref, style } for N items */
export function useStaggerReveal<T extends HTMLElement = HTMLDivElement>(
  count: number,
  preset: RevealPreset = "fadeUp",
  options: UseScrollRevealOptions & { staggerDelay?: number } = {}
) {
  const { staggerDelay = 100, ...restOptions } = options;
  return Array.from({ length: count }, (_, i) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useScrollReveal<T>(preset, { ...restOptions, delay: (restOptions.delay || 0) + i * staggerDelay })
  );
}
