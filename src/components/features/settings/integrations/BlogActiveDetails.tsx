import { Integration } from "@/types/integration";
import { CheckCircle2, Link2 } from "lucide-react";
import { getProviderDisplayName, getProviderStyles } from "./utils";

interface BlogActiveDetailsProps {
  blogIntegration: Integration;
}

export function BlogActiveDetails({ blogIntegration }: BlogActiveDetailsProps) {
  const theme = getProviderStyles(blogIntegration.provider);

  return (
    <dl className="p-5 bg-white/5 border border-white/5 rounded-lg grid grid-cols-[105px_1fr] gap-x-3 gap-y-3 text-[13px] text-spotify-silver animate-in fade-in duration-300">
      <dt className="flex items-center gap-1.5 font-bold text-white align-middle">
        <Link2
          className="w-4 h-4 text-spotify-green shrink-0"
          aria-hidden="true"
        />
        피드 주소
      </dt>
      <dd className="truncate max-w-xs sm:max-w-md font-mono self-center">
        {blogIntegration.metadata?.feedUrl as string}
      </dd>

      <dt className="flex items-center gap-1.5 font-bold text-white align-middle">
        <CheckCircle2
          className="w-4 h-4 text-spotify-green shrink-0"
          aria-hidden="true"
        />
        서비스
      </dt>
      <dd className="self-center">
        <span
          className={`uppercase font-bold text-[11px] border px-2 py-0.5 rounded inline-block ${theme.badge}`}
        >
          {getProviderDisplayName(blogIntegration.provider)}
        </span>
      </dd>

      <dt className="font-bold text-white pl-5.5 self-center">최근 동기화</dt>
      <dd className="self-center">
        {blogIntegration.synced_at
          ? new Date(blogIntegration.synced_at).toLocaleString("ko-KR")
          : "없음"}
      </dd>
    </dl>
  );
}
