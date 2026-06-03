import { env } from "@/lib/env";
import chromium from "@sparticuz/chromium";
import fs from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import puppeteer, { Browser } from "puppeteer-core";

/**
 * Chromium 실행 파일이 안전한 화이트리스트 디렉토리에 위치하고 실제 정규 파일인지 교차 검증합니다.
 * (심볼릭 링크 우회 공격 및 비권한 바이너리 실행 리스크 방어 - 로컬 & 프로덕션 통합 가드)
 */
function validateChromiumPath(filePath: string): boolean {
  try {
    if (!filePath) return false;

    if (!fs.existsSync(filePath)) return false;

    const stat = fs.lstatSync(filePath);
    if (stat.isSymbolicLink()) {
      console.error(
        `[PDF_내보내기_보안] 크롬 경로에서 심볼릭 링크가 감지되었습니다: ${filePath}`,
      );
      return false;
    }

    if (!stat.isFile()) return false;

    const fileStat = fs.statSync(filePath);
    const isWritableByOthers = (fileStat.mode & 0o002) !== 0;
    if (isWritableByOthers) {
      console.error(
        `[PDF_내보내기_보안] 실행이 거부됨: 크롬 바이너리에 타인 쓰기(Write) 권한이 허용되어 있어 신뢰할 수 없습니다.`,
      );
      return false;
    }

    const allowedEnv = process.env.ALLOWED_CHROMIUM_PREFIXES;
    if (!allowedEnv) {
      console.error(
        `[PDF_내보내기_보안] 실행이 차단됨: 인가 정책(ALLOWED_CHROMIUM_PREFIXES) 환경 변수가 구성되지 않았습니다.`,
      );
      return false;
    }

    const allowedPrefixes = allowedEnv.split(",").map((p) => p.trim());
    const normalizedPath = path.normalize(filePath);
    const pathForMatching = normalizedPath.replace(/\\/g, "/");

    const isAllowed = allowedPrefixes.some((prefix) => {
      const normalizedPrefix = path.normalize(prefix).replace(/\\/g, "/");
      return pathForMatching.startsWith(normalizedPrefix);
    });

    if (!isAllowed) {
      console.error(
        `[PDF_내보내기_보안] 실행이 차단되었습니다: 제공된 경로가 인가된 디렉토리 범위 하위에 위치하지 않습니다.`,
      );
      return false;
    }

    return true;
  } catch (e: unknown) {
    console.error(`[PDF_내보내기_보안] 크롬 경로 물리 검증 실패:`, e);
    return false;
  }
}

/**
 * 렌더링 타겟 URL의 호스트가 인가된 도메인(Localhost 또는 portfolioforge.app 대역)인지 검증합니다.
 * (사설망 자원 탈취 시도 및 외부 악성 도메인으로의 SSRF 리다이렉션 방어)
 */
function validateTargetUrl(targetUrl: string): boolean {
  try {
    const parsed = new URL(targetUrl);
    const host = parsed.hostname.toLowerCase();

    if (host === "localhost" || host === "127.0.0.1") {
      return true;
    }

    if (host === "portfolioforge.app" || host.endsWith(".portfolioforge.app")) {
      return true;
    }

    console.error(
      `[PDF_내보내기_보안] 인가되지 않은 대상 렌더링 호스트에 대한 접근 시도가 감지되었습니다: ${host}`,
    );
    return false;
  } catch {
    return false;
  }
}

/**
 * @summary 포트폴리오 페이지를 A4 규격의 PDF 이력서(CV) 문서로 변환하여 다운로드 스트림으로 반환합니다.
 *
 * @description
 * Vercel Serverless 환경의 50MB 용량 제한을 우회하기 위해 `@sparticuz/chromium` 바이너리를 활용하며,
 * 로컬 개발 환경과 프로덕션 환경의 OS 플랫폼 구분에 맞춰 Chrome 실행 파일을 동적으로 탐색합니다.
 * 렌더링 시 웹 폰트 누락 및 레이아웃 깨짐을 방지하기 위해 폰트 로드 완료 대기 및 추가 지연 시간을 가집니다.
 *
 * @route GET /api/export/pdf
 * @query {string} slug - 포트폴리오를 식별하기 위한 고유 주소(Slug)
 * @returns {NextResponse} application/pdf 바이너리 파일 다운로드 스트림
 * @throws {400} 포트폴리오 식별자(slug) 누락 및 유효하지 않은 특수 문자 포함(SSRF 방어) 시 반환
 * @throws {500} Chromium 인스턴스 기동 실패, 페이지 렌더링 타임아웃, PDF 변환 실패 시 반환
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");

  const slugRegex = /^[a-z0-9-]+$/i;
  if (!slug || !slugRegex.test(slug)) {
    return NextResponse.json(
      {
        error:
          "유효하지 않은 포트폴리오 식별자 형식입니다. (영문, 숫자, 하이픈만 허용)",
      },
      { status: 400 },
    );
  }

  let browser: Browser | null = null;

  try {
    const isLocal = process.env.NODE_ENV === "development";
    let executablePath = "";

    if (isLocal) {
      executablePath =
        process.env.LOCAL_CHROME_PATH ||
        process.env.PUPPETEER_EXECUTABLE_PATH ||
        "";
    } else {
      executablePath = await chromium.executablePath();
    }

    if (!executablePath || !validateChromiumPath(executablePath)) {
      console.warn(
        `[PDF_내보내기_보안] 유효한 크롬 실행 파일 검증을 실패했습니다: ${executablePath}.`,
      );
      throw new Error(
        "크롬 실행 파일을 기동할 수 없거나 보안 검증을 통과하지 못했습니다.",
      );
    }

    browser = await puppeteer.launch({
      args: isLocal ? [] : chromium.args,
      defaultViewport: null,
      executablePath,
      headless: true,
      acceptInsecureCerts: isLocal,
    });

    const page = await browser.newPage();

    const baseUrl = env.NEXT_PUBLIC_APP_URL;
    const portfolioUrl = `${baseUrl}/${slug}?export=true`;

    if (!validateTargetUrl(portfolioUrl)) {
      return NextResponse.json(
        { error: "보안 검증 실패: 허용되지 않은 렌더링 대상 주소입니다." },
        { status: 400 },
      );
    }

    console.log(
      `[PDF_내보내기] 대상 렌더링 URL이 생성되었습니다: ${portfolioUrl}`,
    );

    await page.goto(portfolioUrl, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    await page.evaluateHandle("document.fonts.ready");
    await new Promise<void>((resolve) => setTimeout(resolve, 2000));

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20px",
        bottom: "20px",
        left: "20px",
        right: "20px",
      },
    });

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
    console.error("[PDF_내보내기_실패]", error);
    return NextResponse.json(
      {
        error: "PDF 생성을 실패했습니다.",
        details:
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다.",
      },
      { status: 500 },
    );
  } finally {
    // 좀비 크롬 프로세스 잔존으로 인한 서버 리소스 커넥션 누수 및 OOM(Memory Leak) 방지
    if (browser) {
      await browser.close();
    }
  }
}
