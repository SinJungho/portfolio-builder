import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import chromium from "@sparticuz/chromium";
import fs from "fs";
import { NextRequest, NextResponse } from "next/server";
import os from "os";
import path from "path";
import puppeteer, { Browser } from "puppeteer-core";
import { apiError, logRouteError } from "@/lib/api/errors";

/**
 * 허용된 디렉토리의 실제 Chromium 실행 파일인지 검증한다.
 */
function validateChromiumPath(filePath: string, allowedPrefixes: string[]): boolean {
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

    if (allowedPrefixes.length === 0) {
      console.error(
        `[PDF_내보내기_보안] 실행이 차단됨: 허용된 Chromium 경로가 구성되지 않았습니다.`,
      );
      return false;
    }

    const isAllowed = allowedPrefixes.some((prefix) => {
      const relative = path.relative(path.resolve(prefix), path.resolve(filePath));
      return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
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
 * 렌더링 대상이 허용된 호스트인지 검증한다.
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

/** 포트폴리오 페이지를 A4 PDF로 변환한다. */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");

  const slugRegex = /^[a-z0-9-]+$/i;
  if (!slug || slug.length > 50 || !slugRegex.test(slug)) {
    return apiError("PDF_INVALID_SLUG", 400);
  }

  let browser: Browser | null = null;

  try {
    const portfolio = await prisma.portfolio.findFirst({
      where: { slug: { equals: slug, mode: "insensitive" }, is_published: true },
      select: { id: true },
    });
    if (!portfolio) return apiError("NOT_FOUND", 404);

    const portfolioUrl = `${env.NEXT_PUBLIC_APP_URL}/${slug}?export=true`;
    if (!validateTargetUrl(portfolioUrl)) {
      return apiError("PDF_SECURITY", 400);
    }

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

    const allowedPrefixes = isLocal
      ? (process.env.ALLOWED_CHROMIUM_PREFIXES || "")
          .split(",")
          .map((prefix) => prefix.trim())
          .filter(Boolean)
      : [os.tmpdir()];
    if (!executablePath || !validateChromiumPath(executablePath, allowedPrefixes)) {
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

    console.log(
      `[PDF_내보내기] 대상 렌더링 URL이 생성되었습니다: ${portfolioUrl}`,
    );

    const response = await page.goto(portfolioUrl, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });
    if (!response?.ok()) {
      throw new Error(
        `포트폴리오 렌더링 응답이 올바르지 않습니다 (${response?.status() ?? "응답 없음"}).`,
      );
    }

    await page.evaluate(async () => {
      await document.fonts.ready;
    });
    await page.emulateMediaType("print");

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
    });

    const date = new Date().toISOString().split("T")[0];
    const filename = `${slug}_CV_${date}.pdf`;

    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error: unknown) {
    logRouteError('/api/export/pdf', 'GET', error);
    return apiError("PDF_FAILED", 500);
  } finally {
    // Chromium을 종료해 프로세스와 리소스를 정리한다.
    if (browser) {
      try {
        await browser.close();
      } catch (error) {
        logRouteError("/api/export/pdf", "CLOSE", error);
      }
    }
  }
}
