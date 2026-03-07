import Footer from "@/components/layouts/Footer";
import Header from "@/components/layouts/Header";
import AuthProvider from "@/components/providers/AuthProvider";
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
  title: "포트폴리오포지 — GitHub를 1분 만에 포트폴리오로",
  description: "개발자의 GitHub를 아름다운 포트폴리오로 자동 변환하는 AI 빌더",
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
          <Header />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
