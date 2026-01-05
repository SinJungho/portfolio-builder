import { Pencil, RefreshCw, Sparkles } from "lucide-react";

export function Features() {
  const features = [
    {
      icon: RefreshCw,
      title: "Automated GitHub Sync",
      description: "Projects and contributions updated in real time",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Sparkles,
      title: "AI Project Curation",
      description: "Highlight your strongest work automatically",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: Pencil,
      title: "Real-time Editor",
      description: "Edit and preview your portfolio instantly",
      gradient: "from-orange-500 to-red-500",
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-gray-900 mb-4">
            Everything you need to showcase your work
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Powerful features designed to make portfolio management effortless
            for developers
          </p>
        </div>

        <div className="grid grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-xl transition-all hover:-translate-y-1"
              >
                {/* Gradient background on hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity`}
                ></div>

                <div className="relative space-y-4">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  <h3 className="text-gray-900">{feature.title}</h3>

                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
