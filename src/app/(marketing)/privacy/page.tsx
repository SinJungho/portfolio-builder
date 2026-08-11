import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보처리방침 | PortfolioForge",
  description:
    "PortfolioForge가 수집하는 정보, 사용 목적, 보관 기간, 삭제 요청 방법을 정리했습니다.",
};

const LAST_UPDATED = "2026년 8월 7일";

export default function PrivacyPage() {
  return (
    <div className="bg-spotify-near-black px-6 pt-28 pb-24 sm:pt-32">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-[clamp(32px,4vw,48px)] font-black leading-tight tracking-tight text-white">
          개인정보처리방침
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
              수집하는 정보
            </h2>
            <p className="text-[15px] leading-relaxed text-spotify-silver">
              GitHub 계정으로 로그인할 때, 그리고 포트폴리오를 만들고 공개하는
              과정에서 아래 정보를 받습니다.
            </p>
            <dl className="mt-6 space-y-5">
              <div>
                <dt className="text-[15px] font-bold text-white">GitHub 계정 정보</dt>
                <dd className="mt-1.5 text-[15px] leading-relaxed text-spotify-silver">
                  이름, 이메일 주소, 프로필 이미지, GitHub 사용자명과 계정 번호,
                  프로필 소개(bio). 이메일을 비공개로 설정한 계정은 GitHub가
                  제공하는 대체 주소를 받습니다.
                </dd>
              </div>
              <div>
                <dt className="text-[15px] font-bold text-white">GitHub 액세스 토큰</dt>
                <dd className="mt-1.5 text-[15px] leading-relaxed text-spotify-silver">
                  저장소 정보를 계속 불러오기 위해 보관하며, 암호화해서 저장합니다.
                </dd>
              </div>
              <div>
                <dt className="text-[15px] font-bold text-white">공개 저장소 정보</dt>
                <dd className="mt-1.5 text-[15px] leading-relaxed text-spotify-silver">
                  저장소 이름, 설명, 사용 언어, 스타 수, 최근 업데이트 시각 등
                  공개된 메타데이터를 읽습니다.
                </dd>
              </div>
              <div>
                <dt className="text-[15px] font-bold text-white">포트폴리오 방문 기록</dt>
                <dd className="mt-1.5 text-[15px] leading-relaxed text-spotify-silver">
                  공개된 포트폴리오에 방문이 발생하면 세션 식별자, 유입 경로,
                  브라우저 정보, 국가 코드를 기록합니다. 방문자 개인을 특정하는
                  용도로는 쓰지 않습니다.
                </dd>
              </div>
            </dl>
          </section>

          <section>
            <h2 className="mb-4 text-[22px] font-black tracking-tight text-white">
              수집하지 않는 정보
            </h2>
            <ul className="space-y-2.5 text-[15px] leading-relaxed text-spotify-silver">
              <li>비공개 저장소의 내용</li>
              <li>소스 코드 자체. 저장소를 읽기만 하고 수정하지 않습니다</li>
              <li>GitHub 계정 비밀번호</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-[22px] font-black tracking-tight text-white">
              사용 목적
            </h2>
            <p className="text-[15px] leading-relaxed text-spotify-silver">
              받은 정보는 포트폴리오를 만들고, 커밋이 생겼을 때 최신 상태로
              유지하고, 공개된 포트폴리오의 방문 통계를 보여주는 데 씁니다.
              광고 목적으로 제3자에게 판매하거나 제공하지 않습니다.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-[22px] font-black tracking-tight text-white">
              보관과 삭제
            </h2>
            <p className="text-[15px] leading-relaxed text-spotify-silver">
              계정이 유지되는 동안 보관합니다. 화면에서 직접 계정을 삭제하는
              기능은 아직 준비 중이라, 지금은 문의를 주시면 계정과 모든
              포트폴리오 데이터를 완전히 삭제합니다.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-[22px] font-black tracking-tight text-white">
              문의
            </h2>
            <p className="text-[15px] leading-relaxed text-spotify-silver">
              개인정보 관련 문의나 삭제 요청은 아래로 연락해 주세요.
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
