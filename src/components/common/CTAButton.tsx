"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";

interface CTAButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  primary?: boolean;
  href?: string;
}

export default function CTAButton({
  children,
  primary = false,
  className,
  href,
  ...props
}: CTAButtonProps) {
  const styles = cn(
    "inline-flex items-center gap-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spotify-green focus-visible:ring-offset-2 focus-visible:ring-offset-spotify-near-black",
    primary ? "btn-pill-primary" : "btn-pill-secondary",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={styles}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={styles}
      {...props}
    >
      {children}
    </button>
  );
}
