"use client";

import { Integration } from "@/types/integration";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";

export function useIntegrations() {
  const queryClient = useQueryClient();

  const {
    data: integrations,
    isLoading,
    error,
  } = useQuery<Integration[]>({
    queryKey: ["integrations", "rss"],
    queryFn: async (): Promise<Integration[]> => {
      const response = await fetch("/api/integrations/rss");
      if (!response.ok) {
        throw new Error("연동 서비스 정보를 가져오지 못했습니다.");
      }
      return response.json();
    },
  });

  // 데이터 로드에 실패하면 화면 프리징 대신 토스트 알림으로 피드백을 제공합니다.
  useEffect(() => {
    if (error) {
      toast.error(
        error.message ||
          "연동 서비스 정보를 가져오는 과정에서 오류가 발생했습니다.",
      );
    }
  }, [error]);

  const blogIntegration = integrations?.find((integration: Integration) =>
    ["tistory", "velog", "medium", "custom_rss"].includes(integration.provider),
  );

  // 블로그 채널을 연동하거나 지금 동기화를 수행합니다.
  const connectMutation = useMutation({
    mutationFn: async (url: string): Promise<{ syncedCount: number }> => {
      const response = await fetch("/api/integrations/rss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "RSS 피드 연동에 실패했습니다.");
      }
      return data;
    },
    onSuccess: (data: { syncedCount: number }) => {
      toast.success(
        `RSS 피드가 연결되었습니다! ${data.syncedCount}개의 글이 동기화되었습니다.`,
      );
      queryClient.invalidateQueries({ queryKey: ["integrations", "rss"] });
    },
    onError: (mutationError: Error) => {
      toast.error(mutationError.message);
    },
  });

  // 기존 블로그 연동을 안전하게 해제합니다.
  const disconnectMutation = useMutation({
    mutationFn: async (
      integrationId: string,
    ): Promise<{ success: boolean; message: string }> => {
      const response = await fetch("/api/integrations/rss", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ integrationId }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "RSS 피드 연동 해제에 실패했습니다.");
      }
      return data;
    },
    onSuccess: () => {
      toast.success("블로그 피드 연동이 해제되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["integrations", "rss"] });
    },
    onError: (mutationError: Error) => {
      toast.error(mutationError.message);
    },
  });

  return {
    integrations,
    blogIntegration,
    isLoading,
    connectMutation,
    disconnectMutation,
  };
}
