import { Loader2 } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-background text-foreground">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          로딩 중...
        </p>
      </div>
    </div>
  );
}
