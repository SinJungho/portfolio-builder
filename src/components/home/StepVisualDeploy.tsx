export default function StepVisualDeploy() {
  return (
    <div className="w-full p-6 flex flex-col items-center gap-3">
      {/* domain */}
      <div className="bg-white rounded-[10px] px-4 py-2 shadow-[0_2px_12px_rgba(0,0,0,0.1)] text-xs text-gray-700 font-medium border border-[#F0F4F8]">
        🌐 yourname.portfolioforge.dev
      </div>

      {/* connector line */}
      <div className="w-0.5 h-4 bg-gray-200" />

      {/* deploy platforms */}
      <div className="flex gap-2">
        {["Vercel", "Netlify", "GitHub Pages"].map((v) => (
          <div
            key={v}
            className="px-3 py-1.5 rounded-lg bg-slate-50 border border-gray-200 text-[11px] font-semibold text-gray-500"
          >
            {v}
          </div>
        ))}
      </div>

      {/* deploy status */}
      <div className="flex items-center gap-1.5 mt-1">
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
        <span className="text-xs text-emerald-500 font-semibold">
          배포 완료
        </span>
      </div>
    </div>
  );
}
