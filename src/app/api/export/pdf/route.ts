import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import { env } from "@/lib/env";

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
      defaultViewport: chromium.defaultViewport,
      executablePath: isLocal 
        ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" // Mac 기준 경로, 환경에 따라 수정 필요할 수 있음
        : await chromium.executablePath(),
      headless: isLocal ? true : (chromium.headless as any),
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();

    // 2. 포트폴리오 URL 결정
    // [slug].portfolioforge.app 형태가 아닌 /slug 형태로 접속하여 렌더링 (내부 서버에서 접근 용이)
    const baseUrl = env.NEXT_PUBLIC_APP_URL;
    const portfolioUrl = `${baseUrl}/${slug}?export=true`; // export=true 파라미터로 PDF 전용 스타일 적용 가능하도록

    console.log(`[PDF_EXPORT] Navigating to: ${portfolioUrl}`);

    // 3. 페이지 이동 및 렌더링 대기
    await page.goto(portfolioUrl, {
      waitUntil: "networkidle0", // 네트워크 활동이 없을 때까지 대기
      timeout: 30000,
    });

    // 4. PDF 생성 옵션
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true, // 배경색/이미지 포함
      margin: {
        top: "20px",
        bottom: "20px",
        left: "20px",
        right: "20px",
      },
    });

    // 5. 응답 반환
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${slug}_portfolio.pdf"`,
      },
    });

  } catch (error: any) {
    console.error("[PDF_EXPORT_ERROR]", error);
    return NextResponse.json(
      { error: "PDF 생성을 실패했습니다.", details: error.message },
      { status: 500 }
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
