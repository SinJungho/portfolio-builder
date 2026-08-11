import Image from "next/image";
import { Github } from "lucide-react";

interface ProfileSectionProps {
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
    githubLogin: string | null;
  };
}

/**
 * 프로필 섹션 — GitHub OAuth 세션의 실제 정보를 읽기 전용으로 보여준다.
 * 프로필 수정/삭제 백엔드가 아직 없으므로, 동작하지 않는 버튼 대신 정직한 안내만 둔다.
 */
export function ProfileSection({ user }: ProfileSectionProps) {
  const displayName = user.name ?? user.githubLogin ?? "이름 미설정";
  const initial = (user.name ?? user.email ?? "?").trim().charAt(0).toUpperCase();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">프로필</h2>
        <p className="mt-1.5 text-[13px] text-spotify-silver font-medium">
          GitHub 계정에서 가져온 정보예요. GitHub에서 수정하면 포지에도 반영돼요.
        </p>
      </div>

      <div className="bg-spotify-dark-surface p-7 rounded-lg border border-white/5 shadow-spotify-md">
        <div className="flex flex-col sm:flex-row items-center gap-7">
          <div className="w-24 h-24 rounded-full bg-spotify-mid-dark border-4 border-white/5 shadow-spotify-md overflow-hidden flex items-center justify-center shrink-0">
            {user.image ? (
              <Image
                src={user.image}
                alt=""
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white font-bold text-2xl">{initial}</span>
            )}
          </div>
          <div className="text-center sm:text-left min-w-0">
            <p className="text-[18px] font-bold text-white truncate">{displayName}</p>
            <p className="mt-1 text-[13px] text-spotify-silver truncate">
              {user.email ?? "이메일이 연결되어 있지 않아요"}
            </p>
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-[11px] font-bold text-spotify-silver">
              <Github className="w-3.5 h-3.5" aria-hidden="true" />
              GitHub 연동 계정
              {user.githubLogin ? ` · @${user.githubLogin}` : ""}
            </span>
          </div>
        </div>
      </div>

      {/* 계정 삭제 — 백엔드 미구현. 동작하지 않는 버튼 대신 정직한 안내. */}
      <div className="rounded-lg border border-white/5 bg-spotify-dark-surface p-6">
        <h3 className="text-[15px] font-bold text-white">계정 삭제</h3>
        <p className="mt-1.5 text-[13px] text-spotify-silver leading-relaxed">
          계정 삭제 기능은 아직 준비 중이에요. 지금 삭제가 필요하면 지원팀에 문의해
          주세요. 문의 주시면 계정과 모든 포트폴리오 데이터를 완전히 지워 드려요.
        </p>
      </div>
    </div>
  );
}
