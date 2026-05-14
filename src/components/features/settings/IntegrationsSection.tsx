import { Github, Rss } from "lucide-react";
import { Button } from "@/components/ui/button";

export function IntegrationsSection() {
  const integrations = [
    {
      id: "github",
      name: "GitHub",
      icon: Github,
      connected: true,
      description: "Sync your repositories and contribution data to build your portfolio automatically.",
    },
    {
      id: "blog",
      name: "Blog Feed",
      icon: Rss,
      connected: false,
      description: "Display your latest blog posts from Tistory, Velog, or custom RSS feeds.",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-xl font-black text-white mb-8 tracking-tight uppercase tracking-spotify">Connected Services</h2>

        <div className="grid grid-cols-1 gap-4">
          {integrations.map((integration) => {
            const Icon = integration.icon;
            return (
              <div
                key={integration.id}
                className="p-8 bg-spotify-dark-surface rounded-[32px] border border-white/5 flex flex-col sm:flex-row items-start justify-between gap-6 hover:bg-spotify-mid-dark transition-all group"
              >
                <div className="flex items-start gap-6">
                  <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform duration-500">
                    <Icon className={integration.connected ? "w-7 h-7 text-white" : "w-7 h-7 text-spotify-silver"} strokeWidth={1.5} />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="text-[18px] font-black text-white tracking-tight">{integration.name}</h3>
                      {integration.connected ? (
                        <span className="flex items-center gap-2 text-[11px] font-black text-spotify-green bg-spotify-green/10 px-3 py-1 rounded-full uppercase tracking-spotify">
                          <span className="w-1.5 h-1.5 bg-spotify-green rounded-full shadow-[0_0_8px_rgba(30,215,96,0.6)]"></span>
                          Connected
                        </span>
                      ) : (
                        <span className="text-[11px] font-black text-spotify-silver bg-white/5 px-3 py-1 rounded-full uppercase tracking-spotify">
                          Not Connected
                        </span>
                      )}
                    </div>
                    <p className="text-[14px] text-spotify-silver font-medium leading-relaxed max-w-md">
                      {integration.description}
                    </p>
                  </div>
                </div>

                <div className="w-full sm:w-auto">
                  {integration.connected ? (
                    <Button 
                      variant="outline" 
                      className="w-full sm:w-auto btn-pill-secondary h-11 px-8 text-spotify-silver hover:text-spotify-negative hover:border-spotify-negative/30 hover:bg-spotify-negative/5"
                    >
                      Disconnect
                    </Button>
                  ) : (
                    <Button className="w-full sm:w-auto btn-pill-primary h-11 px-10">
                      Connect Service
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
