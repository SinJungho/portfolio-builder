import AuthProvider from "@/components/providers/AuthProvider";
import QueryProvider from "@/components/providers/QueryProvider";
import { Toaster } from "@/components/ui/sonner";
import "@/styles/globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans } from "next/font/google";

const notoSans = Noto_Sans({ variable: "--font-sans", subsets: ["latin"] });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
<<<<<<< HEAD
  title: "포트폴리오포지 — GitHub를 1분 만에 포트폴리오로",
  description: "개발자의 GitHub를 아름다운 포트폴리오로 자동 변환하는 AI 빌더",
=======
  title: "PortfolioForge | AI 기반 포트폴리오 자동 생성",
  description: "GitHub 데이터를 분석하여 나만의 프리미엄 포트폴리오를 1분 만에 완성하세요.",
>>>>>>> 4c43e06 (feat: 대시보드 페이지 생성, root layout의 header, footer 제거 후 별개 layout 페이지 생성)
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={notoSans.variable}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}
      >
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
