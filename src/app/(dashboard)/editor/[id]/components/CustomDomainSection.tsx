"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePortfolioStore } from "@/stores/portfolioStore";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  RefreshCw,
  Terminal,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

/**
 * DNS 레코드 안내용 개별 정보 아이템 컴포넌트
 */
interface DNSRecordItemProps {
  optionTitle: string;
  type: string;
  host: string;
  value: string;
  onCopy: (value: string) => void;
}

function DNSRecordItem({
  optionTitle,
  type,
  host,
  value,
  onCopy,
}: DNSRecordItemProps) {
  return (
    <div className="bg-[#121212] rounded-xl p-3.5 border border-white/5 shadow-inner mt-2 first:mt-0">
      <div className="flex justify-between items-center mb-3">
        <span className="text-[11px] font-black text-white bg-white/10 px-2 py-1 rounded-md tracking-wide">
          {optionTitle}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-3 text-[11px]">
        <div>
          <span className="text-spotify-silver block mb-1.5 font-medium">
            타입 (Type)
          </span>
          <code className="text-white bg-white/5 px-2 py-1 rounded-md block border border-white/10">
            {type}
          </code>
        </div>
        <div>
          <span className="text-spotify-silver block mb-1.5 font-medium">
            이름 (Name/Host)
          </span>
          <code className="text-white bg-white/5 px-2 py-1 rounded-md block border border-white/10">
            {host}
          </code>
        </div>
        <div
          className="relative group cursor-pointer"
          onClick={() => onCopy(value)}
        >
          <span className="text-spotify-silver block mb-1.5 font-medium">
            값 (Value/Target)
          </span>
          <code className="text-spotify-green bg-spotify-green/10 border border-spotify-green/20 px-2 py-1 rounded-md block flex justify-between items-center overflow-hidden font-bold">
            <span className="truncate">{value}</span>{" "}
            <Copy className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-1" />
          </code>
        </div>
      </div>
    </div>
  );
}

/**
 * 커스텀 도메인 설정 및 연결 상태 확인 컴포넌트
 * (부모 에디터 컴포넌트의 부담을 줄이기 위해 분리된 하위 컴포넌트)
 */
export default function CustomDomainSection() {
  const { customDomain, setCustomDomain } = usePortfolioStore();
  const [showDomainGuide, setShowDomainGuide] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // 1. 도메인 연결 설정 핸들러
  const handleConnectDomain = (domainValue: string) => {
    setCustomDomain(domainValue || null)
      .then(() => toast.success("도메인이 업데이트되었습니다."))
      .catch((err: Error) => toast.error(err.message));
  };

  // 2. 도메인 연결 실시간 상태 조회 핸들러
  const handleCheckDomainStatus = async () => {
    if (!customDomain) return;
    setIsChecking(true);
    try {
      const res = await fetch(`/api/domains/${customDomain}`);
      const data = await res.json();
      if (data.configured) {
        toast.success("도메인이 포트폴리오에 성공적으로 연결되었습니다!");
      } else {
        toast.error(
          "도메인 정보를 확인 중이거나 인터넷 등록(전파) 중입니다. 가이드에 따라 레코드를 올바르게 등록하셨다면, 실제 연결 완료까지 최대 24~48시간이 걸릴 수 있으니 안심하시고 잠시만 기다려 주세요!",
        );
      }
    } catch {
      toast.error(
        "도메인 연결 상태를 확인하는 중 네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
      );
    } finally {
      setIsChecking(false);
    }
  };

  // 3. 클립보드 값 복사 핸들러
  const handleCopyToClipboard = (value: string, successMessage: string) => {
    navigator.clipboard.writeText(value);
    toast.success(successMessage);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2.5 pt-2 border-t border-white/5">
        <Label
          htmlFor="custom-domain"
          className="text-[10px] font-black uppercase text-spotify-silver tracking-wider"
        >
          커스텀 도메인 연결{" "}
          <span className="text-[9px] text-spotify-silver/50 lowercase font-medium">
            (optional)
          </span>
        </Label>
        <div className="flex gap-2">
          <Input
            id="custom-domain"
            placeholder="www.yourdomain.com"
            className="rounded-full h-9 bg-spotify-near-black border-white/5 focus:border-spotify-green text-white placeholder:text-spotify-silver/20 text-xs px-4"
            defaultValue={customDomain || ""}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter") {
                handleConnectDomain(e.currentTarget.value.trim());
              }
            }}
          />
          <Button
            className="btn-pill-primary h-9 px-4 text-xs font-bold"
            onClick={() => {
              const input = document.getElementById(
                "custom-domain",
              ) as HTMLInputElement;
              if (input) {
                handleConnectDomain(input.value.trim());
              }
            }}
          >
            연결
          </Button>
        </div>
      </div>

      {customDomain && (
        <div className="bg-spotify-green/5 border border-spotify-green/20 rounded-xl overflow-hidden mt-4">
          {/* 타임라인 헤더 영역 */}
          <div className="p-4 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-black text-spotify-green flex items-center gap-2 tracking-wide">
                <span className="w-2 h-2 bg-spotify-green rounded-full animate-pulse shadow-[0_0_8px_rgba(30,215,96,0.8)]" />
                도메인 연결 상태
              </span>
              <Button
                variant="ghost"
                size="sm"
                disabled={isChecking}
                className="h-7 text-spotify-green hover:text-white hover:bg-spotify-green/10 text-[11px] font-bold rounded px-3 transition-colors disabled:opacity-50"
                onClick={handleCheckDomainStatus}
              >
                <RefreshCw className={`w-3 h-3 mr-1.5 ${isChecking ? "animate-spin" : ""}`} />
                {isChecking ? "확인 중..." : "상태 갱신"}
              </Button>
            </div>

            {/* 연결 타임라인 시각화 */}
            <div className="relative pl-3.5 space-y-5 before:absolute before:inset-y-2.5 before:left-[17px] before:w-[2px] before:bg-white/10">
              <div className="relative flex items-start gap-4">
                <div className="bg-spotify-green w-2.5 h-2.5 rounded-full mt-1 ring-4 ring-[#181818] z-10" />
                <div>
                  <h4 className="text-white text-xs font-bold flex items-center gap-1.5">
                    도메인 등록 완료{" "}
                    <CheckCircle2 className="w-3.5 h-3.5 text-spotify-green" />
                  </h4>
                  <p className="text-spotify-silver text-[11px] mt-1 font-medium">
                    {customDomain}
                  </p>
                </div>
              </div>
              <div className="relative flex items-start gap-4">
                <div className="bg-amber-400 w-2.5 h-2.5 rounded-full mt-1 ring-4 ring-[#181818] z-10 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                <div>
                  <h4 className="text-amber-400 text-xs font-bold flex items-center gap-1.5">
                    DNS 설정 및 전파 대기 중 <Clock className="w-3.5 h-3.5" />
                  </h4>
                  <p className="text-spotify-silver text-[11px] mt-1.5 leading-relaxed bg-[#121212] p-2 rounded-lg border border-white/5 inline-block">
                    올바른 레코드가 설정되었는지 확인하세요.
                    <br />
                    글로벌 DNS 전파에는{" "}
                    <strong className="text-white">최대 24~48시간</strong>이
                    소요될 수 있습니다.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 네임서버 대행업체 맞춤형 레코드 등록 가이드 */}
          <div className="border-t border-spotify-green/10 bg-spotify-dark-surface/80 transition-all duration-300">
            <button
              className="w-full p-3.5 flex items-center justify-between text-[11px] font-bold text-white hover:bg-white/5 transition-colors"
              onClick={() => setShowDomainGuide(!showDomainGuide)}
            >
              <span className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-spotify-silver" />
                DNS 레코드 설정 가이드 보기
              </span>
              {showDomainGuide ? (
                <ChevronUp className="w-4 h-4 text-spotify-silver" />
              ) : (
                <ChevronDown className="w-4 h-4 text-spotify-silver" />
              )}
            </button>

            {showDomainGuide && (
              <div className="p-4 pt-0 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="text-[11px] text-spotify-silver leading-relaxed bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
                  <strong className="text-blue-400 block mb-1">
                    ℹ️ DNS 레코드 등록 방법
                  </strong>
                  도메인 구입처(가비아, 카페24, 클라우드플레어 등)의 DNS 관리
                  페이지에서 아래 두 가지 레코드 중 하나를 추가해 주세요. (A
                  레코드 권장을 추천합니다.)
                </div>

                <div className="space-y-3">
                  {/* A Record */}
                  <DNSRecordItem
                    optionTitle="Option 1: A 레코드 (권장)"
                    type="A"
                    host="@"
                    value="76.76.21.21"
                    onCopy={(val: string) =>
                      handleCopyToClipboard(val, "IP 주소가 복사되었습니다.")
                    }
                  />

                  {/* CNAME Record */}
                  <DNSRecordItem
                    optionTitle="Option 2: CNAME (www 등 서브도메인용)"
                    type="CNAME"
                    host="www"
                    value="cname.vercel-dns.com"
                    onCopy={(val: string) =>
                      handleCopyToClipboard(val, "CNAME 값이 복사되었습니다.")
                    }
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
