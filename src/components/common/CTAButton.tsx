"use client";

import { cn } from "@/lib/utils";

interface CTAButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  primary?: boolean;
}

export default function CTAButton({
  children,
  primary = false,
  className,
  ...props
}: CTAButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center gap-2.5 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
        primary 
          ? "btn-pill-primary" 
          : "btn-pill-secondary",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
