import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이용약관 | PortfolioForge",
  description:
    "PortfolioForge 이용 조건, 계정과 콘텐츠의 권리, 서비스 변경과 중단에 관한 안내입니다.",
};

const LAST_UPDATED = "2026년 8월 7일";

export default function TermsPage() {
  return (
    <div className="bg-spotify-near-black px-6 pt-28 pb-24 sm:pt-32">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-[clamp(32px,4vw,48px)] font-black leading-tight tracking-tight text-white">
          이용약관
        </h1>
        <p className="mt-4 text-[14px] font-medium text-spotify-silver">
          최종 수정일 {LAST_UPDATED}
        </p>

        <div className="mt-8 rounded-lg border border-spotify-warning/30 bg-spotify-warning/10 p-5">
          <p className="text-[14px] font-bold text-spotify-warning">
            초안입니다. 법률 검토 전이며, 검토 후 내용이 바뀔 수 있습니다.
          </p>
        </div>

        <div className="mt-14 space-y-12">
          <section>
            <h2 className="mb-4 text-[22px] font-black tracking-tight text-white">
              서비스 소개
            </h2>
            <p className="text-[15px] leading-relaxed text-spotify-silver">
              PortfolioForge는 GitHub의 공개 활동을 읽어 포트폴리오 웹페이지를
              만들고 공개하는 서비스입니다. 이 약관에 동의해야 서비스를 이용할
              수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-[22px] font-black tracking-tight text-white">
              계정
            </h2>
            <p className="text-[15px] leading-relaxed text-spotify-silver">
              GitHub 계정으로 가입합니다. 계정 관리 책임은 이용자에게 있으며,
              GitHub 계정을 잃으면 이 서비스의 계정에도 접근할 수 없습니다.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-[22px] font-black tracking-tight text-white">
              콘텐츠의 권리
            </h2>
            <p className="text-[15px] leading-relaxed text-spotify-silver">
              포트폴리오에 올린 글, 이미지, 프로젝트 설명의 권리는 이용자에게
              있습니다. 서비스는 포트폴리오를 저장하고 공개된 주소로 보여주기
              위해 필요한 범위에서만 콘텐츠를 사용합니다.
            </p>
            <p className="mt-4 text-[15px] leading-relaxed text-spotify-silver">
              타인의 저작물을 권한 없이 올리거나, 법령을 위반하는 내용을 공개하는
              것은 금지합니다. 신고가 접수되면 해당 포트폴리오의 공개를 중단할 수
              있습니다.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-[22px] font-black tracking-tight text-white">
              서비스 변경과 중단
            </h2>
            <p className="text-[15px] leading-relaxed text-spotify-silver">
              기능은 예고 없이 추가되거나 바뀔 수 있습니다. 서비스 전체를 종료할
              때는 미리 공지하고, 포트폴리오 데이터를 내보낼 수 있는 기간을
              둡니다.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-[22px] font-black tracking-tight text-white">
              책임의 한계
            </h2>
            <p className="text-[15px] leading-relaxed text-spotify-silver">
              서비스는 있는 그대로 제공됩니다. GitHub 등 외부 서비스의 장애나
              정책 변경으로 발생한 문제, 이용자가 올린 콘텐츠로 발생한 분쟁에
              대해서는 책임지지 않습니다.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-[22px] font-black tracking-tight text-white">
              문의
            </h2>
            <p className="text-[15px] leading-relaxed text-spotify-silver">
              약관 관련 문의는 아래로 연락해 주세요.
            </p>
            <p className="mt-3 text-[15px] font-bold text-white">
              연락처 미정. 서비스 공개 전 반드시 채워야 합니다.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
