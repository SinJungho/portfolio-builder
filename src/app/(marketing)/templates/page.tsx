import Reveal from "@/components/common/Reveal";
import MockPortfolio from "@/components/common/MockPortfolio";

export default function TemplatesPage() {
  return (
    <div className="bg-spotify-near-black pt-32 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <div className="text-center mb-20">
            <p className="text-[14px] font-bold text-spotify-green uppercase tracking-spotify-wide mb-4">
              TEMPLATES
            </p>

            <h2 className="text-[clamp(36px,5vw,56px)] font-black text-white tracking-tight leading-tight m-0">
              다양한 스타일로
              <br />
              개성을 표현하세요
            </h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-12">
          <Reveal delay={100}>
            <div className="bg-spotify-dark-surface rounded-[48px] p-8 sm:p-16 border border-white/5">
              <div className="flex flex-col lg:flex-row gap-12 items-center">
                <div className="flex-1 text-center lg:text-left">
                  <div className="inline-block px-4 py-1.5 rounded-full bg-spotify-green text-black text-[12px] font-black uppercase tracking-spotify mb-6">
                    Premium
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-black text-white mb-6">Spotify Immersive</h3>
                  <p className="text-lg text-spotify-silver font-medium leading-relaxed mb-8">
                    지금 보고 계신 PortfolioForge의 아이덴티티가 담긴 테마입니다. <br />
                    깊이 있는 다크 모드와 세련된 초록색 포인트가 조화를 이룹니다.
                  </p>
                  <ul className="space-y-3 mb-10 text-spotify-silver font-medium inline-block text-left">
                    <li className="flex items-center gap-3">
                      <span className="text-spotify-green font-bold">✓</span>
                      몰입형 다크 테마
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="text-spotify-green font-bold">✓</span>
                      반응형 그리드 레이아웃
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="text-spotify-green font-bold">✓</span>
                      애니메이션 인터랙션
                    </li>
                  </ul>
                </div>
                <div className="flex-1 w-full max-w-2xl scale-90 sm:scale-100">
                  <MockPortfolio />
                </div>
              </div>
            </div>
          </Reveal>
          
          {/* Coming Soon */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {[1, 2].map((i) => (
               <div key={i} className="bg-spotify-dark-surface/50 rounded-[40px] p-12 border border-white/5 border-dashed flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-spotify-silver/40 mb-6">
                    <span className="text-2xl font-black">?</span>
                  </div>
                  <h4 className="text-xl font-bold text-white/40 mb-2">New Template Coming Soon</h4>
                  <p className="text-spotify-silver/30 font-medium">새로운 스타일의 템플릿을 준비하고 있습니다.</p>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
