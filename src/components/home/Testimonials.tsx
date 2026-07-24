import Reveal from "../common/Reveal";

// 실제 사용자 후기 데이터가 아직 없어, 지어낸 인물·회사 인용 대신
// 제품이 실제로 해결하는 지점을 솔직하게 보여준다. 실제 후기가 쌓이면 교체.
const relieved = [
  {
    concern: "시간이 없어서",
    text: "이력서 마감은 다가오는데 포트폴리오는 엄두가 안 날 때. GitHub만 연결하면 초안이 바로 만들어져요.",
  },
  {
    concern: "뭘 보여줄지 몰라서",
    text: "저장소는 많은데 뭘 앞에 둘지 모르겠을 때. 눈에 띄는 프로젝트를 골라 읽기 좋게 정리해줘요.",
  },
  {
    concern: "디자인이 자신 없어서",
    text: "디자인 감각이 없어도 괜찮아요. 템플릿을 고르면 그대로 완성된 결과가 나와요.",
  },
];

export default function Testimonials() {
  return (
    <section className="bg-spotify-near-black px-6 py-28 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <div className="mb-14 max-w-2xl sm:mb-16">
            <p className="mb-4 text-[14px] font-bold tracking-[0.02em] text-spotify-green">
              이럴 때 좋아요
            </p>
            <h2 className="m-0 text-[clamp(36px,5vw,56px)] font-black leading-tight tracking-tight text-white">
              포트폴리오,
              <br />
              어디서부터 막막했나요
            </h2>
            <p className="mt-5 text-[16px] font-medium leading-relaxed text-spotify-silver sm:text-[18px]">
              다들 여기서 한 번씩 멈춰요. 그 지점을 PortfolioForge가 어떻게 푸는지 정리했어요.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {relieved.map((item, i) => (
            <Reveal key={item.concern} delay={i * 100}>
              <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-spotify-dark-surface p-7 transition-colors duration-300 hover:border-white/20">
                <p className="mb-4 text-[14px] font-bold text-spotify-green">
                  {item.concern}
                </p>
                <p className="text-[16px] font-medium leading-relaxed text-white/90 sm:text-[17px]">
                  {item.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
