import { env } from "@/lib/env";
import chromium from "@sparticuz/chromium";
import { NextRequest, NextResponse } from "next/server";
import puppeteer, { Browser } from "puppeteer-core";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ error: "포트폴리오 식별자(Slug)가 필요합니다." }, { status: 400 });
  }

  let browser: Browser | null = null;

  try {
    // 1. 브라우저 실행 옵션 설정 (Vercel vs Local)
    const isLocal = process.env.NODE_ENV === "development";

    browser = await puppeteer.launch({
      args: isLocal ? [] : chromium.args,
      defaultViewport: null,
      executablePath: isLocal
        ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" // Mac 기준 경로, 개발 환경에 따라 자동 보완될 수 있음
        : await chromium.executablePath(),
      headless: true,
      acceptInsecureCerts: true,
    });

    const page = await browser.newPage();

    // 2. 포트폴리오 URL 결정
    // [slug].portfolioforge.app 형태가 아닌 /slug 형태로 접속하여 렌더링 (내부 서버에서 접근 용이)
    const baseUrl = env.NEXT_PUBLIC_APP_URL;
    const portfolioUrl = `${baseUrl}/${slug}?export=true`; // export=true 파라미터로 PDF 전용 스타일이 적용될 수 있도록 구성

    console.log(`[PDF_내보내기] 이동할 대상 URL: ${portfolioUrl}`);

    // 3. 페이지 이동 및 렌더링 대기
    await page.goto(portfolioUrl, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    // 폰트 로딩 대기 및 안정화 시간 추가
    await page.evaluateHandle("document.fonts.ready");
    await new Promise<void>((resolve) => setTimeout(resolve, 2000)); // 2초 추가 대기

    // 4. PDF 생성 옵션
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true, // 배경색 및 이미지 스타일 포함 여부
      margin: {
        top: "20px",
        bottom: "20px",
        left: "20px",
        right: "20px",
      },
    });

    // 5. 응답 반환
    const date = new Date().toISOString().split("T")[0];
    const filename = `${slug}_CV_${date}.pdf`;

    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: unknown) {
    console.error("[PDF_내보내기_오류]", error);
    return NextResponse.json(
      {
        error: "PDF 생성을 실패했습니다.",
        details: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
      },
      { status: 500 },
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
