/**
 * 대시보드 로딩 스켈레톤.
 * 실제 page.tsx의 공통 레이아웃(헤드라인 + 다음 한 가지 카드 + 포트폴리오 목록)과
 * Spotify 다크 토큰을 그대로 따라, 로드 완료 시 레이아웃이 튀지 않도록 맞춘다.
 * 4단계 여정 스트립은 첫 사용자 전용이라 스켈레톤에 넣지 않는다(재방문자 시프트 방지).
 */
export default function DashboardLoading() {
  return (
    <div
      className="max-w-7xl mx-auto py-8 sm:py-10 md:py-16 px-4 sm:px-6 flex flex-col gap-14 md:gap-16"
      aria-hidden="true"
    >
      {/* 상단: 여정 안내 + 다음 한 가지 + 동기화 상태 */}
      <div className="flex flex-col gap-6">
        <div className="max-w-3xl space-y-4">
          <div className="space-y-2">
            <div className="h-8 w-72 max-w-full rounded-lg bg-white/10 animate-pulse" />
            <div className="h-4 w-full max-w-md rounded-md bg-white/5 animate-pulse" />
          </div>

          {/* 다음 한 가지 카드 */}
          <div className="flex flex-col gap-3 rounded-2xl bg-spotify-dark-surface p-4 shadow-spotify-md sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="h-3 w-20 rounded-full bg-white/10 animate-pulse" />
              <div className="h-4 w-48 rounded-md bg-white/5 animate-pulse" />
            </div>
            <div className="h-10 w-full rounded-full bg-white/10 animate-pulse sm:w-32" />
          </div>
        </div>

        {/* GitHub 동기화 상태 바 */}
        <div className="h-10 w-64 max-w-full rounded-full bg-spotify-mid-dark animate-pulse" />
      </div>

      {/* 포트폴리오 목록 */}
      <div className="space-y-8">
        <div className="border-b border-white/5 pb-4">
          <div className="h-6 w-32 rounded-md bg-white/10 animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="flex flex-col min-h-[300px] rounded-2xl bg-spotify-dark-surface overflow-hidden shadow-spotify-md"
            >
              <div className="p-7 flex-1 flex flex-col gap-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2.5">
                    <div className="h-6 w-40 max-w-full rounded-md bg-white/10 animate-pulse" />
                    <div className="h-3 w-32 rounded bg-white/5 animate-pulse" />
                  </div>
                  <div className="h-6 w-16 rounded-full bg-white/10 animate-pulse" />
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-4">
                  <div className="h-3 w-20 rounded bg-white/5 animate-pulse" />
                  <div className="h-3 w-16 rounded bg-white/5 animate-pulse" />
                </div>
                <div className="h-1.5 w-full rounded-full bg-white/10 animate-pulse" />
              </div>

              {/* 하단 제어 도구 바 */}
              <div className="p-4 pt-0">
                <div className="h-14 rounded-full bg-spotify-near-black animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
