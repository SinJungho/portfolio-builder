# PortfolioForge — 기술 스택 및 아키텍처 레퍼런스 (GEMINI.md)

> AI 코딩 어시스턴트 및 개발자가 프로젝트 컨텍스트를 파악하기 위한 기술 문서입니다.  
> 기획 의도·페르소나·KPI는 [PLANNING.md](./PLANNING.md)를 참조하세요.

---

## 📋 목차

1. [기술 스택 전체 요약](#1-기술-스택-전체-요약)
2. [기술 의사결정 근거](#2-기술-의사결정-근거)
3. [인프라 아키텍처](#3-인프라-아키텍처)
4. [DB 스키마](#4-db-스키마)
5. [API 명세](#5-api-명세)
6. [에디터 없는 즉시 자동 생성·배포 플로우](#6-에디터-없는-즉시-자동-생성배포-플로우)
7. [디렉토리 구조 및 라우팅](#7-디렉토리-구조-및-라우팅)
8. [기술 리스크 및 대응 전략](#8-기술-리스크-및-대응-전략)
9. [월간 운영 비용 추정](#9-월간-운영-비용-추정)

---

## 1. 기술 스택 전체 요약

| 영역                 | 기술                         | 버전   | 선택 이유                                                   |
| -------------------- | ---------------------------- | ------ | ----------------------------------------------------------- |
| **Core**             | Next.js (App Router)         | 14+    | 프론트/백 단일 코드베이스, RSC·SSR·ISR 모두 활용            |
|                      | TypeScript                   | 5+     | 데이터 모델·API 응답 타입 안정성 확보                       |
|                      | Node.js                      | 18+    | Runtime                                                     |
| **UI**               | Tailwind CSS                 | 3+     | 유틸리티 퍼스트, 디자인 토큰 시스템과 자연스러운 통합       |
|                      | shadcn/ui                    | latest | 컴포넌트 소유권 확보 → 테마 시스템 구현 필수                |
|                      | Lucide React                 | latest | 아이콘                                                      |
| **상태 관리**        | TanStack Query               | 5+     | 서버 상태 캐싱·동기화                                       |
|                      | Zustand                      | 4+     | 생성 플로우 UI 상태, 클라이언트 전역 상태                   |
| **에디터 (Phase 2)** | dnd-kit                      | latest | 드래그앤드롭 블록 시스템, 가벼운 번들 크기. MVP 미포함      |
| **DB**               | PostgreSQL (Neon Serverless) | -      | Connection Pooling 자동 관리, Vercel 환경 최적화            |
| **ORM**              | Prisma                       | 5+     | TypeScript 타입 안정성, 스키마 변경 시 즉각 타입 체크       |
| **인증**             | NextAuth.js (Auth.js)        | v5     | GitHub OAuth 네이티브 지원, JWT/세션 전략 선택              |
| **캐시**             | Upstash Redis                | -      | GitHub API Rate Limit 대응, TTL 캐싱 + Rate Limiter         |
| **검증**             | Zod                          | 3+     | API 요청·환경변수 런타임 검증, discriminatedUnion 블록 검증 |
| **스토리지**         | Cloudflare R2                | -      | S3 호환 API, Egress 비용 무료                               |
| **AI**               | OpenAI API (GPT-4o-mini)     | -      | GPT-4o 대비 1/10 비용, README 요약·태깅 품질 충분           |
| **배포**             | Vercel                       | -      | Next.js 최적화, Edge Middleware, ISR 네이티브 지원          |
| **에러 모니터링**    | Sentry                       | -      | 무료 티어로 에러율 0.1% 미만 목표 관리                      |

> ✅ **MVP 아키텍처 원칙**:
>
> 1. dnd-kit 기반 WYSIWYG 에디터는 Phase 2로 이관.
> 2. MVP는 GitHub 데이터 + AI 분석으로 포트폴리오를 자동 생성하고 **즉시 배포**하는 **4단계 선형 플로우**로 구성.
> 3. 사용자는 생성 완료 후 URL을 바로 확인할 수 있으며, 이후 선택적으로 미세 조정을 진행할 수 있음.
> 4. 모든 조정은 on-demand revalidation으로 즉시 배포 페이지에 반영됨. "재배포" 버튼 없음.

---

## 2. 기술 의사결정 근거

### Why 에디터 없이 즉시 자동 배포?

GitHub 데이터는 이미 구조화되어 있고 public하게 공개된 정보입니다.

| GitHub 데이터     | 포트폴리오 요소   | 자동 매핑 방식                             |
| ----------------- | ----------------- | ------------------------------------------ |
| `bio`             | hero 소개 문구    | GPT-4o-mini로 채용 친화적 subheadline 변환 |
| `readme`          | 프로젝트 설명     | GPT-4o-mini로 2~3문장 요약                 |
| `package.json`    | 기술 스택         | 의존성 파싱 + 언어 분포 분석               |
| `stars / recency` | 프로젝트 우선순위 | ai_score 계산 → 상위 4개 자동 선택         |
| `email`           | contact 블록      | GitHub public email 자동 삽입              |

에디터를 추가하면 "내가 직접 고쳐야 한다"는 인식이 생겨 마찰이 증가하고 완료율이 낮아집니다.  
**AI가 합리적인 기본값을 결정하고, 배포 후 선택적으로 미세 조정**하는 것이 최적 UX입니다.

### Why GitHub bio 필수화?

PortfolioForge는 개발자 전용 플랫폼입니다. GitHub bio 미등록 상태는 온보딩 시작 전에 차단하고, bio 작성을 유도합니다.  
이렇게 하면 AI가 hero 블록 subheadline을 생성할 때 항상 실제 데이터를 기반으로 동작하며, 빈 placeholder 없이 완성도 높은 포트폴리오가 즉시 배포됩니다.

### Why shadcn/ui?

컴포넌트 코드를 직접 소유해 포트폴리오 테마 시스템 구현에 필수적입니다.  
Tailwind CSS와 완벽 통합되어 디자인 토큰 적용이 자연스럽고, 특정 버전에 종속되지 않습니다.

### Why Server Actions?

별도 API 엔드포인트 없이 폼 제출·데이터 업데이트 처리가 가능합니다.  
보일러플레이트 감소, CSRF 자동 방어, 타입 안전한 서버-클라이언트 통신을 제공합니다.

### Why Neon + Upstash?

둘 다 Serverless 특화입니다. Vercel의 Cold Start 환경에서 Connection Pooling 문제가 없으며, 모두 무료 티어로 시작 가능합니다.

### Why GPT-4o-mini?

GPT-4o 대비 1/10 비용으로 README 요약·기술 태깅 품질이 충분합니다.  
결과를 DB에 캐싱해 동일 레포 재분석 시 API 호출을 완전히 제거합니다.

### Why Cloudflare R2?

S3 호환 API로 마이그레이션 없이 전환 가능합니다. Egress 비용이 무료라 이미지 서빙 비용이 AWS S3 대비 대폭 절감됩니다.

### Why Prisma over Drizzle?

TypeScript 에코시스템 성숙도와 팀 협업 시 스키마 가독성을 우선합니다.  
성능이 중요해지는 시점에 Drizzle 마이그레이션을 검토합니다.

---

## 3. 인프라 아키텍처

```
┌─────────────────────────────────────────────────────┐
│                    USERS                            │
│            Browser / Mobile                         │
└──────────────────┬──────────────────────────────────┘
                   │ HTTPS
┌──────────────────▼──────────────────────────────────┐
│              VERCEL EDGE NETWORK                    │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │          Next.js 14 (App Router)             │  │
│  │                                              │  │
│  │  Server Components  │  Route Handlers        │  │
│  │  (RSC / ISR / SSR)  │  (REST API)            │  │
│  │                     │                        │  │
│  │  Edge Middleware ───┼── Auth 검증 (JWT)      │  │
│  │                     │── GitHub bio 검증      │  │
│  └──────────┬──────────┴──────────┬─────────────┘  │
└─────────────┼─────────────────────┼────────────────┘
              │                     │
   ┌──────────▼──────┐   ┌──────────▼──────────┐
   │  Neon PostgreSQL │   │   Upstash Redis     │
   │  (Serverless)   │   │                     │
   │                 │   │  - TTL 1h 캐싱      │
   │  - Auto Pooling │   │  - Rate Limiter     │
   └──────────────────┘   └─────────────────────┘

   External Services
   ─────────────────
   GitHub API ──── Webhook ──► /api/webhooks/github
   OpenAI API (GPT-4o-mini)
   Cloudflare R2 (이미지·에셋, S3 호환)
   Stripe (결제, Phase 2)
```

### 즉시 배포 데이터 흐름

```
생성 Job 완료
    │
    ├─ portfolio_blocks 저장 (Neon PostgreSQL)
    │
    ├─ portfolios.is_published = true (자동)
    │
    └─ POST /api/revalidate
         └─ revalidatePath('/[slug]')
              └─ {slug}.portfolioforge.app 즉시 접근 가능
```

---

## 4. DB 스키마

### 4.1 엔티티 관계 요약

| 테이블             | 핵심 컬럼                                                    | 설명                                                                                  |
| ------------------ | ------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| `users`            | `plan`, `ai_credits`, `github_bio_verified`                  | NextAuth 연동. `github_bio_verified`로 bio 확인 상태 관리. `plan(free/pro/team)`      |
| `integrations`     | `provider`, `access_token`                                   | GitHub·블로그 연동. `access_token`은 AES-256 암호화 저장 필수                         |
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
  plan                 VARCHAR(20) DEFAULT 'free',  -- free | pro | team
  plan_expires_at      TIMESTAMPTZ,
  ai_credits           INTEGER DEFAULT 3,           -- Free: 포트폴리오 자동 생성 월 3회, 월초 리셋
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
  custom_domain    TEXT,                     -- Pro 전용 (Phase 2)
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

/*
  config 예시 — hero (bio 기반 자동 생성):
  {
    "headline": "김개발",
    "subheadline": "Backend Engineer · TypeScript · Spring Boot",
    "bio": "5년차 풀스택 개발자, TypeScript와 Next.js 전문",  ← GitHub bio 원본 (항상 존재)
    "show_github_stats": true
  }

  config 예시 — project_grid:
  {
    "layout": "grid",
    "columns": 2,
    "project_ids": ["uuid1", "uuid2"],
    "show_tech_stack": true
  }

  config 예시 — skills:
  {
    "chart_type": "radar",
    "skills": [
      { "name": "TypeScript", "level": 90 },
      { "name": "Spring Boot", "level": 85 }
    ]
  }
*/

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
      subheadline: z.string().max(200), // AI 생성. GitHub bio 기반이므로 항상 존재
      bio: z.string().max(500), // GitHub bio 원문 (항상 존재 — bio 검증 통과 후 진입)
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
      email: z.string().email().optional(), // GitHub public email에서 자동 추출 시도. 없으면 optional
      linkedin_url: z.string().url().optional(),
      website_url: z.string().url().optional(),
    }),
  }),
]);

export type DesignTokens = z.infer<typeof DesignTokenSchema>;
export type BlockConfig = z.infer<typeof BlockConfigSchema>;
```

---

## 5. API 명세

모든 인증 필요 엔드포인트는 `Authorization: Bearer <session_token>` 헤더를 요구합니다.

### 5.1 GitHub bio 검증

```
GET /api/integrations/github/bio
```

GitHub API에서 bio를 조회해 존재 여부를 반환합니다. 로그인 직후 Edge Middleware에서 자동 호출.

| Response 200 | `{ bio: string, exists: true }`                                                            |
| ------------ | ------------------------------------------------------------------------------------------ |
| Response 200 | `{ bio: null, exists: false, github_settings_url: "https://github.com/settings/profile" }` |

---

### 5.2 GitHub 연동 및 동기화

```
POST /api/integrations/github/sync
```

| 항목         | 내용                                              |
| ------------ | ------------------------------------------------- |
| Auth         | Required                                          |
| Request      | `{ force?: boolean }` — `true` 시 Redis 캐시 무시 |
| Response 202 | `{ job_id: string, estimated_seconds: number }`   |

```
GET /api/integrations/github/sync/:job_id
```

폴링 간격: **3초**, 타임아웃: **120초**

| Response 200 | `{ status: 'pending' \| 'processing' \| 'completed' \| 'failed', progress: number, synced_count: number, error?: string }` |
| ------------ | -------------------------------------------------------------------------------------------------------------------------- |

---

### 5.3 포트폴리오 자동 생성 + 즉시 배포

#### 포트폴리오 레코드 사전 생성

```
POST /api/portfolios
```

| 항목         | 내용                                                                                                                     |
| ------------ | ------------------------------------------------------------------------------------------------------------------------ |
| Auth         | Required                                                                                                                 |
| Request      | `{ slug?: string, theme?: string }` — slug 생략 시 `github_login` 기반 자동 생성                                         |
| Response 201 | `{ portfolio_id: string, slug: string }` → 클라이언트가 `/generate/{portfolio_id}`로 이동                                |
| Response 403 | `{ error: 'plan_limit_exceeded', current_count: 1, limit: 1, upgrade_url: '/settings/billing' }` — Free 플랜 1개 초과 시 |

**slug 자동 생성 규칙**

- 기본값: `github_login` (예: `kimdev`)
- 동일 slug 존재 시 숫자 suffix 자동 부여: `kimdev-2`, `kimdev-3`, ...
- 사용자가 직접 지정할 경우: 영문 소문자·숫자·하이픈만 허용, 3~50자
- slug는 전체 사용자 기준 전역 유일 (`portfolios` 테이블 전체에서 UNIQUE)

**Free 플랜 포트폴리오 수 제한 강제**

```typescript
// POST /api/portfolios 내부 검증 로직
const existingCount = await prisma.portfolios.count({
  where: { user_id: userId },
});

if (user.plan === "free" && existingCount >= 1) {
  return Response.json(
    {
      error: "plan_limit_exceeded",
      current_count: existingCount,
      limit: 1,
      upgrade_url: "/settings/billing",
    },
    { status: 403 },
  );
}
```

> ℹ️ **Free 플랜 제한**: 포트폴리오 1개 초과 시 생성 불가. 대시보드에서 기존 포트폴리오 삭제 후 재생성하거나 Pro로 업그레이드 필요.

#### AI 자동 생성 + 즉시 배포 실행

```
POST /api/portfolios/generate
```

포트폴리오 ID에 해당하는 레코드에 GitHub 데이터 + bio 기반으로 블록 전체를 AI가 자동 구성하고,  
생성 완료 즉시 **is_published: true**로 자동 저장 후 on-demand revalidation을 트리거합니다.

| 항목         | 내용                                                                    |
| ------------ | ----------------------------------------------------------------------- |
| Auth         | Required                                                                |
| Request      | `{ portfolio_id: string, auto_publish?: boolean }` — 기본값: `true`     |
| Response 202 | `{ job_id: string, estimated_seconds: number }` — 비동기 처리           |
| Response 402 | `{ error: 'insufficient_credits', credits_remaining: 0 }` — 크레딧 소진 |

```
GET /api/portfolios/generate/:job_id
```

폴링 간격: **3초**, 타임아웃: **60초**

| Response 200 | `{ status, progress, blocks?, published_url?, missing_optional_fields?, error? }` |
| ------------ | --------------------------------------------------------------------------------- |

- `published_url`: 즉시 배포된 경우 `{slug}.portfolioforge.app` 포함
- `missing_optional_fields`: 미등록 선택 정보 목록 (예: `['email', 'linkedin_url']`) — 배포 후 미세 조정 화면에서 안내용으로 활용

> ✅ **즉시 배포 동작**: `auto_publish: true`(기본값)이면 `completed` 상태와 함께 `published_url`이 반환됩니다.  
> 사용자는 별도 배포 버튼 없이 URL을 즉시 확인할 수 있습니다.

---

### 5.4 프로젝트 관리

```
GET /api/projects
```

| Query           | 설명                             |
| --------------- | -------------------------------- |
| `page`, `limit` | 페이지네이션 (default: 20)       |
| `sort`          | `ai_score \| pushed_at \| stars` |
| `filter`        | `featured \| all`                |

```
POST /api/projects/:id/analyze
```

특정 프로젝트에 대해 AI 요약 및 태깅 개별 실행. `ai_summary`가 이미 캐싱된 경우 DB에서 반환하며 크레딧 미차감.

---

### 5.5 포트폴리오 CRUD

| Method   | Path                  | 설명                                         |
| -------- | --------------------- | -------------------------------------------- |
| `GET`    | `/api/portfolios`     | 포트폴리오 목록                              |
| `POST`   | `/api/portfolios`     | 포트폴리오 레코드 사전 생성                  |
| `PATCH`  | `/api/portfolios/:id` | 부분 업데이트 → **자동 revalidation 트리거** |
| `DELETE` | `/api/portfolios/:id` | 삭제                                         |

---

### 5.6 블록 관리 (미세 조정 — 변경 즉시 배포 반영)

| Method  | Path                                  | 설명                                                    |
| ------- | ------------------------------------- | ------------------------------------------------------- |
| `GET`   | `/api/portfolios/:id/blocks`          | 블록 목록                                               |
| `PATCH` | `/api/portfolios/:id/blocks/:blockId` | 블록 설정 수정 → **변경 즉시 revalidation 자동 트리거** |
| `PUT`   | `/api/portfolios/:id/blocks`          | 전체 순서 교체 → **변경 즉시 revalidation 자동 트리거** |

```typescript
// PATCH /api/portfolios/:id/blocks/:blockId
// 변경 즉시 배포 페이지에 반영됨. 별도 "재배포" 버튼 없음.
Request: {
  is_visible?: boolean;
  position?: number;
  config?: Partial<BlockConfig>;
}

// PUT /api/portfolios/:id/blocks
Request: {
  blocks: Array<{ id: string; position: number }>;
}
```

> ℹ️ **MVP에서 블록 직접 추가(`POST`)·삭제(`DELETE`)는 없음**  
> AI가 자동 생성한 블록의 표시 여부(`is_visible`)와 순서(`position`)만 조정 가능.  
> 블록 추가·삭제는 Phase 2 WYSIWYG 에디터 도입 시 함께 구현.

> 🔒 **`?step=adjust` 및 블록 API 소유권 검증**  
> `/generate/[id]?step=adjust` 페이지 진입 시: 서버 컴포넌트에서 `portfolio.user_id === session.user.id` 검증. 불일치 시 404 처리.  
> `PATCH /api/portfolios/:id/blocks/:blockId`, `PUT /api/portfolios/:id/blocks`, `PATCH /api/portfolios/:id` 호출 시: API Route Handler에서 동일 검증. 불일치 시 `403 { error: 'forbidden' }` 반환.

---

### 5.7 분석 API

```
POST /api/analytics/event
```

포트폴리오 방문자 이벤트 수집. **Auth 불필요** (공개 엔드포인트).

```typescript
Request: {
  portfolio_id: string;
  event_type:   'page_view' | 'block_click' | 'contact_click';
  block_id?:    string;
  session_id:   string;
}
```

```
GET /api/analytics/:portfolioId/summary?period=30d
```

본인 포트폴리오만 조회 가능. `period`: `7d | 30d | 90d`

---

## 6. 에디터 없는 즉시 자동 생성·배포 플로우

> MVP의 핵심 UX. GitHub 데이터 기반 자동 생성 → 즉시 배포의 4단계 선형 플로우.
> 검토는 필수 단계가 아닌 배포 후 선택적 조정입니다.

### 6.1 전체 플로우

```
[진입 — 대시보드에서 "새 포트폴리오 만들기" 클릭]
  └─ POST /api/portfolios → portfolio_id 발급
  └─ /generate/{portfolio_id} 로 이동

[Phase 01 — GitHub 연동 확인]
  └─ GitHub OAuth 완료 여부 확인
  └─ GET /api/integrations/github/bio
       ├─ bio 있음 → Phase 02 진행
       └─ bio 없음 → /onboarding/bio 리다이렉트
  └─ 레포 수집 트리거: POST /api/integrations/github/sync

[Phase 02 — AI 분석]
  └─ GET /api/integrations/github/sync/:job_id 폴링 (3초 간격, 최대 120초)
  └─ 레포별 README + package.json → GPT-4o-mini 분석 (ai_summary DB 캐싱)
  └─ ai_score 계산 → 상위 4개 자동 선택
  └─ 언어 분포 → skills 블록 데이터 생성
  └─ GitHub bio → hero 블록 subheadline 삽입

[Phase 03 — 포트폴리오 자동 생성 + 즉시 배포]
  └─ POST /api/portfolios/generate 호출 (ai_credits 1회 차감)
  └─ GET /api/portfolios/generate/:job_id 폴링 (3초 간격, 최대 60초)
  └─ 블록 자동 구성: hero → project_grid → skills → contact
  └─ blog_feed: RSS 연동 여부에 따라 선택적 추가
  └─ auto_publish: true → is_published: true 자동 저장
  └─ on-demand revalidation 자동 트리거
  └─ 완료 화면: {slug}.portfolioforge.app URL 발급
               + "미세 조정하기" 버튼 (선택)

[Phase 04 — 미세 조정: 선택 사항]
  └─ 진입 조건: 완료 화면에서 "미세 조정하기" 클릭 or /dashboard의 "미세 조정" 버튼
  └─ 크레딧 재차감 없음
  └─ 블록 ON/OFF 토글 (변경 즉시 배포 반영)
  └─ 블록 순서 조정 (변경 즉시 배포 반영)
  └─ 테마 선택 6종 (변경 즉시 배포 반영)
  └─ 선택적 보완: missing_optional_fields 인라인 카드 안내
  └─ "재배포" 버튼 없음 — 모든 변경이 자동 반영됨
```

### 6.2 즉시 배포가 가능한 기술적 근거

GitHub 데이터 품질 보장 조건:

| 조건                 | 보장 방법                                                                   |
| -------------------- | --------------------------------------------------------------------------- |
| bio 품질             | bio 미등록 시 온보딩에서 차단. 진입 시 bio 항상 존재                        |
| 프로젝트 품질        | fork 제외 + ai_score 기반 상위 4개 자동 선택                                |
| 요약 품질            | readme_quality 점수로 사전 필터링. README 없는 레포는 OpenAI 호출 없이 스킵 |
| 기술 스택 정확도     | package.json 파싱 + 언어 분포 집계 → 검증된 데이터                          |
| 연락처 정보          | GitHub public email 자동 삽입 (없으면 github_url만)                         |
| 레이아웃·디자인 품질 | 6개 프리셋 테마 중 기본값(`minimalist`) 자동 적용. 모두 WCAG 2.1 기준 충족  |

**readme_quality 점수 산정 기준** (ai_score 계산 전 사전 산출, OpenAI 호출 불필요)

| 조건                                | 점수 |
| ----------------------------------- | ---- |
| README 파일 없음                    | 0.0  |
| README 존재, 본문 300자 미만        | 0.3  |
| README 존재, 본문 300자 이상        | 0.6  |
| 300자 이상 + 이미지(`![`) 1개 이상  | +0.2 |
| 300자 이상 + 코드블록(` ``` `) 포함 | +0.1 |
| 최댓값 cap                          | 1.0  |

> ℹ️ `readme_quality = 0.0`인 레포는 ai_summary 생성을 건너뛰고 빈 문자열로 저장합니다.  
> 이로써 README 없는 레포에 대한 불필요한 OpenAI 호출을 원천 차단합니다.

→ 위 조건이 모두 충족되므로, 생성 완료 = 즉시 배포가 안전합니다.

### 6.3 GitHub bio 차단 및 재진입 플로우

```
로그인 완료
    │
    ▼
GET /api/integrations/github/bio
    │
    ├─ bio 있음 → 포트폴리오 생성 플로우 진행
    │
    └─ bio 없음 → /onboarding/bio
                      │
                      ├─ GitHub 설정 링크 안내
                      └─ "등록 완료했어요" 클릭
                              └─ bio 재확인
                                      ├─ 확인됨 → /dashboard
                                      └─ 미확인 → 안내 유지
```

### 6.4 폴링 UX 처리 상세

| 상태         | 화면 처리                                                     | 타임아웃     |
| ------------ | ------------------------------------------------------------- | ------------ |
| `pending`    | 스피너 + "분석 준비 중..."                                    | -            |
| `processing` | 진행률 바 + 단계별 메시지 (예: "레포지토리 분석 중... 23/57") | 120초 (sync) |
| `completed`  | 즉시 배포 완료 화면 — URL + "배포 URL 열기" + "미세 조정하기" | -            |
| `failed`     | 에러 메시지 + 재시도 버튼                                     | -            |
| 타임아웃     | "시간이 오래 걸리고 있어요" 안내 + 재시도 버튼                | 120초 / 60초 |

### 6.5 미리보기 렌더링 방식

iFrame 방식은 Next.js RSC와 충돌하므로 사용하지 않습니다.  
JSON state → 클라이언트 컴포넌트 직접 렌더링 방식으로 구현합니다.

```typescript
// 상태 흐름
portfolioStore (Zustand)
  ├── blocks: Block[]          // 현재 블록 목록 + is_visible 상태
  ├── theme: string            // 선택된 테마
  ├── designTokens: object     // 색상·폰트 설정
  ├── isPublished: boolean     // 배포 상태
  └── publishedUrl: string     // 배포된 URL

// 미세 조정 미리보기 컴포넌트
<PortfolioPreview
  blocks={blocks.filter(b => b.is_visible)}
  theme={theme}
  designTokens={designTokens}
/>
// ↑ Output Layer(/[slug])와 동일한 컴포넌트를 재사용 → 미리보기 = 실제 결과물 보장
// ↑ 변경 즉시 on-demand revalidation → 배포 페이지에도 자동 반영
```

### 6.6 자동 생성 + 즉시 배포 로직

```typescript
// POST /api/portfolios/generate 내부 로직 (의사 코드)

async function generatePortfolio(
  portfolioId: string,
  userId: string,
  autoPublish = true,
) {
  const user = await prisma.users.findUnique({ where: { id: userId } });
  // bio는 반드시 존재 (bio 검증 통과 후 진입 보장)

  const projects = await prisma.raw_projects.findMany({
    where: { user_id: userId, is_fork: false },
    orderBy: { ai_score: "desc" },
    take: 4,
  });
  const skills = extractSkillsFromProjects(projects);

  const blocks: Block[] = [
    {
      block_type: "hero",
      position: 0,
      config: {
        headline: user.name,
        subheadline: await generateSubheadline(user.github_bio, skills), // GPT-4o-mini
        bio: user.github_bio, // 항상 존재
        show_github_stats: true,
      },
      is_visible: true,
      is_ai_generated: true,
    },
    {
      block_type: "project_grid",
      position: 1,
      config: {
        layout: "grid",
        columns: 2,
        project_ids: projects.map((p) => p.id),
        show_tech_stack: true,
      },
      is_visible: true,
      is_ai_generated: true,
    },
    {
      block_type: "skills",
      position: 2,
      config: {
        chart_type: "radar",
        skills,
      },
      is_visible: true,
      is_ai_generated: true,
    },
    {
      block_type: "contact",
      position: 3,
      config: {
        github_url: `https://github.com/${user.github_login}`,
        email: user.email ?? undefined,
        linkedin_url: undefined,
      },
      is_visible: true,
      is_ai_generated: true,
    },
  ];

  // RSS 연동이 있으면 blog_feed 블록 추가
  const blogIntegration = await prisma.integrations.findFirst({
    where: {
      user_id: userId,
      provider: { in: ["tistory", "velog", "medium"] },
      is_active: true,
    },
  });
  if (blogIntegration) {
    blocks.push({
      block_type: "blog_feed",
      position: 4,
      config: {
        integration_provider: blogIntegration.provider,
        max_items: 3,
        show_thumbnail: true,
      },
      is_visible: true,
      is_ai_generated: true,
    });
  }

  // 블록 저장
  await prisma.portfolio_blocks.createMany({
    data: blocks.map((b) => ({ ...b, portfolio_id: portfolioId })),
  });

  // ✅ 즉시 배포 (auto_publish 기본값: true)
  if (autoPublish) {
    await prisma.portfolios.update({
      where: { id: portfolioId },
      data: {
        is_published: true,
        auto_published: true,
        published_at: new Date(),
      },
    });
    // on-demand revalidation 트리거
    await fetch("/api/revalidate", {
      method: "POST",
      body: JSON.stringify({ portfolioId }),
    });
  }

  // missing_optional_fields 계산 (배포 후 미세 조정 안내용)
  const missing: string[] = [];
  if (!user.email) missing.push("email");
  missing.push("linkedin_url", "website_url");

  const portfolio = await prisma.portfolios.findUnique({
    where: { id: portfolioId },
  });

  return {
    blocks,
    missing_optional_fields: missing,
    published_url: autoPublish ? `${portfolio.slug}.portfolioforge.app` : null,
  };
}
```

---

## 7. 디렉토리 구조 및 라우팅

### 7.1 서비스 레이어 구조

| 레이어       | 경로                         | 렌더링 전략          | 목적                                               |
| ------------ | ---------------------------- | -------------------- | -------------------------------------------------- |
| **Public**   | `/(marketing)`               | SSG + ISR            | 랜딩·프라이싱·SEO 최적화                           |
| **Auth**     | `/(auth)`                    | SSR                  | GitHub OAuth 로그인                                |
| **Onboard**  | `/onboarding`                | SSR                  | GitHub bio 차단 페이지 (bio 미등록 사용자)         |
| **App**      | `/(dashboard)`               | SSR + Client         | 포트폴리오 관리 작업 공간                          |
| **Generate** | `/generate/[id]`             | SSR + Client         | 4단계 자동 생성 + 즉시 배포 플로우 (전체화면)      |
| **Adjust**   | `/generate/[id]?step=adjust` | SSR + Client         | 배포 후 선택적 미세 조정 (전체화면, 크레딧 미차감) |
| **Output**   | `/[slug]`                    | ISR (60s revalidate) | 배포된 포트폴리오 공개 페이지                      |

### 7.2 App Router 디렉토리 구조

```
app/
├── (marketing)/               # [Public] 비로그인 사용자 대상
│   ├── layout.tsx
│   ├── page.tsx               # 서비스 메인 랜딩 (/)
│   └── pricing/
│
├── (auth)/                    # [Auth] 인증만 담당
│   └── login/
│
├── onboarding/                # [Onboard] GitHub bio 차단 플로우
│   └── bio/
│       └── page.tsx
│
├── (dashboard)/               # [App] 로그인 유저 작업 공간
│   ├── layout.tsx             # 사이드바 내비게이션 (대시보드 / 프로젝트 / 설정)
│   ├── dashboard/             # 포트폴리오 목록 + 미세 조정 / 배포 URL 버튼
│   ├── projects/              # GitHub 레포 관리 + AI 분석 현황
│   ├── analytics/[id]/        # 개별 포트폴리오 상세 분석 (Pro)
│   └── settings/
│       ├── page.tsx
│       ├── integrations/
│       └── billing/
│
├── generate/[id]/             # [Generate] 자동 생성 + 즉시 배포 플로우 (전체화면)
│   ├── layout.tsx             # 생성 전용 레이아웃 (사이드바 없음)
│   ├── page.tsx               # Phase 01~04 스텝 컨테이너
│   └── steps/
│       ├── connect.tsx        # Phase 01: GitHub 연동 확인 + bio 검증
│       ├── analyze.tsx        # Phase 02: AI 분석 진행 상황 (폴링 UI)
│       ├── generate.tsx       # Phase 03: 블록 자동 구성 + 즉시 배포 완료 화면
│       └── adjust.tsx         # Phase 04 (선택): 미세 조정 + 실시간 미리보기
│
├── [slug]/                    # [Output] 배포된 포트폴리오 공개 페이지
│   └── page.tsx               # ISR 렌더링
│
└── api/
    ├── auth/[...nextauth]/
    ├── integrations/github/
    │   ├── bio/
    │   ├── sync/
    │   └── sync/[job_id]/
    ├── portfolios/
    │   ├── generate/
    │   ├── generate/[job_id]/
    │   ├── [id]/
    │   │   └── blocks/        # PATCH·PUT 시 자동 revalidation
    │   └── route.ts
    ├── projects/
    ├── analytics/
    ├── revalidate/            # on-demand ISR (생성 완료 / 조정 변경 시 자동 호출)
    └── webhooks/github/
```

### 7.3 주요 페이지 명세

| 페이지           | 경로                         | 핵심 기능                                                         | 비고            |
| ---------------- | ---------------------------- | ----------------------------------------------------------------- | --------------- |
| 메인 랜딩        | `/`                          | Hero CTA ("연동하면 바로 배포"), 기능 소개, 테마 쇼케이스         | SSG + SEO       |
| bio 안내 페이지  | `/onboarding/bio`            | GitHub bio 미등록 안내, 설정 링크, 재확인 버튼                    | bio 없으면 진입 |
| 대시보드         | `/dashboard`                 | 포트폴리오 카드, "새 포트폴리오 만들기", "미세 조정", "배포 URL"  | 앱 홈           |
| 자동 생성 플로우 | `/generate/[id]`             | 4단계 플로우 (연동→분석→생성+즉시배포→완료). 전체화면             | MVP 핵심        |
| 미세 조정        | `/generate/[id]?step=adjust` | 블록 ON/OFF·순서·테마 조정. 변경 즉시 배포 반영. 재배포 버튼 없음 | 선택 사항       |
| 데이터 관리      | `/projects`                  | GitHub 레포 동기화 리스트, AI 분석 현황                           |                 |
| 통합 설정        | `/settings`                  | 프로필/계정, GitHub·RSS 연동, 플랜·결제 내역                      |                 |
| 분석 대시보드    | `/analytics/[id]`            | 일별 방문자, 블록 클릭률, 레퍼러, 전환율                          | Pro 전용        |
| 포트폴리오 출력  | `/[slug]`                    | ISR 렌더링, OG 이미지 자동 생성, 이벤트 수집                      | 60s revalidate  |

### 7.4 UI 일관성 원칙

- **컴포넌트 재사용**: Output Layer(`/[slug]`)와 미세 조정 미리보기(`?step=adjust`)는 동일 `<PortfolioPreview>` 컴포넌트 공유
- **즉시 반영 원칙**: 미세 조정에서 변경 → 즉시 revalidation → 배포 페이지 자동 반영. "재배포" 버튼 없음
- **반응형 전략**: 관리 페이지 모바일 전환 시 사이드바 → 하단 탭 메뉴 (shadcn/ui `Sheet` 활용)
- **생성 플로우 격리**: `/generate/[id]`는 별도 layout.tsx. 대시보드 사이드바 없음

---

## 8. 기술 리스크 및 대응 전략

### 🔴 Critical — MVP 전 반드시 해결

#### ① GitHub bio 미등록 사용자 이탈

| 항목       | 내용                                                                                                                   |
| ---------- | ---------------------------------------------------------------------------------------------------------------------- |
| **리스크** | 개발자 중에도 GitHub bio를 등록하지 않은 사용자가 상당수 존재. 차단 페이지에서 이탈률 발생 가능                        |
| **대응**   | 차단 페이지를 "포트폴리오를 더 잘 만들기 위한 준비 단계"로 프레이밍. GitHub 설정 직접 링크 + 작성 가이드 + 재확인 버튼 |

#### ② 즉시 배포 결과물 품질 보증

| 항목       | 내용                                                                                                                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **리스크** | 사용자 검토 없이 즉시 배포되므로 AI가 생성한 결과물이 기대에 미치지 못하면 신뢰도 하락 가능                                                                                                 |
| **대응**   | bio 필수화로 hero 품질 보장. fork 제외 + ai_score로 프로젝트 품질 보장. 6개 WCAG 기준 테마 프리셋으로 디자인 품질 보장. 생성 완료 화면에서 URL과 함께 "미세 조정하기" 버튼을 눈에 띄게 배치 |

#### ③ GitHub API Rate Limit

| 항목       | 내용                                                                                                                               |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **리스크** | OAuth 인증 시 시간당 5,000회 제한. 레포 100개 + 커밋 이력 수집 시 단일 사용자가 수십 회 소진. 온보딩 집중 시 서비스 전체 중단 가능 |
| **대응**   | 사용자 GitHub 토큰으로 요청 → Upstash Redis TTL 1시간 캐싱 → Webhook `push` 이벤트 시만 증분 업데이트                              |

#### ④ AI 비용 폭증

| 항목       | 내용                                                                                                                                |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **리스크** | GPT-4o-mini 레포 20개 요약 시 요청당 $0.02~0.05. Free Tier 사용자 1,000명 전수 실행 시 월 $20~50 발생. 무제한 허용 시 손익분기 붕괴 |
| **대응**   | Free Tier 포트폴리오 자동 생성 월 3회 제한 (`ai_credits`). `ai_summary` DB 캐싱 → 동일 레포 재분석 시 OpenAI 호출 없이 반환         |

---

### 🟡 Important — MVP 이후 반드시 고려

#### ⑤ 미리보기 실제 결과물 불일치

| 항목       | 내용                                                                                             |
| ---------- | ------------------------------------------------------------------------------------------------ |
| **리스크** | 미세 조정 미리보기와 실제 배포된 포트폴리오 디자인이 다르면 신뢰도 하락                          |
| **대응**   | `<PortfolioPreview>` 컴포넌트를 미리보기와 Output Layer가 공유. 조정 변경 즉시 revalidation 보장 |

#### ⑥ 커스텀 도메인 복잡도

| 항목       | 내용                                                                                                                       |
| ---------- | -------------------------------------------------------------------------------------------------------------------------- |
| **리스크** | Vercel Domains API로 수백 개 도메인을 동적 관리하려면 별도 서비스 레이어 필요. DNS 전파 지연·SSL 발급 시간 등 UX 문제 복합 |
| **대응**   | MVP는 서브도메인(`slug.portfolioforge.app`) 방식으로 출시. 커스텀 도메인은 Phase 2 Pro 기능으로 구현                       |

#### ⑦ ISR 캐시 무효화 타이밍

| 항목       | 내용                                                                                                                                            |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **리스크** | GitHub Webhook 업데이트는 최대 60초 지연. "즉시 배포" 마케팅 카피와 충돌 가능                                                                   |
| **대응**   | 생성 완료 및 미세 조정 변경은 on-demand revalidation으로 즉시 반영. GitHub Webhook에 의한 자동 업데이트만 "최대 60초 이내 반영"으로 명시적 고지 |

---

## 9. 월간 운영 비용 추정

> 기준: MAU 1,000명, Pro 전환율 5% 가정

| 항목     | 서비스             | 예상 비용        | 비고                        |
| -------- | ------------------ | ---------------- | --------------------------- |
| 호스팅   | Vercel Pro         | $20              |                             |
| DB       | Neon Serverless    | $0 ~ $19         | 무료 티어로 시작 가능       |
| 캐시     | Upstash Redis      | $0 ~ $10         | Rate Limiter 포함           |
| 스토리지 | Cloudflare R2      | $0 ~ $5          | Egress 무료                 |
| AI       | OpenAI (캐싱 적용) | $10 ~ $30        | 월 3회 제한 + 캐싱으로 절감 |
| **합계** |                    | **$30 ~ $84/월** |                             |

> 💡 **손익분기**: Pro ($8/월) 사용자 **11명** 전환 시 인프라 비용 전액 커버
