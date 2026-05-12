"use client";

import { useRef, type RefObject } from "react";

type RevealPreset = "fadeUp" | "fadeIn" | "scaleIn";

const PRESETS: Record<RevealPreset, { style: React.CSSProperties }> = {
  fadeUp: {
    style: { opacity: 1, transform: "translateY(0)" },
  },
  fadeIn: {
    style: { opacity: 1 },
  },
  scaleIn: {
    style: { opacity: 1, transform: "scale(1)" },
  },
};

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  preset: RevealPreset = "fadeUp"
): { ref: RefObject<T | null>; style: React.CSSProperties } {
  const ref = useRef<T | null>(null);
  const { style } = PRESETS[preset];

  return { 
    ref, 
    style: {
      ...style,
      transition: "none",
    } 
  };
}

/** Stagger helper — returns an array of { ref, style } for N items */
export function useStaggerReveal<T extends HTMLElement = HTMLDivElement>(
  count: number,
  preset: RevealPreset = "fadeUp"
) {
  return Array.from({ length: count }, () =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useScrollReveal<T>(preset)
  );
}
