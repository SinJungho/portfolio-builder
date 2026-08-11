"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background p-6 text-foreground">
      <div className="w-full max-w-md flex flex-col items-center gap-6 text-center">
        <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">문제가 발생했습니다</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            예기치 않은 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
          </p>
          {error.digest && (
            <p className="text-xs font-mono text-muted-foreground/50 mt-2">
              오류 코드: {error.digest}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => window.location.href = "/"}>
            홈으로 돌아가기
          </Button>
          <Button onClick={reset} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            다시 시도
          </Button>
        </div>
      </div>
    </div>
  );
}
