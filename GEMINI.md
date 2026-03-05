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
6. [에디터 없는 자동 생성 플로우](#6-에디터-없는-자동-생성-플로우)
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

> ⚠️ **MVP 아키텍처 원칙**: dnd-kit 기반 WYSIWYG 에디터는 Phase 2로 이관.  
> MVP는 GitHub 데이터 + AI 분석으로 포트폴리오를 자동 생성하는 **5단계 선형 플로우**로 구성.  
> 사용자는 결과 검토 + 블록 ON/OFF 토글 + 순서 조정만 수행.

---

## 2. 기술 의사결정 근거

### Why 에디터 없는 자동 생성?

개발자 전용 포트폴리오 빌더라는 전제 하에, GitHub bio를 포함한 충분한 데이터가 이미 존재합니다.  
드래그앤드롭 에디터는 오히려 마찰을 유발합니다. AI가 블록 구성을 결정하고, 사용자는 **검토·보완·배포**만 수행하는 흐름이 핵심 차별점입니다.

### Why GitHub bio 필수화?

PortfolioForge는 개발자 전용 플랫폼입니다. GitHub bio 미등록 상태는 온보딩 시작 전에 차단하고, bio 작성을 유도합니다.  
이렇게 하면 AI가 hero 블록 subheadline을 생성할 때 항상 실제 데이터를 기반으로 동작하며, 빈 placeholder 없이 완성도 높은 포트폴리오가 자동 생성됩니다.

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

### 데이터 흐름

```mermaid
graph TD
    A[User Browser] --> B{Next.js App Router}

    B --> B1{GitHub bio 존재?}
    B1 -- 없음 --> B2[/onboarding/bio — bio 작성 유도]
    B1 -- 있음 --> C

    B --> C[Server Components / RSC]
    B --> D[Client Components]

    C --> E[Server Actions + Prisma]
    E --> F[(Neon PostgreSQL)]

    D --> G[Zustand — 생성 플로우 상태]
    D --> H[TanStack Query — Server State]
    H --> I[Route Handlers]
    I --> F

    C --> J[External APIs]
    J --> K[GitHub API]
    J --> L[OpenAI API]
    K --> M[(Upstash Redis — Cache)]
```

---

## 4. DB 스키마

### 4.1 엔티티 관계 요약

| 테이블             | 핵심 컬럼                                   | 설명                                                                                  |
| ------------------ | ------------------------------------------- | ------------------------------------------------------------------------------------- |
| `users`            | `plan`, `ai_credits`, `github_bio_verified` | NextAuth 연동. `github_bio_verified`로 bio 확인 상태 관리. `plan(free/pro/team)`      |
| `integrations`     | `provider`, `access_token`                  | GitHub·블로그 연동. `access_token`은 AES-256 암호화 저장 필수                         |
| `raw_projects`     | `ai_score`, `ai_summary`                    | GitHub 레포 원본 + AI 분석 결과. `UNIQUE(user_id, source, external_id)`               |
| `portfolios`       | `slug`, `design_tokens`, `generation_mode`  | 사용자당 복수 생성. `generation_mode: 'auto' \| 'custom'`                             |
| `portfolio_blocks` | `block_type`, `config`, `is_visible`        | 자동 생성 블록. `is_visible`로 ON/OFF 토글 관리. `is_ai_generated`으로 생성 출처 추적 |
| `analytics_events` | `event_type`, `session_id`                  | 경량 자체 애널리틱스. 월별 파티셔닝 권장                                              |
| `feed_items`       | `item_type`, `published_at`                 | RSS·블로그·알고리즘 피드 수집 결과 저장                                               |

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
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  slug            VARCHAR(100) NOT NULL,    -- URL 식별자
  title           VARCHAR(255),
  theme           VARCHAR(50) DEFAULT 'minimalist',
  design_tokens   JSONB,                    -- 색상·폰트·spacing 커스텀 값
  generation_mode VARCHAR(20) DEFAULT 'auto', -- auto(자동 생성) | custom(Phase 2 에디터)
  custom_domain   TEXT,                     -- Pro 전용 (Phase 2)
  is_published    BOOLEAN DEFAULT FALSE,
  seo_title       VARCHAR(255),
  seo_description TEXT,
  og_image_url    TEXT,
  view_count      INTEGER DEFAULT 0,
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
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

> ⚠️ **bio가 없는 경우**: 포트폴리오 생성 플로우를 차단하고 `/onboarding/bio` 페이지로 리다이렉트.  
> 해당 페이지에서 GitHub bio 등록 방법을 안내하고, "등록 완료했어요" 버튼으로 이 엔드포인트를 재호출.  
> bio가 확인되면 `/dashboard`로 이동.

---

### 5.2 GitHub 연동 및 동기화

```
POST /api/integrations/github/sync
```

GitHub 레포지토리 전체 수집 및 AI 점수 계산 트리거. 비동기 처리.

| 항목         | 내용                                              |
| ------------ | ------------------------------------------------- |
| Auth         | Required                                          |
| Request      | `{ force?: boolean }` — `true` 시 Redis 캐시 무시 |
| Response 202 | `{ job_id: string, estimated_seconds: number }`   |

```
GET /api/integrations/github/sync/:job_id
```

동기화 진행 상태 폴링. 클라이언트는 **3초 간격**으로 폴링하며, **120초 초과** 시 타임아웃으로 처리하고 재시도 버튼을 노출합니다.

| Response 200 | `{ status: 'pending' \| 'processing' \| 'completed' \| 'failed', progress: number, synced_count: number, error?: string }` |
| ------------ | -------------------------------------------------------------------------------------------------------------------------- |

> ⚠️ **UX 처리**: `processing` 상태 동안 단계별 진행 메시지 표시 (예: "레포지토리 수집 중... (23/57)").  
> `failed` 상태 수신 시 `error` 메시지와 함께 재시도 버튼 노출. 타임아웃(120초)도 동일하게 처리.

---

### 5.3 포트폴리오 자동 생성

#### 포트폴리오 레코드 사전 생성

`/generate/[id]` 경로 진입을 위해 대시보드에서 "새 포트폴리오 만들기" 버튼 클릭 시 포트폴리오 레코드를 먼저 생성합니다.

```
POST /api/portfolios
```

| 항목         | 내용                                                                        |
| ------------ | --------------------------------------------------------------------------- |
| Auth         | Required                                                                    |
| Request      | `{ slug: string, theme?: string }`                                          |
| Response 201 | `{ portfolio_id: string }` → 클라이언트가 `/generate/{portfolio_id}`로 이동 |

#### AI 자동 생성 실행

```
POST /api/portfolios/generate
```

포트폴리오 ID에 해당하는 레코드에 GitHub 데이터 + bio 기반으로 블록 전체를 AI가 자동 구성합니다.  
**`ai_credits` 1회 차감** (포트폴리오 생성 단위).

| 항목         | 내용                                                                    |
| ------------ | ----------------------------------------------------------------------- |
| Auth         | Required                                                                |
| Request      | `{ portfolio_id: string }`                                              |
| Response 202 | `{ job_id: string, estimated_seconds: number }` — 비동기 처리           |
| Response 402 | `{ error: 'insufficient_credits', credits_remaining: 0 }` — 크레딧 소진 |

```
GET /api/portfolios/generate/:job_id
```

생성 진행 상태 폴링. 클라이언트는 **3초 간격**으로 폴링하며, **60초 초과** 시 타임아웃 처리.

| Response 200 | `{ status: 'pending' \| 'processing' \| 'completed' \| 'failed', progress: number, blocks?: Block[], missing_optional_fields?: string[], error?: string }` |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |

`missing_optional_fields`는 자동 생성은 완료됐으나 미등록된 선택 정보 목록입니다 (예: `['email', 'linkedin_url']`).  
이 목록은 생성 완료 후 **Phase 04 검토 화면의 선택적 보완 섹션**에 표시됩니다.

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

특정 프로젝트에 대해 AI 요약 및 태깅 개별 실행. 이미 `ai_summary`가 캐싱된 경우 DB에서 반환하며 `ai_credits`를 차감하지 않습니다.

| Response 200 | `{ ai_summary, ai_tags, ai_score, credits_remaining }` |
| ------------ | ------------------------------------------------------ |

> ℹ️ **크레딧 정책**: `ai_credits`는 **포트폴리오 자동 생성 1회 단위**로 차감됩니다.  
> 개별 레포 분석(`/analyze`)은 캐시 미스 시에도 크레딧을 차감하지 않으며, 생성 시 일괄 처리됩니다.

---

### 5.5 포트폴리오 CRUD

| Method   | Path                  | 설명                                   |
| -------- | --------------------- | -------------------------------------- |
| `GET`    | `/api/portfolios`     | 포트폴리오 목록                        |
| `POST`   | `/api/portfolios`     | 포트폴리오 레코드 사전 생성 (5.3 참고) |
| `PATCH`  | `/api/portfolios/:id` | 부분 업데이트 (테마·slug 등 메타 정보) |
| `DELETE` | `/api/portfolios/:id` | 삭제                                   |

---

### 5.6 블록 관리

| Method  | Path                                  | 설명                                       |
| ------- | ------------------------------------- | ------------------------------------------ |
| `GET`   | `/api/portfolios/:id/blocks`          | 블록 목록                                  |
| `PATCH` | `/api/portfolios/:id/blocks/:blockId` | 블록 설정 수정 (is_visible, position 포함) |
| `PUT`   | `/api/portfolios/:id/blocks`          | 전체 순서 교체 (순서 조정 버튼 저장)       |

```typescript
// PATCH /api/portfolios/:id/blocks/:blockId — 블록 ON/OFF 토글 또는 설정 수정
Request: {
  is_visible?: boolean;
  position?: number;
  config?: Partial<BlockConfig>;
}

// PUT /api/portfolios/:id/blocks — 순서 조정 후 일괄 저장
Request: {
  blocks: Array<{ id: string; position: number }>;
}
```

> ℹ️ **MVP에서 블록 직접 추가(`POST`)·삭제(`DELETE`)는 없음**  
> AI가 자동 생성한 블록의 표시 여부(`is_visible`)와 순서(`position`)만 조정 가능.  
> 블록 추가·삭제는 Phase 2 WYSIWYG 에디터 도입 시 함께 구현.

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
  session_id:   string; // 클라이언트 생성 UUID
}
```

```
GET /api/analytics/:portfolioId/summary?period=30d
```

본인 포트폴리오만 조회 가능. `period`: `7d | 30d | 90d`

```typescript
Response 200: {
  total_views:      number;
  unique_sessions:  number;
  top_referrers:    Array<{ source: string; count: number }>;
  block_engagement: Array<{
    block_id:         string;
    block_type:       string;
    click_count:      number;
  }>;
  daily_views: Array<{ date: string; count: number }>;
}
```

---

## 6. 에디터 없는 자동 생성 플로우

> MVP의 핵심 UX. GitHub 데이터 기반 자동 생성 → 검토 → 배포의 5단계 선형 플로우.

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
                        └─ bio 등록 후 재확인 → /dashboard 이동 (생성 플로우 재시작)
  └─ 레포 수집 트리거: POST /api/integrations/github/sync

[Phase 02 — AI 분석]
  └─ GET /api/integrations/github/sync/:job_id 폴링 (3초 간격, 최대 120초)
  └─ 레포별 README + package.json → GPT-4o-mini 분석 (ai_summary DB 캐싱)
  └─ ai_score 계산 → 상위 4개 자동 선택
  └─ 언어 분포 → skills 블록 데이터 생성
  └─ GitHub bio → hero 블록 subheadline 삽입

[Phase 03 — 포트폴리오 초안 생성]
  └─ POST /api/portfolios/generate 호출 (ai_credits 1회 차감)
  └─ GET /api/portfolios/generate/:job_id 폴링 (3초 간격, 최대 60초)
  └─ 블록 자동 구성: hero → project_grid → skills → contact
  └─ blog_feed: RSS 연동 여부에 따라 선택적 추가
  └─ missing_optional_fields 계산 (email, linkedin_url 등)

[Phase 04 — 검토 및 선택적 보완]
  └─ 생성된 블록 목록 + 실시간 미리보기 표시
  └─ 블록 ON/OFF 토글 (PATCH is_visible)
  └─ 블록 순서 조정 (PUT position)
  └─ 테마 선택 (PATCH theme → 미리보기 즉시 반영)
  └─ 선택적 보완: missing_optional_fields 인라인 카드로 안내 (강제하지 않음)

[Phase 05 — 배포]
  └─ 배포 전 자동 체크리스트 (hero·project_grid 블록 존재 여부 등)
  └─ PATCH /api/portfolios/:id → { is_published: true }
  └─ on-demand ISR revalidation 트리거
  └─ 서브도메인 URL 발급: {slug}.portfolioforge.app
```

### 6.2 GitHub bio 차단 및 재진입 플로우

```
로그인 완료
    │
    ▼
GET /api/integrations/github/bio
    │
    ├─ bio 있음 ──────────────────────────────────────────┐
    │                                                     │
    └─ bio 없음 → /onboarding/bio                        │
                      │                                  │
                      ├─ GitHub 설정 링크 안내            │
                      │  (https://github.com/settings/profile)
                      │                                  │
                      └─ "등록 완료했어요" 클릭           │
                              │                          │
                              └─ bio 재확인              │
                                      │                  │
                                      ├─ 확인됨 ─────────┤
                                      └─ 미확인 → 안내 유지

    ▼ (bio 확인 완료)
포트폴리오 있음? ──── 있음 → /dashboard (기존 포트폴리오 목록)
    │
    └─ 없음 → /dashboard (신규 생성 CTA 강조 표시)
```

### 6.3 폴링 UX 처리 상세

비동기 Job이 수십 초 소요되므로 사용자 이탈을 막기 위한 UX가 중요합니다.

| 상태         | 화면 처리                                                     | 타임아웃     |
| ------------ | ------------------------------------------------------------- | ------------ |
| `pending`    | 스피너 + "분석 준비 중..."                                    | -            |
| `processing` | 진행률 바 + 단계별 메시지 (예: "레포지토리 분석 중... 23/57") | 120초 (sync) |
| `completed`  | 다음 Phase로 자동 이동                                        | -            |
| `failed`     | 에러 메시지 + 재시도 버튼                                     | -            |
| 타임아웃     | "시간이 오래 걸리고 있어요" 안내 + 재시도 버튼                | 120초 / 60초 |

### 6.4 미리보기 렌더링 방식

iFrame 방식은 Next.js RSC와 충돌하므로 사용하지 않습니다.  
JSON state → 클라이언트 컴포넌트 직접 렌더링 방식으로 구현합니다.

```typescript
// 상태 흐름
portfolioStore (Zustand)
  ├── blocks: Block[]          // 현재 블록 목록 + is_visible 상태
  ├── theme: string            // 선택된 테마
  └── designTokens: object     // 색상·폰트 설정

// 미리보기 컴포넌트
<PortfolioPreview
  blocks={blocks.filter(b => b.is_visible)}
  theme={theme}
  designTokens={designTokens}
/>
// ↑ Output Layer(/[slug])와 동일한 컴포넌트를 재사용 → 미리보기 = 실제 결과물 보장
```

### 6.5 자동 생성 블록 구성 로직

```typescript
// POST /api/portfolios/generate 내부 로직 (의사 코드)

async function generatePortfolio(portfolioId: string, userId: string) {
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
        email: user.email ?? undefined, // 있으면 자동 삽입
        linkedin_url: undefined, // 없으면 빈 상태 (선택적 보완 안내)
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

  // missing_optional_fields 계산
  const missing: string[] = [];
  if (!user.email) missing.push("email");
  // linkedin_url, website_url은 GitHub에서 수집 불가이므로 항상 안내 대상
  missing.push("linkedin_url", "website_url");

  return { blocks, missing_optional_fields: missing };
}
```

---

## 7. 디렉토리 구조 및 라우팅

### 7.1 서비스 레이어 구조

| 레이어       | 경로             | 렌더링 전략          | 목적                                       |
| ------------ | ---------------- | -------------------- | ------------------------------------------ |
| **Public**   | `/(marketing)`   | SSG + ISR            | 랜딩·프라이싱·SEO 최적화                   |
| **Auth**     | `/(auth)`        | SSR                  | GitHub OAuth 로그인                        |
| **Onboard**  | `/onboarding`    | SSR                  | GitHub bio 차단 페이지 (bio 미등록 사용자) |
| **App**      | `/(dashboard)`   | SSR + Client         | 포트폴리오 관리 작업 공간                  |
| **Generate** | `/generate/[id]` | SSR + Client         | 5단계 자동 생성 플로우 (전체화면)          |
| **Output**   | `/[slug]`        | ISR (60s revalidate) | 배포된 포트폴리오 공개 페이지              |

> ℹ️ **경로 변경 이력**: 기존 `(auth)/onboarding/` 경로를 최상위 `/onboarding/`으로 분리.  
> 이유: bio 차단은 인증(auth) 관심사가 아닌 온보딩 관심사이며, 이미 로그인된 사용자도 접근 가능해야 함.

### 7.2 App Router 디렉토리 구조

```
app/
├── (marketing)/               # [Public] 비로그인 사용자 대상
│   ├── layout.tsx             # 랜딩 전용 헤더/푸터
│   ├── page.tsx               # 서비스 메인 랜딩 (/)
│   └── pricing/               # 요금제 안내
│
├── (auth)/                    # [Auth] 인증만 담당 (온보딩 경로 제거됨)
│   └── login/                 # GitHub OAuth 소셜 로그인
│
├── onboarding/                # [Onboard] GitHub bio 차단 플로우 (최상위 경로)
│   └── bio/
│       └── page.tsx           # bio 미등록 안내 + GitHub 설정 링크 + 재확인 버튼
│
├── (dashboard)/               # [App] 로그인 유저 작업 공간
│   ├── layout.tsx             # 사이드바 내비게이션 공통 레이아웃
│   ├── dashboard/             # 포트폴리오 목록 + 요약 통계
│   ├── projects/              # GitHub 레포 관리 + AI 분석 현황
│   ├── analytics/[id]/        # 개별 포트폴리오 상세 분석 (Pro)
│   └── settings/
│       ├── page.tsx           # 프로필·계정 설정
│       ├── integrations/      # GitHub 토큰·RSS 피드 연동 관리
│       └── billing/           # 구독 플랜·결제 내역
│
├── generate/[id]/             # [Generate] 자동 생성 플로우 (전체화면)
│   ├── layout.tsx             # 생성 전용 레이아웃 (사이드바 없음)
│   ├── page.tsx               # Phase 01~05 스텝 컨테이너
│   └── steps/
│       ├── connect.tsx        # Phase 01: GitHub 연동 확인 + bio 검증
│       ├── analyze.tsx        # Phase 02: AI 분석 진행 상황 (폴링 UI)
│       ├── generate.tsx       # Phase 03: 블록 자동 구성 (폴링 UI)
│       ├── review.tsx         # Phase 04: 검토 + 선택적 보완 + 미리보기
│       └── publish.tsx        # Phase 05: 배포 + URL 발급
│
├── [slug]/                    # [Output] 배포된 포트폴리오 공개 페이지
│   └── page.tsx               # slug 기반 ISR 렌더링
│
└── api/
    ├── auth/[...nextauth]/    # NextAuth 핸들러
    ├── integrations/
    │   └── github/
    │       ├── bio/           # bio 검증 엔드포인트
    │       ├── sync/          # 레포 동기화 트리거
    │       └── sync/[job_id]/ # 동기화 진행 상태 폴링
    ├── portfolios/
    │   ├── generate/          # AI 자동 생성 트리거
    │   ├── generate/[job_id]/ # 생성 진행 상태 폴링
    │   ├── [id]/
    │   │   └── blocks/        # 블록 조회·수정·순서 변경 (추가·삭제는 Phase 2)
    │   └── route.ts           # 목록 조회·레코드 사전 생성
    ├── projects/              # 개별 레포 AI 분석 트리거
    ├── analytics/             # 이벤트 수집 + 집계
    ├── revalidate/            # on-demand ISR revalidation
    └── webhooks/github/       # Push 이벤트 증분 업데이트
```

### 7.3 주요 페이지 명세

| 페이지           | 경로              | 핵심 기능                                                        | 비고            |
| ---------------- | ----------------- | ---------------------------------------------------------------- | --------------- |
| 메인 랜딩        | `/`               | Hero CTA, 기능 소개, 테마 쇼케이스                               | SSG + SEO       |
| bio 안내 페이지  | `/onboarding/bio` | GitHub bio 미등록 안내, 설정 링크, 재확인 버튼                   | bio 없으면 진입 |
| 대시보드         | `/dashboard`      | 포트폴리오 카드 그리드, 방문자 현황, "새 포트폴리오 만들기" 버튼 | 앱 홈           |
| 자동 생성 플로우 | `/generate/[id]`  | 5단계 플로우 (연동→분석→생성→검토→배포). 전체화면                | MVP 핵심        |
| 데이터 관리      | `/projects`       | GitHub 레포 동기화 리스트, AI 분석 현황                          |                 |
| 통합 설정        | `/settings`       | 프로필/계정, GitHub·RSS 연동, 플랜·결제 내역                     | 공통 LNB 공유   |
| 분석 대시보드    | `/analytics/[id]` | 일별 방문자, 블록 클릭률, 레퍼러, 전환율                         | Pro 전용        |
| 포트폴리오 출력  | `/[slug]`         | ISR 렌더링, OG 이미지 자동 생성, 이벤트 수집                     | 60s revalidate  |

### 7.4 UI 일관성 원칙

- **컴포넌트 재사용**: Output Layer(`/[slug]`)와 생성 플로우 미리보기(`/generate/[id]` Phase 04)는 동일 `<PortfolioPreview>` 컴포넌트 공유 → 미리보기 = 실제 결과물 보장, 테마 변경도 양쪽 동시 반영
- **반응형 전략**: 관리 페이지 모바일 전환 시 사이드바 → 하단 탭 메뉴 (shadcn/ui `Sheet` 활용)
- **상태 동기화**: `settings/integrations` 변경 시 Zustand 즉시 업데이트 → `projects`·생성 플로우에 자동 반영
- **생성 플로우 격리**: `/generate/[id]`는 별도 layout.tsx. 대시보드 사이드바 없음. 단계 진행 표시 + 저장 상태만 상단 노출

---

## 8. 기술 리스크 및 대응 전략

### 🔴 Critical — MVP 전 반드시 해결

#### ① GitHub bio 미등록 사용자 이탈

| 항목       | 내용                                                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------------------------------------ |
| **리스크** | 개발자 중에도 GitHub bio를 등록하지 않은 사용자가 상당수 존재. 차단 페이지에서 이탈률 발생 가능                          |
| **대응**   | 차단 페이지를 최대한 친절하게 설계. GitHub 설정 페이지 직접 링크 + 작성 가이드 제공. 재확인 버튼으로 이탈 없이 복귀 유도 |

#### ② GitHub API Rate Limit

| 항목       | 내용                                                                                                                               |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **리스크** | OAuth 인증 시 시간당 5,000회 제한. 레포 100개 + 커밋 이력 수집 시 단일 사용자가 수십 회 소진. 온보딩 집중 시 서비스 전체 중단 가능 |
| **대응**   | 사용자 GitHub 토큰으로 요청 → Upstash Redis TTL 1시간 캐싱 → Webhook `push` 이벤트 시만 증분 업데이트                              |

#### ③ AI 비용 폭증

| 항목       | 내용                                                                                                                                |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **리스크** | GPT-4o-mini 레포 20개 요약 시 요청당 $0.02~0.05. Free Tier 사용자 1,000명 전수 실행 시 월 $20~50 발생. 무제한 허용 시 손익분기 붕괴 |
| **대응**   | Free Tier 포트폴리오 자동 생성 월 3회 제한 (`ai_credits`). `ai_summary` DB 캐싱 → 동일 레포 재분석 시 OpenAI 호출 없이 반환         |

---

### 🟡 Important — MVP 이후 반드시 고려

#### ④ 미리보기 실제 결과물 불일치

| 항목       | 내용                                                                                                  |
| ---------- | ----------------------------------------------------------------------------------------------------- |
| **리스크** | 생성 플로우 미리보기와 실제 배포된 포트폴리오 디자인이 다르면 신뢰도 하락                             |
| **대응**   | `<PortfolioPreview>` 컴포넌트를 미리보기와 Output Layer가 공유. 테마·토큰 변경 시 양쪽 동시 반영 보장 |

#### ⑤ 커스텀 도메인 복잡도

| 항목       | 내용                                                                                                                       |
| ---------- | -------------------------------------------------------------------------------------------------------------------------- |
| **리스크** | Vercel Domains API로 수백 개 도메인을 동적 관리하려면 별도 서비스 레이어 필요. DNS 전파 지연·SSL 발급 시간 등 UX 문제 복합 |
| **대응**   | MVP는 서브도메인(`slug.portfolioforge.app`) 방식으로 출시. 커스텀 도메인은 Phase 2 Pro 기능으로 구현                       |

#### ⑥ ISR 캐시 무효화 타이밍

| 항목       | 내용                                                                                                           |
| ---------- | -------------------------------------------------------------------------------------------------------------- |
| **리스크** | 포트폴리오 업데이트 후 반영까지 최대 60초 지연. "실시간 반영" 마케팅 카피와 충돌 가능                          |
| **대응**   | "변경 후 최대 60초 이내 반영" 명시적 고지. 배포 시 `/api/revalidate` on-demand revalidation으로 즉시 반영 처리 |

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
