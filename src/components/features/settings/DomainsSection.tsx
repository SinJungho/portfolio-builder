"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Globe, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Trash2, 
  RefreshCcw, 
  ExternalLink, 
  Plus,
  Info
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Portfolio {
  id: string;
  slug: string;
  title: string;
  custom_domain: string | null;
}

interface VerificationRecord {
  type: string;
  domain: string;
  value: string;
}

export function DomainsSection() {
  const queryClient = useQueryClient();
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string>("");
  const [newDomain, setNewDomain] = useState("");

  // 1. 포트폴리오 목록 조회
  const { data: portfoliosData, isLoading: portfoliosLoading } = useQuery({
    queryKey: ["portfoliosForDomains"],
    queryFn: async () => {
      const res = await fetch("/api/portfolios");
      if (!res.ok) throw new Error("포트폴리오 목록을 불러오지 못했습니다.");
      return res.json();
    }
  });

  const portfolios: Portfolio[] = portfoliosData?.portfolios || [];

  // 초기 포트폴리오 선택
  useEffect(() => {
    if (portfolios.length > 0 && !selectedPortfolioId) {
      setSelectedPortfolioId(portfolios[0].id);
    }
  }, [portfolios, selectedPortfolioId]);

  const selectedPortfolio = portfolios.find(p => p.id === selectedPortfolioId);
  const currentDomain = selectedPortfolio?.custom_domain;

  // 2. 도메인 상태 조회
  const { data: domainStatus, isLoading: statusLoading, refetch: refetchStatus } = useQuery({
    queryKey: ["domainStatus", currentDomain],
    queryFn: async () => {
      if (!currentDomain) return null;
      const res = await fetch(`/api/domains/status?portfolio_id=${selectedPortfolioId}&domain=${currentDomain}`);
      if (!res.ok) throw new Error("도메인 상태를 확인할 수 없습니다.");
      return res.json();
    },
    enabled: !!currentDomain && !!selectedPortfolioId,
    refetchInterval: (query) => (query.state.data?.verified ? false : 10000), // 미연결 시 10초마다 갱신
  });

  // 3. 도메인 추가 Mutation
  const addMutation = useMutation({
    mutationFn: async (domain: string) => {
      const res = await fetch("/api/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portfolio_id: selectedPortfolioId, domain }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "도메인 추가에 실패했습니다.");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfoliosForDomains"] });
      setNewDomain("");
      toast.success("도메인이 등록되었습니다. DNS 설정을 진행해주세요.");
    },
    onError: (err: any) => toast.error(err.message),
  });

  // 4. 도메인 삭제 Mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!currentDomain) return;
      const res = await fetch(`/api/domains?portfolio_id=${selectedPortfolioId}&domain=${currentDomain}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("도메인 삭제에 실패했습니다.");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfoliosForDomains"] });
      toast.success("도메인 연결이 해제되었습니다.");
    },
    onError: (err: any) => toast.error(err.message),
  });

  // 5. 도메인 검증 Mutation
  const verifyMutation = useMutation({
    mutationFn: async () => {
      if (!currentDomain) return;
      const res = await fetch("/api/domains/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portfolio_id: selectedPortfolioId, domain: currentDomain }),
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.verified) {
        toast.success("도메인 연결이 확인되었습니다!");
        refetchStatus();
      } else {
        toast.info("아직 DNS 설정이 전파되지 않았습니다. 잠시 후 상단 새로고침을 눌러보세요.");
      }
    },
    onError: (err: any) => toast.error(err.message),
  });

  if (portfoliosLoading) return <div className="animate-pulse py-10 text-gray-400">Loading domains...</div>;

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-gray-900 mb-6 font-bold text-xl flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-500" />
          Custom Domains
        </h2>

        {/* Portfolio Selection */}
        <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-100">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
            Target Portfolio
          </label>
          <select 
            value={selectedPortfolioId}
            onChange={(e) => setSelectedPortfolioId(e.target.value)}
            className="w-full h-11 px-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
          >
            {portfolios.map(p => (
              <option key={p.id} value={p.id}>
                {p.title || p.slug} ({p.slug}.portfolioforge.app)
              </option>
            ))}
          </select>
        </div>

        {/* Domain Display or Add Form */}
        {!currentDomain ? (
          <div className="bg-white border-2 border-dashed border-gray-200 rounded-[24px] p-8 text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
              <Plus className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-lg">새 도메인 연결</h3>
              <p className="text-gray-500 text-sm max-w-xs mx-auto leading-relaxed">
                보유하고 계신 도메인을 사용하여 나만의 개성을 완성해 보세요.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input 
                type="text"
                placeholder="example.com"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                className="flex-1 h-12 px-4 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
              />
              <Button 
                onClick={() => addMutation.mutate(newDomain)}
                disabled={addMutation.isPending || !newDomain}
                className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20"
              >
                {addMutation.isPending ? "연결 중..." : "등록하기"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Active Domain Info */}
            <div className="bg-white border border-gray-200 rounded-[28px] overflow-hidden shadow-sm">
              <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-50">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-2xl ${domainStatus?.verified ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
                    {domainStatus?.verified ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6 animate-pulse" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-xl text-gray-900">{currentDomain}</h4>
                    <p className={`text-sm font-medium ${domainStatus?.verified ? 'text-green-600' : 'text-yellow-600'}`}>
                      {domainStatus?.verified ? '연결 완료' : 'DNS 설정 확인 중...'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => verifyMutation.mutate()}
                    disabled={verifyMutation.isPending || domainStatus?.verified}
                    className="h-11 px-5 border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl font-bold flex items-center gap-2"
                  >
                    <RefreshCcw className={`w-4 h-4 ${verifyMutation.isPending ? 'animate-spin' : ''}`} />
                    상태 갱신
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      if(confirm("정말로 도메인 연결을 해제할까요?")) deleteMutation.mutate();
                    }}
                    disabled={deleteMutation.isPending}
                    className="h-11 px-5 border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 rounded-xl font-bold flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    제거
                  </Button>
                </div>
              </div>

              {/* DNS Checklist if not verified */}
              {!domainStatus?.verified && (
                <div className="p-6 md:p-8 bg-gray-50/50 space-y-6">
                  <Alert variant="default" className="bg-white border-blue-100 border-2">
                    <Info className="h-4 w-4 text-blue-500" />
                    <AlertTitle className="font-bold text-blue-900">DNS 설정 안내</AlertTitle>
                    <AlertDescription className="text-blue-800 text-sm leading-relaxed">
                      도메인 대행업체(가비아, 고대디 등)의 DNS 관리 페이지에서 아래 레코드를 추가해주세요. 
                      전파 속도에 따라 최대 24시간이 소요될 수 있습니다.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Required Records</h5>
                    <div className="grid gap-3">
                      {domainStatus?.verification?.map((v: VerificationRecord, i: number) => (
                        <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-gray-200 rounded-2xl gap-4 group">
                          <div className="flex items-center gap-3">
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold uppercase">{v.type}</span>
                            <code className="text-sm font-bold text-gray-800">{v.domain}</code>
                          </div>
                          <div className="flex items-center gap-3">
                             <code className="bg-gray-50 px-3 py-1 rounded-lg text-sm text-blue-600 font-mono break-all line-clamp-1 group-hover:line-clamp-none transition-all">
                               {v.value}
                             </code>
                             <button 
                               onClick={() => {
                                 navigator.clipboard.writeText(v.value);
                                 toast.success("클립보드에 복사되었습니다.");
                               }}
                               className="shrink-0 p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-900 transition-all"
                             >
                               복사
                             </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {domainStatus?.verified && (
              <div className="flex justify-center">
                <a 
                  href={`https://${currentDomain}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  연결된 포트폴리오 방문하기
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
