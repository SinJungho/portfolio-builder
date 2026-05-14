import Reveal from "../common/Reveal";

export default function SocialProof() {
  const stats = [
    { value: "12,400+", label: "생성된 포트폴리오" },
    { value: "94%", label: "취업 성공률" },
    { value: "3분", label: "평균 생성 시간" },
    { value: "4.9/5", label: "사용자 만족도" },
  ];

  return (
    <section className="border-y border-white/5 bg-spotify-near-black px-6 py-16 sm:py-24">
      <div className="mx-auto grid grid-cols-2 lg:flex max-w-7xl justify-center gap-x-12 gap-y-10 md:gap-24 lg:gap-32">
        {stats.map((s, i) => (
          <Reveal key={i} delay={i * 80}>
            <div className="text-center group">
              <div
                className="
                  mb-2
                  text-[32px] sm:text-[42px]
                  font-black
                  tracking-tight
                  text-white
                  group-hover:text-spotify-green transition-colors duration-500
                "
              >
                {s.value}
              </div>

              <div className="text-[14px] font-bold text-spotify-silver uppercase tracking-spotify">
                {s.label}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
