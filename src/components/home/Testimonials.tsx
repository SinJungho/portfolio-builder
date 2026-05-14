import Reveal from "../common/Reveal";

export default function Testimonials() {
  const reviews = [
    {
      name: "박지현",
      role: "프론트엔드 개발자",
      company: "카카오",
      text: "포트폴리오 만드는 데 일주일 걸릴 것 같았는데 30분 만에 완성했어요. 취업 면접에서 포트폴리오 칭찬을 엄청 받았습니다.",
      rating: 5,
    },
    {
      name: "이도윤",
      role: "풀스택 개발자",
      company: "토스",
      text: "GitHub 연동하니까 알아서 최고의 프로젝트를 골라줬어요. AI 추천이 생각보다 훨씬 정확해서 놀랐어요.",
      rating: 5,
    },
    {
      name: "김민서",
      role: "백엔드 개발자",
      company: "네이버",
      text: "디자인에 자신 없었는데 템플릿만 골랐더니 결과물이 너무 예뻐서 제가 만든 게 맞나 싶었어요 ㅋㅋ",
      rating: 5,
    },
  ];

  return (
    <section className="bg-spotify-near-black py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <div className="text-center mb-20">
            <p className="text-[14px] font-bold text-spotify-green uppercase tracking-spotify-wide mb-4">
              TESTIMONIALS
            </p>

            <h2 className="text-[clamp(36px,5vw,56px)] font-black text-white tracking-tight leading-tight m-0">
              이미 많은 개발자가
              <br />
              취업에 성공했어요
            </h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((r, i) => (
            <Reveal key={i} delay={i * 100}>
              <div className="bg-spotify-dark-surface rounded-[32px] p-10 shadow-spotify-md border border-white/5 hover:bg-spotify-mid-dark transition-colors duration-300">
                {/* rating */}
                <div className="flex gap-1 mb-6">
                  {Array.from({ length: r.rating }).map((_, j) => (
                    <span key={j} className="text-[18px] text-spotify-green">
                      ★
                    </span>
                  ))}
                </div>

                {/* review text */}
                <p className="text-[17px] leading-relaxed text-white mb-8 font-medium italic opacity-90">
                  &quot;{r.text}&quot;
                </p>

                {/* user */}
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-[18px] font-black shadow-spotify-md"
                    style={{
                      background: `hsl(${i * 80 + 160}, 60%, 40%)`,
                      color: "white",
                    }}
                  >
                    {r.name[0]}
                  </div>

                  <div>
                    <div className="text-[16px] font-black text-white tracking-tight">
                      {r.name}
                    </div>
                    <div className="text-[13px] font-bold text-spotify-silver uppercase tracking-spotify mt-0.5">
                      {r.role} @ {r.company}
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
