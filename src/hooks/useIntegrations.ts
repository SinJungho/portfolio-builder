"use client";

import { Integration } from "@/types/integration";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { errorMessage, responseErrorMessage } from "@/lib/api/errors";

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
        const data = await response.json().catch(() => null);
        throw new Error(responseErrorMessage(data, "FETCH_FAILED"));
      }
      return response.json();
    },
  });

  useEffect(() => {
    if (error) {
      toast.error(
        error.message ||
          errorMessage("FETCH_FAILED"),
      );
    }
  }, [error]);

  const blogIntegration = integrations?.find((integration: Integration) =>
    ["tistory", "velog", "medium", "custom_rss"].includes(integration.provider),
  );

  const connectMutation = useMutation({
    mutationFn: async (url: string): Promise<{ syncedCount: number }> => {
      const response = await fetch("/api/integrations/rss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(responseErrorMessage(data, "RSS_IMPORT_FAILED"));
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
        throw new Error(responseErrorMessage(data, "RSS_DISCONNECT_FAILED"));
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
