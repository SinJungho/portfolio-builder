"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function Header() {
  const navigation = useRouter();
  const handleClick = () => {
    navigation.push("/editor");
  };
  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
      <div className="max-w-300 mx-auto px-6 h-18 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-linear-to-br from-indigo-500 to-purple-600 rounded-lg"></div>
          <span className="text-gray-900">포트폴리오포지</span>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-8">
          <Link
            href="/dashboard"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            대시보드
          </Link>
          <Link
            href="/editor"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            에디터
          </Link>
          <Link
            href="/analytics"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            통계
          </Link>
          <Link
            href="/setting"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            설정
          </Link>
          <button
            onClick={handleClick}
            className="bg-gray-900 text-white px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-all hover:shadow-lg"
          >
            시작하기
          </button>
        </nav>
      </div>
    </header>
  );
}
