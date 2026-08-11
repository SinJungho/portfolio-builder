import MockPortfolio from "@/components/common/MockPortfolio";
import CTAButton from "../common/CTAButton";

// 진입 시퀀스는 CSS 애니메이션이다. 예전엔 useEffect + setTimeout(100)으로 켰는데,
// 그러면 SSR 첫 페인트에서 히어로 전체가 opacity-0이라 LCP가 그만큼 늦었다.
// 헤드라인(LCP 요소)은 애니메이션 없이 즉시 그리고, 주변만 순차로 들어온다.
const ENTER = "animate-in fade-in-0 slide-in-from-bottom-4 duration-700 fill-mode-backwards motion-reduce:animate-none";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-spotify-near-black pb-20 pt-24 sm:pb-28">
      <div className="relative mx-auto grid max-w-[90rem] items-start gap-14 px-6 lg:grid-cols-[minmax(29rem,0.88fr)_minmax(0,1.12fr)] lg:gap-14 xl:gap-20">
        <div className="min-w-0 text-center lg:text-left">
          <div className={ENTER}>
            <p className="mb-8 text-[15px] font-bold tracking-[-0.02em] text-spotify-green">
              GitHub 작업 기록을 포트폴리오로
            </p>
          </div>

          {/* Headline: LCP 요소. 첫 페인트에 그대로 보여야 한다. */}
          <h1 className="mb-7 text-[clamp(46px,4.5vw,76px)] font-black leading-[1.02] tracking-tight text-white lg:whitespace-nowrap">
            작업의 흔적을 <br />
            <span className="text-spotify-green">보여줄 이야기</span>로
          </h1>

          <p className={`mx-auto mb-9 max-w-xl text-[17px] font-medium leading-relaxed text-spotify-silver sm:text-[19px] lg:mx-0 delay-100 ${ENTER}`}>
            AI가 GitHub의 프로젝트·기술·기여도를 읽고, 보여줄 작업과 설명 초안을 먼저 준비해요. 사용자는 확인만 하면 돼요.
          </p>

          <div className={`flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center lg:justify-start delay-200 ${ENTER}`}>
            <CTAButton href="/dashboard" primary className="h-13 w-full px-6 text-[15px] sm:h-14 sm:px-7 sm:text-[16px] sm:w-auto">
              포트폴리오 만들기
            </CTAButton>

            {/* lg 이상에서는 목업이 이미 오른쪽에 보이므로 이 버튼은 스크롤 0px, 즉 무반응이다.
                목업이 아래로 밀리는 좁은 화면에서만 노출한다.
                숨김은 래퍼에 건다. btn-pill-secondary가 @layer utilities에서 inline-flex를
                적용하고 그게 lg:hidden보다 늦게 선언돼 버튼에 직접 걸면 진다. */}
            <div className="contents lg:hidden">
              <CTAButton href="#portfolio-preview" className="h-13 w-full px-6 text-[15px] sm:h-14 sm:px-7 sm:text-[16px] sm:w-auto">
                결과 미리 보기
              </CTAButton>
            </div>
          </div>
        </div>

        <div id="portfolio-preview" className={`relative min-w-0 scroll-mt-24 delay-300 ${ENTER}`}>
          <div className="mb-5 flex flex-col items-start gap-2 rounded-lg border border-white/10 bg-spotify-dark-surface px-4 py-3 text-[12px] font-bold tracking-[0.06em] text-spotify-near-white sm:flex-row sm:items-center sm:justify-between sm:text-[13px]">
            <span className="flex items-center gap-2">
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-bold tracking-[0.08em] text-spotify-silver">
                예시
              </span>
              포트폴리오 결과 미리보기
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-spotify-green/20 bg-spotify-green/10 px-2.5 py-1 text-[11px] tracking-[0.08em] text-spotify-green sm:text-[12px]">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-spotify-green shadow-[0_0_8px_rgba(30,215,96,0.75)]" />
              배포 완료
            </span>
          </div>
          <MockPortfolio />
        </div>
      </div>
    </section>
  );
}
