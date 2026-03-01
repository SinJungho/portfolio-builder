import Reveal from "../common/Reveal";

export default function SocialProof() {
  const stats = [
    { value: "12,400+", label: "생성된 포트폴리오" },
    { value: "94%", label: "취업 성공률" },
    { value: "3분", label: "평균 생성 시간" },
    { value: "4.9/5", label: "사용자 만족도" },
  ];

  return (
    <section className="border-y border-[#F0F0F0] bg-white px-6 py-12">
      <div className="mx-auto grid grid-cols-2 md:flex max-w-280 justify-center gap-x-8 gap-y-4 md:gap-20">
        {stats.map((s, i) => (
          <Reveal key={i} delay={i * 80}>
            <div className="text-center">
              <div
                className="
                  mb-1
                  text-[36px]
                  font-extrabold
                  tracking-[-1px]
                  text-[#191F28]
                "
              >
                {s.value}
              </div>

              <div className="text-[14px] font-medium text-gray-400">
                {s.label}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
