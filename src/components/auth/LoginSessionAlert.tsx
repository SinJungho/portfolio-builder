"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export default function LoginSessionAlert(): null {
  const searchParams = useSearchParams();

  useEffect(() => {
    const expired: string | null = searchParams.get("expired");

    if (expired === "true") {
      // 보안을 위한 로그아웃 알림 (글로벌 한국어 토스트 오류 양식 준수)
      toast.error(
        "보안을 위해 로그인 세션이 만료되었습니다. 다시 로그인해 주세요.",
      );

      // 주소창에서 지저분한 ?expired=true 쿼리 문자열을 깔끔하게 소거
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
