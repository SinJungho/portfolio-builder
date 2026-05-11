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
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            데이터를 불러올 수 없습니다. {(error as Error)?.message || "잠시 후 다시 시도해주세요."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const { portfolios, github_synced_at } = data;

  return (
    <div className="max-w-7xl mx-auto py-10 md:py-16 px-6 flex flex-col gap-10 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <h2 className="text-[28px] font-extrabold tracking-tight text-[#191F28]">환영합니다! 👋</h2>
        <p className="text-[#4E5968] text-[16px] font-medium leading-relaxed">나만의 멋진 포트폴리오를 관리하고 성장을 기록하세요.</p>
      </div>

      {/* GitHub Sync Status Bar */}
      <div className="flex flex-wrap items-center gap-3">
        {!github_synced_at ? (
          <div className="w-full p-5 bg-orange-50 border border-orange-100 rounded-[24px] text-orange-700 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-xl">
                <AlertTriangle className="w-5 h-5 shrink-0" />
              </div>
              <span className="font-bold text-[15px]">GitHub 연동이 완료되지 않았습니다.</span>
            </div>
            <Link href="/generate/new">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-6 h-11 font-bold shadow-lg shadow-orange-500/20 transition-all active:scale-95">
                지금 연동하기
              </Button>
            </Link>
          </div>
        ) : !data.user?.github_bio_verified ? (
          <div className="w-full p-5 bg-yellow-50 border border-yellow-100 rounded-[24px] text-yellow-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-xl">
                <AlertTriangle className="w-5 h-5 shrink-0" />
              </div>
              <span className="font-bold text-[15px]">GitHub bio를 등록하면 AI가 더 멋진 소개글을 만들어드려요!</span>
            </div>
            <a href="https://github.com/settings/profile" target="_blank" rel="noreferrer">
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl px-6 h-11 font-bold shadow-lg shadow-yellow-500/20 transition-all active:scale-95">
                GitHub 설정 가기
              </Button>
            </a>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 text-[13px] font-bold text-[#8B95A1] bg-white px-4 py-2.5 rounded-full border border-black/3 shadow-sm">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <Github className="w-3.5 h-3.5" />
            마지막 동기화: {formatDistanceToNow(new Date(github_synced_at), { addSuffix: true, locale: ko })}
          </div>
        )}
      </div>

      {/* Portfolios Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-[22px] font-extrabold tracking-tight text-[#191F28]">내 포트폴리오</h2>
        </div>
        
        {portfolios.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 md:p-24 bg-white border border-dashed border-gray-200 rounded-[40px] gap-6 text-center shadow-sm">
            <div className="p-6 bg-blue-50 rounded-[32px] text-[#3182F6]">
              <Plus className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-[20px] font-extrabold text-[#191F28]">아직 포트폴리오가 없어요</h3>
              <p className="text-[#4E5968] text-[15px] font-medium max-w-sm">
                GitHub 연동 한 번으로 AI가 당신만의 전문적인 포트폴리오를 구성해 드립니다. 1분이면 충분해요!
              </p>
            </div>
            <Button 
              size="lg" 
              className="mt-2 bg-[#3182F6] hover:brightness-110 text-white rounded-[18px] px-10 h-14 text-[16px] font-bold shadow-xl shadow-blue-500/20 transition-all active:scale-95"
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
              className="group relative flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-[32px] p-8 min-h-[280px] bg-white hover:border-[#3182F6] hover:bg-blue-50/30 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300"
            >
              <div className="p-4 bg-blue-50 text-[#3182F6] rounded-full mb-5 transition-transform group-hover:scale-110 duration-300">
                <Plus className="w-8 h-8" />
              </div>
              <span className="text-[17px] font-extrabold text-[#191F28]">
                새 포트폴리오 만들기
              </span>
            </button>

            {/* Portfolio Cards */}
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {portfolios.map((p: any) => (
              <div key={p.id} className="group relative flex flex-col bg-white border border-black/5 rounded-[32px] overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-black/5 transition-all duration-500 min-h-[280px] hover:-translate-y-1">
                <div className="p-7 md:p-8 flex-1 flex flex-col items-start gap-4">
                  <div className="flex w-full items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-extrabold text-[20px] text-[#191F28] truncate mb-1">
                        {p.title || p.slug}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-bold text-[#3182F6]/70 uppercase tracking-widest">{p.theme}</span>
                        <div className="h-1 w-1 rounded-full bg-gray-300" />
                        <span className="text-[13px] font-medium text-gray-400 truncate tracking-tight">{p.slug}.portfolioforge.app</span>
                      </div>
                    </div>
                    {p.is_published ? (
                      <div className="shrink-0 px-2.5 py-1 text-[11px] font-extrabold bg-green-50 text-green-600 rounded-lg border border-green-100 flex items-center gap-1">
                         <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                         LIVE
                      </div>
                    ) : (
                      <div className="shrink-0 px-2.5 py-1 text-[11px] font-extrabold bg-gray-50 text-gray-400 rounded-lg border border-gray-100">
                        DRAFT
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-auto flex w-full items-center justify-between">
                    <div className="flex items-center gap-2 text-[12px] font-bold text-gray-400">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDistanceToNow(new Date(p.created_at), { addSuffix: true, locale: ko })}
                    </div>
                  </div>
                </div>
                
                <div className="p-4 pt-0">
                  <div className="flex h-14 bg-gray-50 rounded-[20px] border border-black/3 overflow-hidden p-1 shadow-inner">
                    <a 
                      href={p.slug ? `/${p.slug}` : "#"} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="flex-1 flex items-center justify-center gap-1.5 text-[14px] font-bold text-[#4E5968] hover:bg-white hover:text-[#3182F6] hover:shadow-sm transition-all rounded-[16px]"
                    >
                      <ExternalLink className="w-4 h-4 opacity-70" />
                      내 사이트
                    </a>
                    <Link 
                      href={`/generate/${p.id}?step=adjust`} 
                      className="flex-1 flex items-center justify-center gap-1.5 text-[14px] font-bold text-white bg-[#3182F6] shadow-sm hover:brightness-110 transition-all rounded-[16px]"
                    >
                      <Edit2 className="w-4 h-4" />
                      편집
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          disabled={deleteMutation.isPending}
                          className="w-12 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all rounded-[16px]"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-[32px] border-none shadow-2xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-[20px] font-extrabold">포트폴리오를 삭제할까요?</AlertDialogTitle>
                          <AlertDialogDescription className="text-[15px] font-medium leading-relaxed">
                            이 작업은 되돌릴 수 없습니다. 포트폴리오와 관련된 모든 블록과 데이터가 영구적으로 삭제됩니다.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="pt-2">
                          <AlertDialogCancel className="rounded-2xl h-12 border-black/5 font-bold">취소</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMutation.mutate(p.id)}
                            className="bg-red-500 hover:bg-red-600 text-white rounded-2xl h-12 font-bold px-6 shadow-lg shadow-red-500/20"
                          >
                            네, 삭제할게요
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
