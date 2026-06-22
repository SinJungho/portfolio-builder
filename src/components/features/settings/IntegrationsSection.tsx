"use client";

import { useIntegrations } from "@/hooks/useIntegrations";
import { BlogIntegrationCard } from "./integrations/BlogIntegrationCard";
import { GitHubIntegrationCard } from "./integrations/GitHubIntegrationCard";

export function IntegrationsSection() {
  const { blogIntegration, isLoading, connectMutation, disconnectMutation } =
    useIntegrations();
  const handleConnect = (url: string) => {
    connectMutation.mutate(url);
  };

  const handleSync = () => {
    if (!blogIntegration?.metadata?.feedUrl) return;
    connectMutation.mutate(blogIntegration.metadata.feedUrl);
  };

  const handleDisconnect = () => {
    if (!blogIntegration) return;
    disconnectMutation.mutate(blogIntegration.id);
  };

  return (
    <section
      aria-labelledby="integrations-title"
      className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      <div>
        <h2
          id="integrations-title"
          className="text-xl font-black text-white mb-8 tracking-tight uppercase tracking-spotify"
        >
          연동된 서비스
        </h2>

        <ul role="list" className="list-none p-0 m-0 grid grid-cols-1 gap-6">
          <li>
            <GitHubIntegrationCard />
          </li>

          <li>
            <BlogIntegrationCard
              blogIntegration={blogIntegration}
              isLoading={isLoading}
              isSyncing={connectMutation.isPending}
              isDisconnecting={disconnectMutation.isPending}
              onConnect={handleConnect}
              onSync={handleSync}
              onDisconnect={handleDisconnect}
            />
          </li>
        </ul>
      </div>
    </section>
  );
}
