## 4. DB 스키마

### 4.1 엔티티 관계 요약

| 테이블             | 핵심 컬럼                                                    | 설명                                                                                  |
| ------------------ | ------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| `users`            | `github_bio_verified`, `github_login`                        | NextAuth 연동. `github_bio_verified`로 bio 확인 상태 관리.                            |
| `raw_projects`     | `ai_score`, `ai_summary`                                     | GitHub 레포 원본 + AI 분석 결과. `UNIQUE(user_id, source, external_id)`               |
| `portfolios`       | `slug`, `design_tokens`, `generation_mode`, `auto_published` | 사용자당 복수 생성. `auto_published`: 즉시 배포 여부 추적                             |
| `portfolio_blocks` | `block_type`, `config`, `is_visible`                         | 자동 생성 블록. `is_visible`로 ON/OFF 토글 관리. `is_ai_generated`으로 생성 출처 추적 |
| `analytics_events` | `event_type`, `session_id`                                   | 경량 자체 애널리틱스. 월별 파티셔닝 권장                                              |
| `feed_items`       | `item_type`, `published_at`                                  | RSS·블로그·알고리즘 피드 수집 결과 저장                                               |

### 4.2 전체 스키마 (PostgreSQL)

```sql
-- 1. 사용자 계정 (NextAuth 연동)
CREATE TABLE users (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email                VARCHAR(255) UNIQUE NOT NULL,
  name                 VARCHAR(100),
  avatar_url           TEXT,
  github_login         VARCHAR(100) UNIQUE,
  github_id            BIGINT UNIQUE,
  github_bio           TEXT,                        -- GitHub bio 캐싱 (필수 항목)
  github_bio_verified  BOOLEAN DEFAULT FALSE,       -- bio 확인 완료 여부
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 연동된 데이터 소스
CREATE TABLE integrations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  provider      VARCHAR(50) NOT NULL,       -- github | tistory | velog | baekjoon
  access_token  TEXT,                       -- AES-256 암호화 저장 필수
  refresh_token TEXT,
  metadata      JSONB,                      -- provider별 추가 정보
  synced_at     TIMESTAMPTZ,
  is_active     BOOLEAN DEFAULT TRUE,
  UNIQUE(user_id, provider)
);

-- 3. 수집된 원본 프로젝트 데이터
CREATE TABLE raw_projects (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES users(id) ON DELETE CASCADE,
  source           VARCHAR(50) NOT NULL,    -- github | manual
  external_id      VARCHAR(255),           -- GitHub repo id 등
  name             VARCHAR(255) NOT NULL,
  description      TEXT,
  html_url         TEXT,
  language         VARCHAR(100),
  topics           TEXT[],
  stargazers_count INTEGER DEFAULT 0,
  forks_count      INTEGER DEFAULT 0,
  is_fork          BOOLEAN DEFAULT FALSE,
  pushed_at        TIMESTAMPTZ,
  raw_data         JSONB,                  -- API 원본 응답 보관
  ai_summary       TEXT,                   -- AI 생성 요약 (캐싱)
  ai_tags          TEXT[],                 -- AI 추출 기술 태그
  ai_score         FLOAT,                  -- 큐레이션 우선순위 점수 (0~1)
  is_featured      BOOLEAN DEFAULT FALSE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, source, external_id)
);

-- 4. 포트폴리오 (복수 생성 가능)
CREATE TABLE portfolios (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES users(id) ON DELETE CASCADE,
  slug             VARCHAR(100) NOT NULL,    -- URL 식별자
  title            VARCHAR(255),
  theme            VARCHAR(50) DEFAULT 'minimalist',
  design_tokens    JSONB,                    -- 색상·폰트·spacing 커스텀 값
  generation_mode  VARCHAR(20) DEFAULT 'auto', -- auto(자동 생성) | custom(Phase 2 에디터)
  auto_published   BOOLEAN DEFAULT TRUE,     -- 즉시 배포 여부 (기본값 true)
  custom_domain    TEXT,                     -- 커스텀 도메인 (Phase 2)
  is_published     BOOLEAN DEFAULT FALSE,
  seo_title        VARCHAR(255),
  seo_description  TEXT,
  og_image_url     TEXT,
  view_count       INTEGER DEFAULT 0,
  published_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, slug)
);

-- 5. 포트폴리오 블록 (자동 생성 + 사용자 ON/OFF)
CREATE TABLE portfolio_blocks (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id     UUID REFERENCES portfolios(id) ON DELETE CASCADE,
  block_type       VARCHAR(50) NOT NULL,      -- hero | project_grid | skills | blog_feed | contact
  position         INTEGER NOT NULL,
  config           JSONB NOT NULL,            -- block_type별 설정값 (Zod로 검증)
  is_visible       BOOLEAN DEFAULT TRUE,      -- 사용자가 토글로 ON/OFF
  is_ai_generated  BOOLEAN DEFAULT TRUE,      -- AI 자동 생성 여부 (생성 출처 추적용)
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- 6. 방문자 분석 이벤트 (경량 자체 애널리틱스)
CREATE TABLE analytics_events (
  id           BIGSERIAL PRIMARY KEY,
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
  event_type   VARCHAR(50) NOT NULL,  -- page_view | block_click | contact_click
  block_id     UUID,
  session_id   VARCHAR(100),
  referrer     TEXT,
  user_agent   TEXT,
  country_code VARCHAR(10),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analytics_portfolio_date
  ON analytics_events(portfolio_id, created_at DESC);

-- 7. 외부 콘텐츠 피드 (블로그·알고리즘)
CREATE TABLE feed_items (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES users(id) ON DELETE CASCADE,
  integration_id UUID REFERENCES integrations(id) ON DELETE CASCADE,
  item_type      VARCHAR(50),  -- blog_post | solved_problem
  title          VARCHAR(500),
  url            TEXT,
  published_at   TIMESTAMPTZ,
  metadata       JSONB,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.3 Zod 블록 검증 스키마

```typescript
// src/schemas/portfolio.ts

export const DesignTokenSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i),
  fontFamily: z.enum(["inter", "pretendard", "fira-code", "playfair"]),
  borderRadius: z.enum(["none", "sm", "md", "lg", "full"]),
  spacing: z.enum(["compact", "normal", "relaxed"]),
});

export const BlockConfigSchema = z.discriminatedUnion("block_type", [
  z.object({
    block_type: z.literal("hero"),
    config: z.object({
      headline: z.string().max(100),
      subheadline: z.string().max(200),
      bio: z.string().max(500),
      show_github_stats: z.boolean().default(true),
    }),
  }),
  z.object({
    block_type: z.literal("project_grid"),
    config: z.object({
      layout: z.enum(["grid", "list", "masonry"]),
      columns: z.number().min(1).max(3),
      project_ids: z.array(z.string().uuid()).max(10),
      show_tech_stack: z.boolean(),
    }),
  }),
  z.object({
    block_type: z.literal("skills"),
    config: z.object({
      chart_type: z.enum(["radar", "bar", "tag_cloud"]),
      skills: z
        .array(
          z.object({
            name: z.string(),
            level: z.number().min(0).max(100),
          }),
        )
        .max(20),
    }),
  }),
  z.object({
    block_type: z.literal("blog_feed"),
    config: z.object({
      integration_provider: z.enum([
        "tistory",
        "velog",
        "medium",
        "custom_rss",
      ]),
      max_items: z.number().min(1).max(6),
      show_thumbnail: z.boolean(),
    }),
  }),
  z.object({
    block_type: z.literal("contact"),
    config: z.object({
      github_url: z.string().url(),
      email: z.string().email().optional(),
      linkedin_url: z.string().url().optional(),
      website_url: z.string().url().optional(),
    }),
  }),
]);

export type DesignTokens = z.infer<typeof DesignTokenSchema>;
export type BlockConfig = z.infer<typeof BlockConfigSchema>;
```

---