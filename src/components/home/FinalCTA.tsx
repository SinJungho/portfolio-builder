import Reveal from "../common/Reveal";
import CTAButton from "../common/CTAButton";

export default function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-spotify-near-black px-6 py-28 text-center sm:py-36">
      {/* 초록 글로우는 히어로에 한 번만 둔다. 두 번 나오면 시그니처가 아니라 배경 효과가 된다. */}
      <Reveal>
        <div className="relative max-w-4xl mx-auto">
          {/* title */}
          {/* 상한을 히어로 h1(68px) 아래로 둔다. 마무리 헤드라인이 히어로보다 크면 무게중심이 뒤로 밀린다. */}
          <h2 className="text-[clamp(40px,5.5vw,64px)] font-black text-white tracking-tight leading-[1.05] mb-8">
            지금 시작하면
            <br />
            <span className="text-spotify-green">오늘 완성</span>돼요
          </h2>

          {/* description */}
          <p className="text-[18px] sm:text-[22px] text-spotify-silver font-medium leading-relaxed mb-14 max-w-2xl mx-auto">
            GitHub에 쌓인 작업을, <br className="hidden sm:block" />
            오늘 저녁 채용 담당자에게 보낼 링크로 만들어 보세요.
          </p>

          {/* CTA button */}
          <div className="flex flex-col items-center gap-6">
            <CTAButton href="/dashboard" primary className="h-14 px-8 text-[16px] shadow-spotify sm:h-15 sm:px-10 sm:text-[17px]">
              포트폴리오 만들기
            </CTAButton>

            {/* sub text */}
            <div className="text-[14px] font-bold tracking-[-0.01em] text-spotify-silver">
              GitHub 계정만 있으면 됩니다
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
