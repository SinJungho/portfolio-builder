"use client";

import { useMemo, useEffect, useState } from "react";
import { DesignTokens } from "@/schemas/portfolio";

interface DynamicThemeProviderProps {
  tokens?: DesignTokens;
  children: React.ReactNode;
}

/**
 * 사용자 정의 디자인 토큰을 런타임 CSS 변수로 주입하는 프로바이더
 * 실시간 메시지 수신(postMessage) 기능을 포함하여 대시보드 커스터마이저와 연동됩니다.
 */
export default function DynamicThemeProvider({
  tokens: initialTokens,
  children,
}: DynamicThemeProviderProps) {
  // 실시간 미리보기 상태 (대시보드에서 보낸 메시지로 업데이트)
  const [liveTokens, setLiveTokens] = useState<DesignTokens | undefined>(initialTokens);

  // 대시보드 커스터마이저에서 온 메시지 수신
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "PORTFOLIO_THEME_UPDATE" && event.data?.tokens) {
        setLiveTokens(event.data.tokens);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // initialTokens가 서버 사이드에서 바뀌었을 때 동기화 (예: 새로고침 후)
  useEffect(() => {
    setLiveTokens(initialTokens);
  }, [initialTokens]);

  const tokens = liveTokens || initialTokens;

  // 폰트 매핑
  const fontMap: Record<string, string> = {
    inter: "var(--font-inter)",
    pretendard: "var(--font-sans)",
    "fira-code": "var(--font-fira-code)",
    playfair: "var(--font-playfair)",
  };

  const radiusMap: Record<string, string> = {
    none: "0px",
    sm: "0.25rem",
    md: "0.5rem",
    lg: "1rem",
    full: "9999px",
  };

  const dynamicStyles = useMemo(() => {
    if (!tokens) return "";
    const styles: string[] = [];

    if (tokens.primaryColor) {
      styles.push(`--primary: ${tokens.primaryColor};`);
    }

    if (tokens.fontFamily) {
      const selectedFont = fontMap[tokens.fontFamily] || "var(--font-sans)";
      styles.push(`--font-main: ${selectedFont};`);
    }

    if (tokens.borderRadius) {
      styles.push(`--radius: ${radiusMap[tokens.borderRadius] || "0.5rem"};`);
    }

    if (tokens.spacing) {
      const spacingValues: Record<string, string> = {
        compact: "0.75",
        normal: "1",
        relaxed: "1.25",
      };
      styles.push(`--spacing-multiplier: ${spacingValues[tokens.spacing] || "1"};`);
    }

    return styles.join(" ");
  }, [tokens]);

  return (
    <>
      {dynamicStyles && (
        <style dangerouslySetInnerHTML={{ __html: `:root { ${dynamicStyles} }` }} />
      )}
      {children}
    </>
  );
}
