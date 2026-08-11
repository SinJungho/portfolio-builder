import { Loader2 } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background p-6 text-foreground">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          로딩 중...
        </p>
      </div>
    </div>
  );
}
