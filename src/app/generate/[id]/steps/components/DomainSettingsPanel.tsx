"use client";

import React, { useState } from "react";
import {
  Globe,
  Copy,
  ArrowUpRight,
  Twitter,
  Linkedin,
  Settings,
  ChevronUp,
  ChevronDown,
  RefreshCw,
  Share2,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { errorMessage, responseErrorMessage } from "@/lib/api/errors";
import { normalizeCustomDomain } from "@/lib/domain";

interface DomainSettingsPanelProps {
  initialSlug?: string;
  customDomain: string | null;
  setCustomDomain: (domain: string | null) => Promise<void>;
}

export const DomainSettingsPanel = React.memo(function DomainSettingsPanel({
  initialSlug,
  customDomain,
  setCustomDomain,
}: DomainSettingsPanelProps): React.ReactElement {
  const [showDnsManual, setShowDnsManual] = useState<boolean>(false);

  const handleCopySlug = (): void => {
    const url = `https://${initialSlug}.portfolioforge.app`;
    navigator.clipboard.writeText(url);
    toast.success("포트폴리오 주소가 복사되었습니다!");
  };

  const handleShareTwitter = (): void => {
    const url = `https://${initialSlug}.portfolioforge.app`;
    const shareText = `GitHub 프로젝트를 포트폴리오로 정리했어요. 링크에서 확인해 보세요.\n#PortfolioForge #개발자 #포트폴리오`;
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`,
      "_blank",
    );
  };

  const handleShareLinkedin = (): void => {
    const url = `https://${initialSlug}.portfolioforge.app`;
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      "_blank",
    );
  };

  const handleDomainSubmit = (): void => {
    const input = document.getElementById("custom-domain") as HTMLInputElement;
    const value = input.value.trim();
    const domain = value ? normalizeCustomDomain(value) : null;
    if (value && !domain) {
      toast.error(errorMessage("DOMAIN_INVALID"));
      return;
    }
    setCustomDomain(domain)
      .then(() => toast.success("도메인 설정이 업데이트되었습니다."))
      .catch((err: Error) => toast.error(err.message || errorMessage("DOMAIN_SAVE_FAILED")));
  };

  const handleDomainKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      const value = e.currentTarget.value.trim();
      const domain = value ? normalizeCustomDomain(value) : null;
      if (value && !domain) {
        toast.error(errorMessage("DOMAIN_INVALID"));
        return;
      }
      setCustomDomain(domain)
        .then(() => toast.success("도메인이 업데이트되었습니다."))
        .catch((err: Error) => toast.error(err.message || errorMessage("DOMAIN_SAVE_FAILED")));
    }
  };

  const handleCheckConnection = async (): Promise<void> => {
    if (!customDomain) return;
    try {
      const res = await fetch(`/api/domains/${customDomain}`);
      const data = await res.json();
      if (!res.ok) throw new Error(responseErrorMessage(data, "DOMAIN_STATUS_FAILED"));
      if (data.configured) {
        toast.success(
          "도메인 연결이 확인되었습니다.",
        );
      } else {
        toast.error(errorMessage("DOMAIN_STATUS_FAILED"));
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : errorMessage("DOMAIN_STATUS_FAILED"));
    }
  };

  return (
    <div className="space-y-6 rounded-lg border border-white/5 bg-spotify-near-black p-6 text-white shadow-[0_8px_30px_rgba(0,0,0,0.2)] sm:p-8">
      <div className="space-y-1">
        <h3 className="text-[18px] sm:text-[20px] font-black text-white flex items-center gap-2">
          <Globe className="h-5 w-5 text-spotify-green" />
          도메인 설정
        </h3>
        <p className="text-[13px] sm:text-[14px] text-spotify-silver font-medium">
          나만의 고유한 브랜딩 주소로 포트폴리오를 배포하세요.
        </p>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <Label className="text-xs font-black text-spotify-silver">
            기본 제공 주소
          </Label>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white/5 border border-white/5 rounded-lg">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-spotify-green" />
              <span className="text-[15px] font-bold text-white font-mono truncate max-w-[200px] sm:max-w-xs">
                {initialSlug}.portfolioforge.app
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-spotify-green/10 rounded-full text-spotify-green text-[11px] font-black ">
                <span className="h-1.5 w-1.5 rounded-full bg-spotify-green motion-safe:animate-pulse" />
                Live
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-spotify-silver hover:text-white hover:bg-white/10 text-xs font-bold rounded-lg flex items-center gap-1.5"
                onClick={handleCopySlug}
              >
                <Copy className="w-3.5 h-3.5" />
                복사
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-spotify-silver hover:text-white hover:bg-white/10 text-xs font-bold rounded-lg flex items-center gap-1.5"
                onClick={() =>
                  window.open(
                    `https://${initialSlug}.portfolioforge.app`,
                    "_blank",
                  )
                }
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                열기
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-lg text-xs font-bold text-spotify-silver">
            <span className="inline-flex items-center gap-1.5">
              <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
              SNS에 포트폴리오 공유하기
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="flex h-7 items-center gap-1 rounded-lg px-2.5 text-[11px] text-spotify-silver hover:bg-white/10 hover:text-white"
              onClick={handleShareTwitter}
            >
              <Twitter className="w-3 h-3" />
              Twitter (X)
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex h-7 items-center gap-1 rounded-lg px-2.5 text-[11px] text-spotify-silver hover:bg-white/10 hover:text-white"
              onClick={handleShareLinkedin}
            >
              <Linkedin className="w-3 h-3" />
              LinkedIn
            </Button>
          </div>
        </div>

        <div className="space-y-2.5 pt-2">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="custom-domain"
              className="text-xs font-black text-spotify-silver"
            >
              나만의 커스텀 도메인 연결{" "}
              <span className="text-[10px] text-spotify-silver/50 lowercase font-medium">
                (선택 사항)
              </span>
            </Label>
          </div>

          <div className="flex gap-2">
            <Input
              id="custom-domain"
              placeholder="www.yourdomain.com"
              className="rounded-xl h-11 bg-spotify-near-black border-white/5 focus:border-spotify-green text-white placeholder:text-spotify-silver/20"
              defaultValue={customDomain || ""}
              onKeyDown={handleDomainKeyDown}
            />
            <Button
              className="btn-pill-primary h-11 px-6 text-sm font-bold flex items-center gap-1.5"
              onClick={handleDomainSubmit}
            >
              연결
            </Button>
          </div>
          <p className="text-[11px] text-spotify-silver/60 leading-relaxed font-medium">
            * 개인 소유의 도메인을 입력한 뒤, 아래 DNS 가이드에 따라 CNAME 또는 A 레코드를 설정해 주세요.
          </p>
        </div>

        <div className="border border-white/5 rounded-lg overflow-hidden bg-white/[0.02]">
          <button
            onClick={() => setShowDnsManual(!showDnsManual)}
            className="w-full flex items-center justify-between p-4 text-[13px] font-bold text-white hover:bg-white/5 transition-all"
          >
            <span className="flex items-center gap-2">
              <Settings
                className="w-4 h-4 text-spotify-green animate-spin"
                style={{ animationDuration: "6s" }}
              />
              DNS 레코드 수동 설정 가이드
            </span>
            {showDnsManual ? (
              <ChevronUp className="w-4 h-4 text-spotify-silver" />
            ) : (
              <ChevronDown className="w-4 h-4 text-spotify-silver" />
            )}
          </button>

          {showDnsManual && (
            <div className="p-4 border-t border-white/5 space-y-4 text-[12px] text-spotify-silver leading-relaxed animate-in slide-in-from-top-2 duration-300">
              <p>
                도메인 구매 대행업체(가비아, Cloudflare 등)의 DNS 관리 콘솔에서 아래 레코드를 추가해 주세요:
              </p>
              <div className="space-y-2 font-mono text-[11px] text-white">
                <div className="p-3 bg-spotify-near-black border border-white/5 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-spotify-silver block font-sans">
                      Type A (루트 도메인용)
                    </span>
                    <span>
                      Name: <strong className="text-spotify-green">@</strong> | Value: <strong>76.76.21.21</strong>
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[10px] text-spotify-silver hover:text-white"
                    onClick={() => {
                      navigator.clipboard.writeText("76.76.21.21");
                      toast.success("A 레코드 값이 복사되었습니다.");
                    }}
                  >
                    복사
                  </Button>
                </div>
                <div className="p-3 bg-spotify-near-black border border-white/5 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-spotify-silver block font-sans">
                      Type CNAME (서브 도메인용)
                    </span>
                    <span>
                      Name: <strong className="text-spotify-green">www</strong> | Value: <strong>cname.vercel-dns.com</strong>
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[10px] text-spotify-silver hover:text-white"
                    onClick={() => {
                      navigator.clipboard.writeText("cname.vercel-dns.com");
                      toast.success("CNAME 레코드 값이 복사되었습니다.");
                    }}
                  >
                    복사
                  </Button>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 space-y-2">
                <span className="block font-bold text-white">추천 도메인 구입처:</span>
                <div className="flex flex-wrap gap-2">
                  <a
                    href="https://www.gabia.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 bg-white/5 border border-white/5 rounded hover:bg-white/10 hover:text-white transition-all"
                  >
                    가비아 ↗
                  </a>
                  <a
                    href="https://www.cloudflare.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 bg-white/5 border border-white/5 rounded hover:bg-white/10 hover:text-white transition-all"
                  >
                    Cloudflare ↗
                  </a>
                  <a
                    href="https://www.namecheap.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 bg-white/5 border border-white/5 rounded hover:bg-white/10 hover:text-white transition-all"
                  >
                    Namecheap ↗
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {customDomain && (
          <div className="p-5 bg-spotify-green/5 border border-spotify-green/20 rounded-lg space-y-3 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-black text-spotify-green flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-spotify-green motion-safe:animate-pulse" />
                커스텀 도메인 연결 상태
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-spotify-green hover:text-white hover:bg-spotify-green/10 font-bold rounded-lg"
                onClick={handleCheckConnection}
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1" />
                새로고침
              </Button>
            </div>
            <div className="text-[12px] text-spotify-silver font-medium leading-relaxed">
              현재 <strong className="text-white font-mono">{customDomain}</strong> 주소가 포트폴리오에 등록되어 있습니다. DNS 전파는 최대 24~48시간이 걸릴 수 있으며, 연결 여부는 실제 DNS 상태로 확인합니다.
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
