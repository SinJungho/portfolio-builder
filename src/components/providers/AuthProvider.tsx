"use client";

import { useEffect } from "react";
import { SessionProvider, useSession, signOut } from "next-auth/react";

function SessionMonitor(): null {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== "authenticated" || !session?.expires) {
      return;
    }

    const checkSessionExpiration = (): void => {
      const expireTime: number = new Date(session.expires).getTime();
      const currentTime: number = Date.now();
      const timeLeft: number = expireTime - currentTime;

      if (timeLeft <= 0) {
        // 즉시 로그아웃 및 만료 안내 쿼리 전달
        signOut({ redirect: true, callbackUrl: "/login?expired=true" });
      }
    };

    // 마운트 및 세션 변경 시 즉시 잔여 세션 시간 확인
    checkSessionExpiration();

    // 10초 주기로 지속 모니터링 (백그라운드 활성 탭 및 타이머 지연 방어)
    const intervalId: NodeJS.Timeout = setInterval(checkSessionExpiration, 10000);

    // 창 포커스를 되찾을 때 (절전 모드 해제 등) 즉시 재확인
    const handleFocus = (): void => {
      checkSessionExpiration();
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
    };
  }, [session, status]);

  return null;
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SessionMonitor />
      {children}
    </SessionProvider>
  );
}
