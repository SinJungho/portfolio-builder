import { TOSS_BLUE } from "@/lib/validations/color";
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
    <section className="bg-[#FAFAFA] py-30 px-6">
      <div className="max-w-280 mx-auto">
        <Reveal>
          <div className="text-center mb-16">
            <p
              className="text-sm font-semibold mb-3 tracking-[0.5px]"
              style={{ color: TOSS_BLUE }}
            >
              TESTIMONIALS
            </p>

            <h2 className="text-[clamp(36px,5vw,56px)] font-extrabold text-[#191F28] tracking-[-1.5px] leading-[1.15] m-0">
              이미 많은 개발자가
              <br />
              취업에 성공했어요
            </h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reviews.map((r, i) => (
            <Reveal key={i} delay={i * 100}>
              <div className="bg-white rounded-4xl p-8 shadow-[0_2px_20px_rgba(0,0,0,0.06)] border border-black/5">
                {/* rating */}
                <div className="flex gap-0.5 mb-5">
                  {Array.from({ length: r.rating }).map((_, j) => (
                    <span key={j} className="text-[16px] text-[#FCD34D]">
                      ★
                    </span>
                  ))}
                </div>

                {/* review text */}
                <p className="text-[16px] leading-[1.7] text-gray-700 mb-6 font-normal">
                  &quot;{r.text}&quot;
                </p>

                {/* user */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-[16px] font-bold"
                    style={{
                      background: `hsl(${i * 80 + 200}, 70%, 85%)`,
                      color: `hsl(${i * 80 + 200}, 60%, 40%)`,
                    }}
                  >
                    {r.name[0]}
                  </div>

                  <div>
                    <div className="text-sm font-bold text-[#191F28]">
                      {r.name}
                    </div>
                    <div className="text-xs text-gray-400">
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
