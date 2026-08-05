"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Edit2,
  ExternalLink,
  Globe,
  Loader2,
  MoreVertical,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { responseErrorMessage } from "@/lib/api/errors";

interface Portfolio {
  id: string;
  slug: string;
  title: string | null;
  theme: string;
  is_published: boolean;
  updated_at: string;
}

export function PortfolioGrid() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: portfolios = [], isLoading } = useQuery<Portfolio[]>({
    queryKey: ["portfolios"],
    queryFn: async () => {
      const res = await fetch("/api/portfolios");
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(responseErrorMessage(data, "FETCH_FAILED"));
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      setIsCreating(true);
      const res = await fetch("/api/portfolios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: "minimal" }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(responseErrorMessage(errorData, "PORTFOLIO_CREATE_FAILED"));
      }

      return res.json();
    },
    onSuccess: (data) => {
      toast.success("포트폴리오가 생성되었습니다. AI 분석을 시작합니다.");
      router.push(`/generate/${data.portfolio_id}`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
      setIsCreating(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/portfolios/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(responseErrorMessage(data, "PORTFOLIO_DELETE_FAILED"));
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolios"] });
      toast.success("포트폴리오가 삭제되었습니다");
      setDeleteId(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-80 bg-white rounded-[32px] border border-gray-100"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-black tracking-tight text-gray-900">
            내 포트폴리오
          </h2>
          <p className="text-sm text-gray-400 font-medium">
            관리 중인 포트폴리오 목록입니다.
          </p>
        </div>
        {portfolios.length > 0 && (
          <Button
            onClick={() => createMutation.mutate()}
            disabled={isCreating}
            className="rounded-2xl bg-gray-900 text-white hover:bg-black flex items-center gap-2 px-6 h-12 shadow-lg shadow-gray-200"
          >
            {isCreating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            신규 생성
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
        {portfolios.map((portfolio, index) => (
          <motion.div
            key={portfolio.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group relative bg-white border border-gray-100 rounded-[32px] overflow-hidden hover:shadow-2xl hover:shadow-gray-200 transition-all duration-500 hover:-translate-y-2 cursor-pointer"
          >
            <div className="aspect-[16/10] bg-gray-50 relative flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 group-hover:scale-110 transition-transform duration-700" />

              <motion.div
                whileHover={{ rotate: 12, scale: 1.1 }}
                className="relative z-10 w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center border border-gray-50"
              >
                <Globe className="h-10 w-10 text-gray-200 group-hover:text-blue-500 transition-colors duration-500" />
              </motion.div>

              <div className="absolute top-6 left-6 z-20">
                <div
                  className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-sm backdrop-blur-md ${
                    portfolio.is_published
                      ? "bg-green-500/10 text-green-600 border border-green-200/50"
                      : "bg-orange-500/10 text-orange-600 border border-orange-200/50"
                  }`}
                >
                  {portfolio.is_published ? "● 배포됨" : "○ 준비 중"}
                </div>
              </div>

              <div className="absolute top-6 right-6 z-20">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="h-10 w-10 bg-white/80 backdrop-blur-md rounded-2xl border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-white transition-all shadow-sm">
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-48 rounded-[20px] p-2 border-gray-100 shadow-xl"
                  >
                    <DropdownMenuItem asChild>
                      <Link
                        href={`/${portfolio.slug}`}
                        target="_blank"
                        className="flex items-center px-3 py-2.5 rounded-xl cursor-pointer hover:bg-gray-50 font-bold text-[14px]"
                      >
                        <ExternalLink className="mr-3 h-4 w-4 text-blue-500" />
                        <span>미리보기</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex items-center px-3 py-2.5 rounded-xl cursor-pointer text-red-500 hover:bg-red-50 font-bold text-[14px]"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteId(portfolio.id);
                      }}
                    >
                      <Trash2 className="mr-3 h-4 w-4" />
                      <span>삭제하기</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="absolute inset-0 bg-black/5 flex items-center justify-center z-10 backdrop-blur-[2px]"
              >
                <Link
                  href={`/generate/${portfolio.id}?step=adjust`}
                  className="bg-white text-gray-900 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-2xl hover:scale-105 active:scale-95 transition-all"
                >
                  <Edit2 className="h-4 w-4" />
                  편집하기
                </Link>
              </motion.div>
            </div>

            <div className="p-8">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900 line-clamp-1 mb-1 group-hover:text-blue-600 transition-colors">
                  {portfolio.title || "제목 없는 포트폴리오"}
                </h3>
                <p className="text-sm font-semibold text-gray-400">
                  {portfolio.slug}.portfolioforge.app
                </p>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1">
                    Last Update
                  </span>
                  <span className="text-[13px] font-bold text-gray-600">
                    {new Date(portfolio.updated_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                    <Globe className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: portfolios.length * 0.1 }}
          onClick={() => createMutation.mutate()}
          disabled={isCreating}
          className="relative min-h-[360px] bg-white border-2 border-dashed border-gray-200 rounded-[32px] flex flex-col items-center justify-center gap-6 hover:border-gray-900 hover:bg-[#FAFAFA] transition-all duration-500 group disabled:opacity-50"
        >
          {isCreating ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-gray-900" />
              <p className="text-sm font-bold text-gray-900 animate-pulse">
                포트폴리오 생성 중...
              </p>
            </div>
          ) : (
            <>
              <div className="h-20 w-20 rounded-[28px] bg-gray-50 shadow-sm border border-gray-100 flex items-center justify-center group-hover:scale-110 group-hover:bg-white group-hover:rotate-12 transition-all duration-500">
                <Plus className="h-10 w-10 text-gray-300 group-hover:text-gray-900 transition-colors" />
              </div>
              <div className="text-center px-8">
                <span className="block text-xl font-bold text-gray-900 mb-2">
                  새로운 포트폴리오
                </span>
                <span className="text-sm font-semibold text-gray-400 block max-w-[200px] leading-relaxed">
                  AI가 당신을 위한 최적의 포트폴리오를 구성합니다.
                </span>
              </div>
            </>
          )}
        </motion.button>
      </div>

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent className="rounded-[32px] p-8 border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black text-gray-900">
              포트폴리오를 삭제하시겠습니까?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500 font-medium pt-2">
              이 작업은 되돌릴 수 없습니다. 프로젝트 및 설정 데이터가 영구적으로
              삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-6">
            <AlertDialogCancel className="rounded-2xl border-gray-100 font-bold h-12 px-6">
              취소
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-red-500 hover:bg-red-600 rounded-2xl font-bold h-12 px-6"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              삭제하기
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
