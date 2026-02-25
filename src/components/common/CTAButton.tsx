"use client";

import { useState } from "react";

export default function CTAButton({
  children,
  primary = false,
}: {
  children: React.ReactNode;
  primary?: boolean;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "14px 28px",
        borderRadius: 50,
        border: "none",
        fontSize: 16,
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.2s ease",
        ...(primary
          ? {
              background: hover ? "#1A6EE8" : "#191F28",
              color: "white",
              boxShadow: hover
                ? "0 8px 24px rgba(49,130,246,0.35)"
                : "0 4px 16px rgba(0,0,0,0.12)",
              transform: hover ? "translateY(-2px)" : "translateY(0)",
            }
          : {
              background: hover ? "rgba(0,0,0,0.06)" : "rgba(0,0,0,0.04)",
              color: "#4B5563",
              border: "1px solid rgba(0,0,0,0.1)",
            }),
      }}
    >
      {children}
    </button>
  );
}
