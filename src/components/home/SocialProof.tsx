import { FileDown, Globe, ShieldCheck } from "lucide-react";
import Reveal from "../common/Reveal";

export default function SocialProof() {
  // Features가 자동 동기화·큐레이션·코드 없는 편집을 이미 다루므로,
  // 여기서는 그와 겹치지 않는 '이의 해소'(개인정보·소유·이식성·비용)만 보장한다.
  const guarantees = [
    {
      icon: ShieldCheck,
      claim: "공개 데이터만",
      support: "저장소를 읽기만 해요. 코드는 건드리지 않아요",
    },
    {
      icon: Globe,
      claim: "내 주소로 공개",
      support: "완성하면 링크 하나로 바로 공유할 수 있어요",
    },
    {
      icon: FileDown,
      claim: "PDF로도 내보내기",
      support: "링크 대신 PDF로 저장해 지원서에 바로 첨부해요",
    },
  ];

  return (
    <section className="border-y border-white/5 bg-spotify-near-black px-6 py-16 sm:py-20">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
        {guarantees.map((g, i) => {
          const Icon = g.icon;
          return (
            <Reveal key={g.claim} delay={i * 80}>
              <div className="flex items-start gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-spotify-green/10 text-spotify-green">
                  <Icon size={18} strokeWidth={2.2} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-[16px] font-bold leading-tight text-white sm:text-[17px]">
                    {g.claim}
                  </p>
                  <p className="mt-1.5 text-[13px] font-medium leading-snug text-spotify-silver sm:text-[14px]">
                    {g.support}
                  </p>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
