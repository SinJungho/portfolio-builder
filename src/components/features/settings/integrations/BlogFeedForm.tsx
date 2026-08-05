import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Lightbulb, Loader2 } from "lucide-react";
import React, { useState } from "react";
import { errorMessage } from "@/lib/api/errors";

interface BlogFeedFormProps {
  onConnect: (url: string) => void;
  isPending: boolean;
}

export function BlogFeedForm({ onConnect, isPending }: BlogFeedFormProps) {
  const [rssUrl, setRssUrl] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  // RSS URL 형식을 검증한다.
  const validateUrl = (url: string): boolean => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      setValidationError(errorMessage("BLOG_VALIDATION_FAILED"));
      return false;
    }

    const urlPattern = /^(https?:\/\/)[^\s/$.?#].[^\s]*$/i;
    if (!urlPattern.test(trimmedUrl)) {
      setValidationError(errorMessage("RSS_INVALID_URL"));
      return false;
    }

    setValidationError(null);
    return true;
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRssUrl(event.target.value);
    if (validationError) {
      setValidationError(null);
    }
  };

  const handleConnectSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedUrl = rssUrl.trim();
    if (!validateUrl(trimmedUrl)) {
      return;
    }
    onConnect(trimmedUrl);
  };

  return (
    <form
      onSubmit={handleConnectSubmit}
      className="mt-2 p-4 bg-white/5 border border-white/5 rounded-2xl space-y-4 animate-in slide-in-from-top-2 duration-300"
      noValidate
    >
      <div className="space-y-4">
        <label
          htmlFor="rss-feed"
          className="text-sm block pb-4 mb-0 font-bold text-white"
        >
          RSS 피드 URL 연결
        </label>
        <div className="flex flex-col sm:flex-row gap-3 items-start">
          <div className="flex-1 w-full space-y-2">
            <Input
              id="rss-feed"
              placeholder="https://velog.io/@username/rss"
              className={`w-full h-11 bg-spotify-near-black border text-white rounded-xl placeholder:text-spotify-silver/80 ${
                validationError
                  ? "border-spotify-negative focus:border-spotify-negative"
                  : "border-white/5 focus:border-spotify-green"
              }`}
              value={rssUrl}
              onChange={handleInputChange}
              aria-invalid={validationError ? "true" : "false"}
              aria-describedby={
                validationError
                  ? "rss-error-msg rss-guide-info"
                  : "rss-guide-info"
              }
              required
            />
            {validationError && (
              <p
                id="rss-error-msg"
                className="text-[12px] text-spotify-negative font-semibold animate-in fade-in slide-in-from-top-1 duration-200 flex items-center gap-1.5"
                role="alert"
              >
                <AlertTriangle
                  className="w-3.5 h-3.5 shrink-0"
                  aria-hidden="true"
                />
                {validationError}
              </p>
            )}
          </div>
          <Button
            type="submit"
            disabled={isPending || !rssUrl.trim()}
            aria-busy={isPending}
            className="w-full sm:w-40 btn-pill-primary h-11 flex items-center justify-center gap-2 shrink-0"
          >
            {isPending && (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            )}
            {isPending ? "연결 중..." : "피드 연결"}
          </Button>
        </div>
      </div>
      <div
        id="rss-guide-info"
        className="text-[12px] text-spotify-silver leading-relaxed font-medium pt-2 border-t border-white/5"
      >
        <p className="mb-2 flex items-center gap-1.5 text-white/80">
          <Lightbulb
            className="w-4 h-4 text-spotify-green shrink-0"
            aria-hidden="true"
          />
          <strong>내 블로그 피드 주소 찾는 방법:</strong>
        </p>
        <ul
          className="list-disc list-inside space-y-1"
          aria-label="블로그별 RSS 피드 주소 형식 예시"
        >
          <li>
            <strong>Velog:</strong> <code>https://velog.io/@username/rss</code>
          </li>
          <li>
            <strong>Tistory:</strong>{" "}
            <code>https://username.tistory.com/rss</code>
          </li>
          <li>
            <strong>Medium:</strong>{" "}
            <code>https://medium.com/feed/@username</code>
          </li>
        </ul>
      </div>
    </form>
  );
}
