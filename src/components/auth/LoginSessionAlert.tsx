"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { errorMessage } from "@/lib/api/errors";

export default function LoginSessionAlert(): null {
  const searchParams = useSearchParams();

  useEffect(() => {
    const expired: string | null = searchParams.get("expired");

    if (expired === "true") {
      // 만료된 세션을 로그아웃 처리하고 안내한다.
      toast.error(errorMessage("SESSION_EXPIRED"));

      // 만료 알림용 쿼리 파라미터를 제거한다.
      const url: URL = new URL(window.location.href);
      url.searchParams.delete("expired");
      window.history.replaceState(
        {},
        document.title,
        url.pathname + url.search,
      );
    }
  }, [searchParams]);

  return null;
}
