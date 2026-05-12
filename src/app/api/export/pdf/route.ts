import { env } from "@/lib/env";
import chromium from "@sparticuz/chromium";
import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer-core";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ error: "Slug is required" }, { status: 400 });
  }

  let browser = null;

  try {
    // 1. 브라우저 실행 옵션 설정 (Vercel vs Local)
    const isLocal = process.env.NODE_ENV === "development";

    browser = await puppeteer.launch({
      args: isLocal ? [] : chromium.args,
      defaultViewport: null,
      executablePath: isLocal
        ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" // Mac 기준 경로, 환경에 따라 수정 필요할 수 있음
        : await chromium.executablePath(),
      headless: true,
      acceptInsecureCerts: true,
    });

    const page = await browser.newPage();
    
    // 뷰포트 크기 고정 (레이아웃 안정화)
    await page.setViewport({ width: 1100, height: 1600 });

    // 2. 포트폴리오 URL 결정
    // [slug].portfolioforge.app 형태가 아닌 /slug 형태로 접속하여 렌더링 (내부 서버에서 접근 용이)
    const baseUrl = env.NEXT_PUBLIC_APP_URL;
    const portfolioUrl = `${baseUrl}/${slug}?export=true`; // export=true 파라미터로 PDF 전용 스타일 적용 가능하도록

    console.log(`[PDF_EXPORT] Navigating to: ${portfolioUrl}`);

    // 3. 페이지 이동 및 렌더링 대기
    await page.goto(portfolioUrl, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    // 인쇄 모드 에뮬레이션
    await page.emulateMediaType('print');

    // 모든 이미지 로드를 위해 바닥까지 스크롤 (Lazy Loading 대응)
    await page.evaluate(async () => {
      await new Promise<void>((resolve) => {
        let totalHeight = 0;
        const distance = 100;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });

    // 폰트 로딩 대기 및 최종 안정화
    await page.evaluateHandle("document.fonts.ready");
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 4. PDF 생성 옵션
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true, // 배경색/이미지 포함
      preferCSSPageSize: true,
      margin: {
        top: "10mm",
        bottom: "10mm",
        left: "10mm",
        right: "10mm",
      },
    });

    // 5. 응답 반환
    const date = new Date().toISOString().split('T')[0];
    const filename = `${slug}_CV_${date}.pdf`;

    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error("[PDF_EXPORT_ERROR]", error);
    return NextResponse.json(
      { error: "PDF 생성을 실패했습니다.", details: error.message },
      { status: 500 },
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
