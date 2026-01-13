import { Github, Rss } from "lucide-react";

export function IntegrationsSection() {
  const integrations = [
    {
      id: "github",
      name: "GitHub",
      icon: Github,
      connected: true,
      description: "Sync your repositories and contribution data",
    },
    {
      id: "blog",
      name: "Blog Feed",
      icon: Rss,
      connected: false,
      description: "Display your latest blog posts automatically",
    },
  ];

  return (
    <div>
      <h2 className="text-gray-900 mb-6">Connected Services</h2>

      <div className="space-y-4">
        {integrations.map((integration) => {
          const Icon = integration.icon;
          return (
            <div
              key={integration.id}
              className="p-6 border border-gray-200 rounded-lg flex items-start justify-between"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Icon className="w-6 h-6 text-gray-700" />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-gray-900">{integration.name}</h3>
                    {integration.connected && (
                      <span className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                        Connected
                      </span>
                    )}
                    {!integration.connected && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        Not Connected
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    {integration.description}
                  </p>
                </div>
              </div>

              <div>
                {integration.connected ? (
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 hover:border-red-300 hover:text-red-700 transition-colors">
                    Disconnect
                  </button>
                ) : (
                  <button className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors">
                    Connect
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
