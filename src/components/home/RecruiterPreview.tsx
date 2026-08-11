import { Clock3, Eye, FolderGit2, Send } from "lucide-react";
import Reveal from "../common/Reveal";

const reviewItems = [
  [FolderGit2, "대표 프로젝트", "무엇을 만들었는지"],
  [Eye, "기술과 역할", "어디까지 맡았는지"],
  [Clock3, "최근 활동", "지금도 이어지는지"],
  [Send, "연락처", "다음 대화로 이어질지"],
] as const;

export default function RecruiterPreview() {
  return (
    <section className="bg-spotify-near-black px-6 py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl items-start gap-12 lg:grid-cols-[minmax(0,0.82fr)_minmax(24rem,1.18fr)] lg:gap-20">
        <Reveal>
          <div className="max-w-xl lg:sticky lg:top-28">
            <p className="mb-4 text-[14px] font-bold text-spotify-green">
              채용 담당자가 보는 화면
            </p>
            <h2 className="text-[clamp(34px,4.5vw,52px)] font-black leading-[1.08] tracking-tight text-white">
              보여줄 일만
              <br />
              앞에서 만나요
            </h2>
            <p className="mt-5 text-[16px] font-medium leading-relaxed text-spotify-silver sm:text-[18px]">
              모든 저장소를 훑게 하지 않아요. 대표 작업, 맡은 역할, 최근 활동, 연락 방법을 읽기 흐름에 맞춰 정리합니다.
            </p>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <ul className="grid border-t border-white/10 sm:grid-cols-2">
            {reviewItems.map(([Icon, label, description], i) => (
              <li
                key={label}
                className={`border-b border-white/10 py-7 sm:px-7 sm:py-9 ${i % 2 === 0 ? "sm:border-r" : ""}`}
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-md bg-white/[0.05] text-spotify-near-white">
                  <Icon size={19} aria-hidden="true" />
                </span>
                <h3 className="mt-6 text-[21px] font-black tracking-tight text-white">
                  {label}
                </h3>
                <p className="mt-2 text-[14px] font-medium leading-relaxed text-spotify-silver">
                  {description}
                </p>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
