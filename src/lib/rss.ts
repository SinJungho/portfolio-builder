import Parser from "rss-parser";

const parser = new Parser({
  customFields: {
    item: [["content:encoded", "contentEncoded"]],
  },
});

export interface RSSFeedItem {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  snippet: string;
  thumbnail: string | null;
}

/**
 * 블로그 RSS 피드를 파싱하여 표준화된 데이터형식으로 반환합니다.
 * @param url RSS 피드 URL
 * @returns 파싱된 피드 아이템 배열
 */
export async function parseBlogRSS(url: string): Promise<RSSFeedItem[]> {
  try {
    const feed = await parser.parseURL(url);
    
    return feed.items.map((item) => {
      // 1. 이미지 추출 (content:encoded 또는 description에서 첫 번째 img 태그)
      const itemAny = item as any;
      const content = itemAny.contentEncoded || itemAny.content || itemAny.description || "";
      const thumbnailMatches = content.match(/<img[^>]+src="([^">]+)"/);
      const thumbnail = thumbnailMatches ? thumbnailMatches[1] : null;

      // 2. 스니펫 가공 (HTML 태그 제거 및 길이 조절)
      const plainText = content
        .replace(/<[^>]*>?/gm, " ")
        .replace(/\s+/g, " ")
        .trim();
      const snippet = plainText.substring(0, 160) + (plainText.length > 160 ? "..." : "");

      return {
        id: item.guid || item.link || Math.random().toString(36).substring(7),
        title: item.title || "제목 없는 포스트",
        link: item.link || "",
        pubDate: item.pubDate || new Date().toISOString(),
        snippet,
        thumbnail,
      };
    });
  } catch (error) {
    console.error(`[RSS_PARSER_ERROR] Failed to parse URL: ${url}`, error);
    throw new Error("블로그 피드를 불러오는데 실패했습니다. URL을 확인해 주세요.");
  }
}

/**
 * 입력된 블로그 URL로부터 예상되는 RSS 주소를 추론하거나 검증합니다.
 * @param url 사용자가 입력한 블로그 주소
 * @returns 검증된 RSS URL (또는 에러)
 */
export function resolveRSSUrl(url: string): string {
  let cleanUrl = url.trim().replace(/\/$/, ""); // 마지막 슬래시 제거

  // Velog 처리 (v2.velog.io/rss/@username 또는 velog.io/@username)
  if (cleanUrl.includes("velog.io")) {
    const usernameMatch = cleanUrl.match(/@([^/]+)/);
    if (usernameMatch) {
      return `https://v2.velog.io/rss/@${usernameMatch[1]}`;
    }
  }

  // Tistory 처리 (username.tistory.com -> username.tistory.com/rss)
  if (cleanUrl.includes("tistory.com")) {
    if (!cleanUrl.endsWith("/rss")) {
      return `${cleanUrl}/rss`;
    }
  }

  // 이미 RSS 주소인 경우 그대로 반환
  if (cleanUrl.endsWith("/rss") || cleanUrl.endsWith(".xml")) {
    return cleanUrl;
  }

  // 기본적으로 뒤에 /rss를 붙여 시도
  return `${cleanUrl}/rss`;
}
