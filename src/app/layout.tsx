import AuthProvider from "@/components/providers/AuthProvider";
import QueryProvider from "@/components/providers/QueryProvider";
import { Toaster } from "@/components/ui/sonner";
// 본문 서체. 동적 서브셋이라 브라우저가 실제로 쓰는 글자 구간만 내려받는다
// (전체 가변 폰트 하나는 2MB, 서브셋은 파일당 ~34KB).
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "@/styles/globals.css";
import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PortfolioForge | GitHub로 만드는 개발자 포트폴리오",
  description:
    "GitHub 활동을 채용 담당자가 읽기 좋은 포트폴리오로 만들어요. 한 번 연결하면 커밋할 때마다 알아서 최신으로 유지돼요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${geistMono.variable} antialiased`}>
        <AuthProvider>
          <QueryProvider>
            {children}
            <Toaster position="top-center" richColors />
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
