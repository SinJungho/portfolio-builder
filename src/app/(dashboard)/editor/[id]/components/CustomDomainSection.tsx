"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { usePortfolioStore } from "@/stores/portfolioStore";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  RefreshCw,
  Terminal,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { errorMessage, responseErrorMessage } from "@/lib/api/errors";
import { normalizeCustomDomain } from "@/lib/domain";

/**
 * DNS 레코드 정보를 표시한다.
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
    <div className="bg-spotify-near-black rounded-xl p-3.5 border border-white/5 shadow-inner mt-2 first:mt-0">
      <div className="flex justify-between items-center mb-3">
        <span className="text-[11px] font-bold text-white bg-white/10 px-2 py-1 rounded-md tracking-wide">
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
        <button
          type="button"
          className="relative group text-left w-full cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-spotify-green rounded-md"
          onClick={() => onCopy(value)}
          aria-label={`${type} 레코드 값 ${value} 복사`}
        >
          <span className="text-spotify-silver block mb-1.5 font-medium">
            값 (Value/Target)
          </span>
          <code className="text-spotify-green bg-spotify-green/10 border border-spotify-green/20 px-2 py-1 rounded-md flex justify-between items-center overflow-hidden font-bold">
            <span className="truncate">{value}</span>{" "}
            <Copy className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-1" />
          </code>
        </button>
      </div>
    </div>
  );
}

/**
 * 커스텀 도메인을 설정하고 연결 상태를 확인한다.
 */
export default function CustomDomainSection() {
  const { customDomain, setCustomDomain, isSaving } = usePortfolioStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const checkedDomainRef = useRef<string | null>(null);
  const [showDomainGuide, setShowDomainGuide] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  // 연결 완료 여부는 실제 DNS 검증 결과로만 결정한다.
  const [dnsStatus, setDnsStatus] = useState<
    "unchecked" | "connected" | "pending" | "error"
  >("unchecked");

  // 도메인 형식을 검증한 뒤 저장한다.
  const handleConnectDomain = (raw: string) => {
    const domain = raw.trim() ? normalizeCustomDomain(raw) : null;
    if (raw.trim() && !domain) {
      toast.error(errorMessage("DOMAIN_INVALID"));
      return;
    }
    setCustomDomain(domain)
      .then(() => toast.success(domain ? "도메인이 저장됐어요." : "도메인 연결을 해제했어요."))
      .catch((err: Error) => toast.error(err.message || errorMessage("DOMAIN_SAVE_FAILED")));
  };

  // DNS 검증 결과를 상태에 반영한다.
  const handleCheckDomainStatus = async () => {
    if (!customDomain) return;
    setIsChecking(true);
    try {
      const res = await fetch(`/api/domains/${customDomain}`);
      const data = await res.json();
      if (!res.ok) throw new Error(responseErrorMessage(data, "DOMAIN_STATUS_FAILED"));
      setDnsStatus(data.configured ? "connected" : "pending");
    } catch {
      setDnsStatus("error");
    } finally {
      setIsChecking(false);
    }
  };

  // 저장된 도메인의 상태를 확인한다.
  // 저장 중에는 낙관적 업데이트만 반영된 상태라 조회가 404가 난다. 저장이 끝난 뒤에 확인한다.
  // isSaving은 에디터 전역 상태라 도메인이 실제로 바뀔 때만 조회하도록 한 번 더 거른다.
  useEffect(() => {
    if (!customDomain || isSaving) return;
    if (checkedDomainRef.current === customDomain) return;
    checkedDomainRef.current = customDomain;
    let cancelled = false;
    fetch(`/api/domains/${customDomain}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(responseErrorMessage(data, "DOMAIN_STATUS_FAILED"));
        return data;
      })
      .then((data) => {
        if (!cancelled) setDnsStatus(data.configured ? "connected" : "pending");
      })
      .catch(() => {
        if (!cancelled) setDnsStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [customDomain, isSaving]);

  const handleCopyToClipboard = async (value: string, successMessage: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(successMessage);
    } catch {
      toast.error(errorMessage("DOMAIN_COPY_FAILED"));
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2.5 pt-2 border-t border-white/5">
        <Label
          htmlFor="custom-domain"
          className="text-[10px] font-bold text-spotify-silver tracking-wider"
        >
          커스텀 도메인 연결{" "}
          <span className="text-[10px] text-spotify-silver font-medium">
            (선택 사항)
          </span>
        </Label>
        <p className="text-[11px] text-spotify-silver font-medium leading-relaxed">
          연결하지 않아도 기본 주소로 지원서에 바로 쓸 수 있어요.
        </p>
        <div className="flex gap-2">
          <Input
            id="custom-domain"
            key={customDomain ?? "none"}
            ref={inputRef}
            placeholder="www.yourdomain.com"
            className="rounded-full h-9 bg-spotify-near-black border-white/5 focus:border-spotify-green text-white placeholder:text-spotify-silver/80 text-xs px-4"
            defaultValue={customDomain || ""}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter") {
                handleConnectDomain(e.currentTarget.value);
              }
            }}
          />
          <Button
            className="btn-pill-primary h-9 px-4 text-xs font-bold"
            onClick={() => handleConnectDomain(inputRef.current?.value ?? "")}
          >
            연결
          </Button>
        </div>
      </div>

      {customDomain && (
        <div className="bg-spotify-dark-surface border border-white/5 rounded-xl overflow-hidden mt-4">
          <div className="p-4 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold text-white flex items-center gap-2 tracking-wide">
                <span
                  className={`w-2 h-2 rounded-full ${
                    dnsStatus === "connected"
                      ? "bg-spotify-green"
                      : dnsStatus === "error"
                        ? "bg-spotify-negative"
                        : "bg-spotify-warning animate-pulse"
                  }`}
                />
                도메인 연결 상태
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isChecking}
                  className="h-8 text-spotify-silver hover:text-white hover:bg-white/5 text-[11px] font-bold rounded-full px-3 transition-colors disabled:opacity-50"
                  onClick={handleCheckDomainStatus}
                >
                  <RefreshCw className={`w-3 h-3 mr-1.5 ${isChecking ? "animate-spin" : ""}`} />
                  {isChecking ? "확인 중..." : "상태 갱신"}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-spotify-negative hover:text-spotify-negative hover:bg-spotify-negative/10 text-[11px] font-bold rounded-full px-3 transition-colors"
                    >
                      연결 해제
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-spotify-dark-surface border-none rounded-lg shadow-spotify">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-[20px] font-bold text-white">
                        연결을 해제할까요?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-spotify-silver text-[15px] font-medium leading-relaxed">
                        커스텀 도메인 연결이 끊겨요. 기본 주소는 그대로 쓸 수 있고, 다시 연결하려면 도메인을 재입력하면 돼요.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="pt-4">
                      <AlertDialogCancel className="bg-transparent border border-white/10 text-white rounded-full h-11 font-bold px-6 hover:bg-white/5 transition-colors">
                        취소
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleConnectDomain("")}
                        className="!bg-transparent border border-spotify-negative/40 !text-spotify-negative hover:!bg-spotify-negative/10 rounded-full h-11 font-bold px-6 transition-colors"
                      >
                        연결 해제
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            <div className="relative pl-3.5 space-y-5 before:absolute before:inset-y-2.5 before:left-[17px] before:w-[2px] before:bg-white/10">
              <div className="relative flex items-start gap-4">
                <div className="bg-spotify-green w-2.5 h-2.5 rounded-full mt-1 ring-4 ring-spotify-dark-surface z-10" />
                <div>
                  <h4 className="text-white text-xs font-bold flex items-center gap-1.5">
                    도메인 저장됨{" "}
                    <CheckCircle2 className="w-3.5 h-3.5 text-spotify-green" />
                  </h4>
                  <p className="text-spotify-silver text-[11px] mt-1 font-medium">
                    {customDomain}
                  </p>
                </div>
              </div>

              <div className="relative flex items-start gap-4">
                {isChecking ? (
                  <>
                    <div className="bg-spotify-silver w-2.5 h-2.5 rounded-full mt-1 ring-4 ring-spotify-dark-surface z-10" />
                    <h4 className="text-spotify-silver text-xs font-bold flex items-center gap-1.5">
                      연결 상태 확인 중
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    </h4>
                  </>
                ) : dnsStatus === "connected" ? (
                  <>
                    <div className="bg-spotify-green w-2.5 h-2.5 rounded-full mt-1 ring-4 ring-spotify-dark-surface z-10" />
                    <div>
                      <h4 className="text-spotify-green text-xs font-bold flex items-center gap-1.5">
                        연결 완료
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </h4>
                      <p className="text-spotify-silver text-[11px] mt-1.5 leading-relaxed">
                        이제{" "}
                        <strong className="text-white">{customDomain}</strong>{" "}
                        주소로 포트폴리오에 접속할 수 있어요.
                      </p>
                    </div>
                  </>
                ) : dnsStatus === "error" ? (
                  <>
                    <div className="bg-spotify-negative w-2.5 h-2.5 rounded-full mt-1 ring-4 ring-spotify-dark-surface z-10" />
                    <div>
                      <h4 className="text-spotify-negative text-xs font-bold flex items-center gap-1.5">
                        상태를 확인하지 못했어요
                        <AlertCircle className="w-3.5 h-3.5" />
                      </h4>
                      <p className="text-spotify-silver text-[11px] mt-1.5 leading-relaxed">
                        네트워크 문제로 연결 상태를 불러오지 못했어요. 잠시 후
                        ‘상태 갱신’을 눌러 다시 확인해 주세요.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-spotify-warning w-2.5 h-2.5 rounded-full mt-1 ring-4 ring-spotify-dark-surface z-10 animate-pulse" />
                    <div>
                      <h4 className="text-spotify-warning text-xs font-bold flex items-center gap-1.5">
                        DNS 전파 대기 중 <Clock className="w-3.5 h-3.5" />
                      </h4>
                      <p className="text-spotify-silver text-[11px] mt-1.5 leading-relaxed bg-spotify-near-black p-2 rounded-lg border border-white/5">
                        아직 연결이 확인되지 않았어요. 아래 가이드대로 레코드를
                        등록했다면 전파에{" "}
                        <strong className="text-white">최대 24~48시간</strong>이
                        걸릴 수 있어요. 잠시 뒤 ‘상태 갱신’으로 다시 확인해
                        주세요.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 bg-spotify-near-black/40 transition-all duration-300">
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
                <div className="text-[11px] text-spotify-silver leading-relaxed bg-spotify-announcement/10 p-3 rounded-lg border border-spotify-announcement/20">
                  <strong className="text-spotify-announcement block mb-1">
                    DNS 레코드 등록 방법
                  </strong>
                  도메인 구입처(가비아, 카페24, 클라우드플레어 등)의 DNS 관리
                  페이지에서 아래 두 가지 레코드 중 하나를 추가해 주세요. (A
                  레코드를 권장해요.)
                </div>

                <div className="space-y-3">
                  <DNSRecordItem
                    optionTitle="Option 1: A 레코드 (권장)"
                    type="A"
                    host="@"
                    value="76.76.21.21"
                    onCopy={(val: string) =>
                      handleCopyToClipboard(val, "IP 주소를 복사했어요.")
                    }
                  />

                  <DNSRecordItem
                    optionTitle="Option 2: CNAME (www 등 서브도메인용)"
                    type="CNAME"
                    host="www"
                    value="cname.vercel-dns.com"
                    onCopy={(val: string) =>
                      handleCopyToClipboard(val, "CNAME 값을 복사했어요.")
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
