"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Plus, Github, ExternalLink, Edit2, Trash2, Clock, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
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

export default function DashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["dashboardData"],
    queryFn: async () => {
      const res = await fetch("/api/portfolios");
      if (!res.ok) throw new Error("Failed to fetch dashboard data");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/portfolios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        throw new Error("생성에 실패했습니다.");
      }
      return res.json();
    },
    onSuccess: (data) => {
      router.push(`/generate/${data.portfolio_id}`);
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/portfolios/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("삭제에 실패했습니다.");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboardData"] });
      toast.success("포트폴리오가 삭제되었습니다.");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  if (isLoading) {
    return null; // dashboard/loading.tsx handles this
  }

  if (isError || !data) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-6">
        <Alert variant="destructive" className="bg-spotify-negative/10 border-spotify-negative/20 text-spotify-negative rounded-2xl">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="font-bold">
            데이터를 불러올 수 없습니다. {(error as Error)?.message || "잠시 후 다시 시도해주세요."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const { portfolios, github_synced_at } = data;

  return (
    <div className="max-w-7xl mx-auto py-10 md:py-16 px-6 flex flex-col gap-12 animate-in fade-in duration-700">
      <div className="flex flex-col gap-3">
        <h2 className="text-[32px] font-bold tracking-tight text-white">환영합니다! 👋</h2>
        <p className="text-spotify-silver text-[16px] font-semibold">나만의 멋진 포트폴리오를 관리하고 성장을 기록하세요.</p>
      </div>

      {/* GitHub Sync Status Bar */}
      <div className="flex flex-wrap items-center gap-3">
        {!github_synced_at ? (
          <div className="w-full p-6 bg-spotify-warning/10 border border-spotify-warning/20 rounded-2xl text-spotify-warning flex flex-col sm:flex-row items-center justify-between gap-4 shadow-spotify-md">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-spotify-warning/20 rounded-full">
                <AlertTriangle className="w-6 h-6 shrink-0" />
              </div>
              <span className="font-bold text-[16px]">GitHub 연동이 완료되지 않았습니다.</span>
            </div>
            <Link href="/generate/new">
              <Button className="btn-pill-primary h-12 px-8">
                지금 연동하기
              </Button>
            </Link>
          </div>
        ) : !data.user?.github_bio_verified ? (
          <div className="w-full p-6 bg-spotify-announcement/10 border border-spotify-announcement/20 rounded-2xl text-spotify-announcement flex flex-col sm:flex-row items-center justify-between gap-4 shadow-spotify-md">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-spotify-announcement/20 rounded-full">
                <AlertTriangle className="w-6 h-6 shrink-0" />
              </div>
              <span className="font-bold text-[16px]">GitHub bio를 등록하면 AI가 더 멋진 소개글을 만들어드려요!</span>
            </div>
            <a href="https://github.com/settings/profile" target="_blank" rel="noreferrer">
              <Button className="btn-pill px-8 h-12 bg-spotify-announcement text-white hover:brightness-110">
                GitHub 설정 가기
              </Button>
            </a>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-[13px] font-bold text-spotify-silver bg-spotify-mid-dark px-5 py-2.5 rounded-full border border-white/5 shadow-spotify-md">
            <div className="h-2 w-2 rounded-full bg-spotify-green animate-pulse shadow-[0_0_8px_rgba(30,215,96,0.5)]" />
            <Github className="w-4 h-4" />
            마지막 동기화: {formatDistanceToNow(new Date(github_synced_at), { addSuffix: true, locale: ko })}
          </div>
        )}
      </div>

      {/* Portfolios Section */}
      <div className="space-y-8">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <h2 className="text-[24px] font-bold tracking-tight text-white">내 포트폴리오</h2>
        </div>
        
        {portfolios.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 md:p-32 bg-spotify-dark-surface border border-white/5 rounded-[40px] gap-8 text-center shadow-spotify">
            <div className="p-8 bg-spotify-mid-dark rounded-full text-spotify-green shadow-spotify-md">
              <Plus className="w-12 h-12" />
            </div>
            <div className="space-y-3">
              <h3 className="text-[24px] font-bold text-white">아직 포트폴리오가 없어요</h3>
              <p className="text-spotify-silver text-[16px] font-medium max-w-sm leading-relaxed">
                GitHub 연동 한 번으로 AI가 당신만의 전문적인 포트폴리오를 구성해 드립니다. 1분이면 충분해요!
              </p>
            </div>
            <Button 
              size="lg" 
              className="btn-pill-primary h-14 px-12 text-[17px]"
              disabled={createMutation.isPending} 
              onClick={() => createMutation.mutate()}
            >
              지금 시작하기
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Create New Card */}
            <button
              disabled={createMutation.isPending}
              onClick={() => createMutation.mutate()}
              className="group relative flex flex-col items-center justify-center border border-white/10 rounded-xl p-8 min-h-[300px] bg-spotify-dark-surface hover:bg-spotify-mid-dark hover:border-white/20 transition-all duration-300 shadow-spotify-md"
            >
              <div className="p-5 bg-spotify-near-black text-white rounded-full mb-6 transition-all group-hover:scale-110 group-hover:bg-spotify-green group-hover:text-black duration-500 shadow-spotify-md">
                <Plus className="w-10 h-10" />
              </div>
              <span className="text-[18px] font-bold text-white tracking-tight">
                새 포트폴리오 만들기
              </span>
            </button>

            {/* Portfolio Cards */}
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {portfolios.map((p: any) => (
              <div key={p.id} className="group relative flex flex-col bg-spotify-dark-surface rounded-xl overflow-hidden shadow-spotify-md hover:bg-spotify-mid-dark transition-all duration-500 min-h-[300px] border border-white/5 hover:border-white/10">
                <div className="p-8 flex-1 flex flex-col items-start gap-5">
                  <div className="flex w-full items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-[22px] text-white truncate mb-2 group-hover:text-spotify-green transition-colors">
                        {p.title || p.slug}
                      </h3>
                      <div className="flex items-center gap-2.5">
                        <span className="text-[12px] font-bold text-spotify-silver uppercase tracking-spotify">{p.theme}</span>
                        <div className="h-1 w-1 rounded-full bg-white/20" />
                        <span className="text-[12px] font-medium text-spotify-silver truncate tracking-tight">{p.slug}.portfolioforge.app</span>
                      </div>
                    </div>
                    {p.is_published ? (
                      <div className="shrink-0 px-3 py-1 text-[10px] font-bold bg-spotify-green text-black rounded-full flex items-center gap-1.5 shadow-[0_0_12px_rgba(30,215,96,0.2)]">
                         <div className="h-1.5 w-1.5 rounded-full bg-black animate-pulse" />
                         LIVE
                      </div>
                    ) : (
                      <div className="shrink-0 px-3 py-1 text-[10px] font-bold bg-white/10 text-spotify-silver rounded-full">
                        DRAFT
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-auto flex w-full items-center justify-between">
                    <div className="flex items-center gap-2 text-[12px] font-bold text-spotify-silver">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDistanceToNow(new Date(p.created_at), { addSuffix: true, locale: ko })}
                    </div>
                  </div>
                </div>
                
                <div className="p-4 pt-0">
                  <div className="flex h-14 bg-spotify-near-black rounded-full border border-white/5 overflow-hidden p-1 shadow-spotify-md">
                    <a 
                      href={p.slug ? `/${p.slug}` : "#"} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="flex-1 flex items-center justify-center gap-2 text-[13px] font-bold text-spotify-silver hover:text-white transition-all rounded-full"
                    >
                      <ExternalLink className="w-4 h-4 opacity-70" />
                      보기
                    </a>
                    <Link 
                      href={`/generate/${p.id}?step=adjust`} 
                      className="flex-[1.5] flex items-center justify-center gap-2 text-[13px] font-bold text-black bg-white hover:bg-spotify-near-white transition-all rounded-full shadow-spotify-md"
                    >
                      <Edit2 className="w-4 h-4" />
                      편집하기
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          disabled={deleteMutation.isPending}
                          className="w-12 flex items-center justify-center text-spotify-silver hover:text-spotify-negative transition-all rounded-full"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-spotify-dark-surface border-none rounded-[24px] shadow-spotify">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-[22px] font-bold text-white">포트폴리오를 삭제할까요?</AlertDialogTitle>
                          <AlertDialogDescription className="text-spotify-silver text-[15px] font-medium leading-relaxed">
                            이 작업은 되돌릴 수 없습니다. 포트폴리오와 관련된 모든 데이터가 영구적으로 삭제됩니다.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="pt-4">
                          <AlertDialogCancel className="bg-transparent border border-white/10 text-white rounded-full h-12 font-bold px-8 hover:bg-white/5 transition-colors">취소</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMutation.mutate(p.id)}
                            className="bg-spotify-negative hover:brightness-110 text-white rounded-full h-12 font-bold px-8 shadow-spotify-md"
                          >
                            삭제 완료
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
