export default function StepVisualAnalyze() {
  const items = [
    "React · 72%",
    "TypeScript · 61%",
    "Node.js · 48%",
    "Python · 31%",
  ];

  return (
    <div className="w-full p-6">
      <div className="mx-auto max-w-70">
        <div className="mb-2.5 text-[11px] font-semibold text-gray-400">
          AI 분석 중...
        </div>

        {items.map((item, i) => {
          const pct = parseInt(item.split("· ")[1]);

          return (
            <div key={i} className="mb-2.5">
              {/* label row */}
              <div className="mb-1 flex justify-between text-[12px]">
                <span className="font-medium text-gray-700">
                  {item.split(" ·")[0]}
                </span>
                <span className="text-gray-400">{pct}%</span>
              </div>

              {/* progress background */}
              <div className="h-1.5 rounded-[3px] bg-[#F0F4F8]">
                <div
                  className="
                    h-full rounded-[3px]
                    bg-[linear-gradient(90deg,#3182F6,#8B5CF6)]
                  "
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
