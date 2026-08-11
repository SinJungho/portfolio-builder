-- 중복 custom_domain 정리: 가장 최근 갱신본만 남기고 나머지는 연결 해제.
-- 이전 POST /api/domains에는 중복 검사가 없어 같은 도메인이 여러 포트폴리오에 남아 있을 수 있다.
UPDATE "portfolios" p
SET "custom_domain" = NULL
WHERE p."custom_domain" IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM "portfolios" q
    WHERE q."custom_domain" = p."custom_domain"
      AND (q."updated_at", q."id") > (p."updated_at", p."id")
  );

-- slug 소문자 정규화.
-- portfolios_slug_key(평문 UNIQUE)가 행 단위로 검사되므로 두 단계로 나눈다.
-- 1) 소문자화하면 충돌하는 행을 먼저 id 앞자리를 붙여 밀어낸다.
WITH ranked AS (
  SELECT
    "id",
    LOWER("slug") AS lowered,
    ROW_NUMBER() OVER (PARTITION BY LOWER("slug") ORDER BY "created_at", "id") AS rn
  FROM "portfolios"
)
UPDATE "portfolios" p
SET "slug" = r.lowered || '-' || SUBSTRING(p."id"::text FROM 1 FOR 8)
FROM ranked r
WHERE p."id" = r."id" AND r.rn > 1;

-- 2) 그룹마다 하나씩 남은 행만 소문자로 내린다.
UPDATE "portfolios" SET "slug" = LOWER("slug") WHERE "slug" <> LOWER("slug");

CREATE UNIQUE INDEX "portfolios_custom_domain_key" ON "portfolios"("custom_domain");
CREATE UNIQUE INDEX "portfolios_slug_lower_key" ON "portfolios"(LOWER("slug"));
