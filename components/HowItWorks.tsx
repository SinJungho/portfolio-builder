import { Cpu, Github, Palette, Rocket } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      number: "1",
      icon: Github,
      title: "Connect GitHub",
      description: "Authorize with your GitHub account securely",
      color: "from-blue-500 to-cyan-500",
    },
    {
      number: "2",
      icon: Cpu,
      title: "Analyze Projects",
      description: "AI reviews your repositories and contributions",
      color: "from-purple-500 to-pink-500",
    },
    {
      number: "3",
      icon: Palette,
      title: "Customize Layout",
      description: "Edit and refine your portfolio in real-time",
      color: "from-orange-500 to-red-500",
    },
    {
      number: "4",
      icon: Rocket,
      title: "Publish Portfolio",
      description: "Deploy your portfolio with a single click",
      color: "from-green-500 to-emerald-500",
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div
        className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>

      <div className="relative max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-gray-900 mb-4">
            From GitHub to portfolio in minutes
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our streamlined process gets you from connection to deployment in
            just four simple steps
          </p>
        </div>

        <div className="grid grid-cols-4 gap-6 relative">
          {/* Connection lines */}
          <div className="absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-green-200"></div>

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                <div className="bg-white rounded-2xl p-6 space-y-4 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                  <div className="relative">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center relative z-10`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div
                      className={`absolute -top-1 -left-1 w-14 h-14 bg-gradient-to-br ${step.color} rounded-xl opacity-20 blur-md`}
                    ></div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-500 mb-1">
                      Step {step.number}
                    </div>
                    <h4 className="text-gray-900 mb-2">{step.title}</h4>
                    <p className="text-gray-600 text-sm">{step.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
