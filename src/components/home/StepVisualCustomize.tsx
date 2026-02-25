export default function StepVisualCustomize() {
  const themes = ["#191F28", "#3182F6", "#10B981", "#F59E0B", "#EF4444"];

  return (
    <div className="flex w-full flex-col items-center gap-4 p-6">
      {/* preview card */}
      <div className="w-50 rounded-xl bg-white p-4 shadow-[0_4px_16px_rgba(0,0,0,0.1)]">
        <div className="mb-3 h-20 rounded-lg bg-[linear-gradient(135deg,#3182F6,#8B5CF6)]" />

        <div className="mb-1.5 h-2.5 w-[70%] rounded-lg bg-[#F0F4F8]" />

        <div className="h-2 w-[50%] rounded-lg bg-[#F0F4F8]" />
      </div>

      {/* theme selector */}
      <div className="flex gap-2">
        {themes.map((c) => (
          <div
            key={c}
            className="h-5 w-5 cursor-pointer rounded-full"
            style={{
              background: c,
              boxShadow:
                c === "#3182F6" ? `0 0 0 3px white, 0 0 0 5px ${c}` : "none",
            }}
          />
        ))}
      </div>
    </div>
  );
}
