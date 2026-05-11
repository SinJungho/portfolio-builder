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
10. [개발 원칙 및 커밋 규칙](#10-개발-원칙-및-커밋-규칙)

---

## 1. 기술 스택 전체 요약

| 영역                 | 기술                         | 버전   | 선택 이유                                                   |
| -------------------- | ---------------------------- | ------ | ----------------------------------------------------------- |
| **Core**             | Next.js (App Router)         | **16** | 프론트/백 단일 코드베이스, RSC·SSR·ISR 모두 활용            |
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
│  │          Next.js 16 (App Router)             │  │
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

## 5. API 명세

모든 인증 필요 엔드포인트는 `Authorization: Bearer <session_token>` 헤더를 요구합니다.

### 5.1 GitHub bio 검증

```
GET /api/integrations/github/bio
```

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

```
POST /api/portfolios
```

| 항목         | 내용                                     |
| ------------ | ---------------------------------------- |
| Auth         | Required                                 |
| Request      | `{ slug?: string, theme?: string }`      |
| Response 201 | `{ portfolio_id: string, slug: string }` |

```
POST /api/portfolios/generate
```

| 항목         | 내용                                                                |
| ------------ | ------------------------------------------------------------------- |
| Auth         | Required                                                            |
| Request      | `{ portfolio_id: string, auto_publish?: boolean }` — 기본값: `true` |
| Response 202 | `{ job_id: string, estimated_seconds: number }`                     |

```
GET /api/portfolios/generate/:job_id
```

폴링 간격: **3초**, 타임아웃: **60초**

| Response 200 | `{ status, progress, blocks?, published_url?, missing_optional_fields?, error? }` |
| ------------ | --------------------------------------------------------------------------------- |

---

### 5.4 프로젝트 관리

```
GET  /api/projects
POST /api/projects/:id/analyze
```

---

### 5.5 포트폴리오 CRUD

| Method   | Path                  | 설명                                         |
| -------- | --------------------- | -------------------------------------------- |
| `GET`    | `/api/portfolios`     | 포트폴리오 목록                              |
| `POST`   | `/api/portfolios`     | 포트폴리오 레코드 사전 생성                  |
| `PATCH`  | `/api/portfolios/:id` | 부분 업데이트 → **자동 revalidation 트리거** |
| `DELETE` | `/api/portfolios/:id` | 삭제                                         |

---

### 5.6 블록 관리

| Method  | Path                                  | 설명                               |
| ------- | ------------------------------------- | ---------------------------------- |
| `GET`   | `/api/portfolios/:id/blocks`          | 블록 목록                          |
| `PATCH` | `/api/portfolios/:id/blocks/:blockId` | 블록 설정 수정 → 즉시 revalidation |
| `PUT`   | `/api/portfolios/:id/blocks`          | 전체 순서 교체 → 즉시 revalidation |

---

### 5.7 분석 API

```
POST /api/analytics/event          ← Auth 불필요 (공개 엔드포인트)
GET  /api/analytics/:portfolioId/summary?period=7d|30d|90d
```

---

## 6. 에디터 없는 즉시 자동 생성·배포 플로우

### 6.1 전체 플로우

```
[Phase 01 — GitHub 연동 확인]
  └─ GET /api/integrations/github/bio
       ├─ bio 있음 → Phase 02 진행
       └─ bio 없음 → /onboarding/bio 리다이렉트

[Phase 02 — AI 분석]
  └─ POST /api/integrations/github/sync → 폴링 (3초, 최대 120초)
  └─ GPT-4o-mini: ai_summary 생성 + ai_score 계산

[Phase 03 — 포트폴리오 자동 생성 + 즉시 배포]
  └─ POST /api/portfolios/generate → 폴링 (3초, 최대 60초)
  └─ auto_publish: true → is_published: true + revalidation
  └─ 완료 화면: {slug}.portfolioforge.app URL 발급

[Phase 04 — 미세 조정: 선택 사항]
  └─ 블록 ON/OFF·순서·테마 조정 → 즉시 배포 반영
  └─ "재배포" 버튼 없음
```

### 6.2 readme_quality 점수 산정

| 조건                                | 점수 |
| ----------------------------------- | ---- |
| README 파일 없음                    | 0.0  |
| README 존재, 본문 300자 미만        | 0.3  |
| README 존재, 본문 300자 이상        | 0.6  |
| 300자 이상 + 이미지(`![`) 1개 이상  | +0.2 |
| 300자 이상 + 코드블록(` ``` `) 포함 | +0.1 |
| 최댓값 cap                          | 1.0  |

### 6.3 미리보기 렌더링 방식

iFrame 방식은 Next.js RSC와 충돌하므로 사용하지 않습니다.

```typescript
// Output Layer(/[slug])와 동일한 컴포넌트 재사용
<PortfolioPreview
  blocks={blocks.filter(b => b.is_visible)}
  theme={theme}
  designTokens={designTokens}
/>
```

---

## 7. 디렉토리 구조 및 라우팅

### 7.1 서비스 레이어 구조

| 레이어       | 경로                         | 렌더링 전략          | 목적                               |
| ------------ | ---------------------------- | -------------------- | ---------------------------------- |
| **Public**   | `/(marketing)`               | SSG + ISR            | 랜딩·프라이싱·SEO 최적화           |
| **Auth**     | `/(auth)`                    | SSR                  | GitHub OAuth 로그인                |
| **Onboard**  | `/onboarding`                | SSR                  | GitHub bio 차단 페이지             |
| **App**      | `/(dashboard)`               | SSR + Client         | 포트폴리오 관리 작업 공간          |
| **Generate** | `/generate/[id]`             | SSR + Client         | 4단계 자동 생성 + 즉시 배포 플로우 |
| **Adjust**   | `/generate/[id]?step=adjust` | SSR + Client         | 배포 후 선택적 미세 조정           |
| **Output**   | `/[slug]`                    | ISR (60s revalidate) | 배포된 포트폴리오 공개 페이지      |

### 7.2 App Router 디렉토리 구조

```
app/
├── (marketing)/
├── (auth)/
├── onboarding/bio/
├── (dashboard)/
│   ├── dashboard/
│   ├── projects/
│   ├── analytics/[id]/
│   └── settings/
├── generate/[id]/
│   ├── layout.tsx
│   ├── page.tsx
│   └── steps/
│       ├── connect.tsx
│       ├── analyze.tsx
│       ├── generate.tsx
│       └── adjust.tsx
├── [slug]/
│   └── page.tsx
└── api/
    ├── auth/[...nextauth]/
    ├── integrations/github/
    ├── portfolios/
    ├── projects/
    ├── analytics/
    ├── revalidate/
    └── webhooks/github/
```

---

## 8. 기술 리스크 및 대응 전략

### 🔴 Critical

| 리스크                   | 대응                                                                   |
| ------------------------ | ---------------------------------------------------------------------- |
| GitHub bio 미등록 사용자 | 차단 페이지를 "준비 단계"로 프레이밍 + GitHub 설정 링크 + 재확인 버튼  |
| 즉시 배포 결과물 품질    | bio 필수화 + ai_score 큐레이션 + WCAG 기준 테마 + "미세 조정하기" 버튼 |
| GitHub API Rate Limit    | 사용자 토큰 요청 + Redis TTL 1h 캐싱 + Webhook 증분 업데이트           |
| AI 비용 폭증             | Free Tier 월 3회 제한 + ai_summary DB 캐싱                             |

### 🟡 Important

| 리스크                      | 대응                                                                  |
| --------------------------- | --------------------------------------------------------------------- |
| 미리보기 실제 결과물 불일치 | `<PortfolioPreview>` 컴포넌트 공유 + 조정 즉시 revalidation           |
| 커스텀 도메인 복잡도        | MVP는 서브도메인 방식. 커스텀 도메인은 Phase 2                        |
| ISR 캐시 무효화 타이밍      | 생성·조정은 on-demand revalidation. Webhook 업데이트만 60초 지연 고지 |

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

---

## 10. 개발 원칙 및 커밋 규칙

### 10.1 Next.js 16 필수 문법 규칙

> ⚠️ Next.js 16부터 `params`, `searchParams`, `cookies()`, `headers()`가 모두 **비동기(Promise)** 로 변경되었습니다.  
> 구버전 문법을 사용하면 빌드가 실패하므로, 아래 패턴을 반드시 준수합니다.

#### Page / Layout — params와 searchParams를 반드시 await

```typescript
// ✅ Next.js 16 올바른 문법
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ step?: string }>;
}) {
  const { slug } = await params;
  const { step } = await searchParams;
}

// ❌ 구버전 문법 — 빌드 에러 발생
export default async function Page({ params }: { params: { slug: string } }) {
  const { slug } = params; // 금지
}
```

#### Route Handler — params를 반드시 await

```typescript
// ✅ Next.js 16
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
}

// ❌ 구버전 문법
export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  const { id } = params; // 금지
}
```

#### next/headers — 반드시 await

```typescript
// ✅ Next.js 16
import { cookies, headers } from "next/headers";

const cookieStore = await cookies();
const headersList = await headers();

// ❌ 구버전 문법
const cookieStore = cookies(); // 금지
```

#### generateMetadata — params를 반드시 await

```typescript
// ✅ Next.js 16
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return { title: slug };
}
```

#### 기타 필수 준수 사항

| 항목           | 올바른 방법                                   | 금지          |
| -------------- | --------------------------------------------- | ------------- |
| 라우터 훅      | `import { useRouter } from "next/navigation"` | `next/router` |
| 리다이렉트     | `import { redirect } from "next/navigation"`  | 직접 구현     |
| 404 처리       | `import { notFound } from "next/navigation"`  | 직접 구현     |
| Image 컴포넌트 | `sizes` prop 반드시 지정                      | sizes 생략    |
| Server Actions | 파일 최상단 또는 함수 내 `"use server"` 명시  | 생략          |
| Font           | `display: 'swap'` 명시                        | 생략          |

---

### 10.2 빌드 및 린트 검사 규칙

> ✅ **Task 단위 구현이 완료될 때마다 반드시 아래 순서로 실행하고, 두 명령 모두 성공한 후에만 커밋합니다.**

```bash
# 1단계: ESLint 정적 분석
# 문법 오류, 미사용 변수, import 순서, Next.js 16 호환성 경고 등 검출
npm run lint

# 2단계: TypeScript 컴파일 + Next.js 전체 빌드 검사
# lint보다 엄격하게 타입 불일치, params await 누락, 빌드 오류 등 검출
npm run build

# 두 명령을 한 번에 실행 (권장)
npm run lint && npm run build
```

#### 에러 유형별 처리 규칙

| 에러 유형                    | 처리 방법                                            |
| ---------------------------- | ---------------------------------------------------- |
| ESLint warning               | 즉시 수정. `eslint-disable` 주석으로 억제 금지       |
| ESLint error                 | 반드시 수정. `// eslint-disable-next-line` 사용 금지 |
| TypeScript 타입 에러         | `any` 캐스팅으로 우회 금지. 올바른 타입으로 해결     |
| Next.js 16 params await 누락 | 즉시 `await params` 패턴으로 수정                    |
| 빌드 에러                    | 에러 전문을 확인하고 수정 완료 후 재빌드 확인        |

> ⚠️ `npm run lint` 또는 `npm run build` 가 실패한 상태로 커밋하는 것은 **절대 금지**합니다.

---

### 10.3 Git 커밋 규칙

> 💡 **AI 어시스턴트 필수 규칙**: 모든 개발 작업은 `task.md`에 정의된 단위 작업(Task)별로 수행하며, 하나의 Task가 완료되면 반드시 아래의 **[승인 후 커밋 절차]**를 준수합니다.

#### [승인 후 커밋 절차]

1.  **검증**: `npm run lint && npm run build`를 실행하여 오류가 없음을 확인합니다.
2.  **보고**: `walkthrough.md`를 생성하여 작업 내용을 사용자에게 요약 보고하고 **"작업 결과물을 검토하고 승인(Accept)하시겠습니까?"**라고 명시적으로 묻습니다.
3.  **승인 대기**: 사용자가 코드 수정 사항을 모두 확인하고 **승인(Accept) 의사**를 밝힐 때까지 대기합니다. (승인은 사용자가 제안된 변경 사항을 자신의 코드베이스에 최종적으로 적용하고 수용했음을 의미합니다.)
4.  **커밋 실행**: 사용자의 승인이 완료된 **직후**, 해당 Task에 유효한 범위의 파일을 스테이징하고 Conventional Commits 규격에 맞춰 커밋을 수행합니다.

#### 커밋 타이밍 — 사용자의 최종 승인 직후 수행

| 완료 시점                          | 커밋 여부               |
| ---------------------------------- | ----------------------- |
| API 엔드포인트 1개 구현 완료       | ✅ 커밋                 |
| 컴포넌트 1개 구현 완료             | ✅ 커밋                 |
| DB 스키마 / 마이그레이션 변경 완료 | ✅ 커밋                 |
| 버그 수정 완료                     | ✅ 커밋                 |
| lint / build 에러 수정 중 (미완료) | ❌ 커밋 안 함           |
| 여러 Task를 하나로 묶어서 커밋     | ❌ 금지 — Task별로 분리 |

#### 커밋 메시지 형식 (Conventional Commits)

```
<type>(<scope>): <설명>

[본문 — 선택. 변경 이유나 주요 내용 기술]
[푸터 — 선택. 관련 이슈 번호]
```

#### type 목록

| type       | 사용 시점                                  |
| ---------- | ------------------------------------------ |
| `feat`     | 새 기능 추가                               |
| `fix`      | 버그 수정                                  |
| `refactor` | 동작 변화 없는 코드 구조 개선              |
| `chore`    | 빌드 설정, 패키지, 환경변수 등 비코드 변경 |
| `docs`     | 주석, README, 문서 변경                    |
| `style`    | 포맷팅, 세미콜론 등 로직 무관 변경         |
| `test`     | 테스트 추가 또는 수정                      |
| `perf`     | 성능 개선                                  |

#### scope 목록 (PortfolioForge 전용)

| scope       | 해당 영역                     |
| ----------- | ----------------------------- |
| `github`    | GitHub 연동, 동기화, bio 검증 |
| `portfolio` | 포트폴리오 생성, 배포, CRUD   |
| `block`     | 포트폴리오 블록 관리          |
| `ai`        | OpenAI 분석, 요약, 스코어     |
| `auth`      | NextAuth, 세션, 인증          |
| `analytics` | 방문자 이벤트, 통계           |
| `theme`     | 디자인 토큰, 테마             |
| `db`        | Prisma 스키마, 마이그레이션   |
| `api`       | Route Handler 공통            |
| `ui`        | 공유 컴포넌트, 레이아웃       |
| `infra`     | 배포, 환경변수, Next.js 설정  |

#### 커밋 예시

```bash
# 새 기능
git commit -m "feat(github): GitHub bio 검증 API 및 미등록 차단 플로우 구현"

# 버그 수정
git commit -m "fix(portfolio): 포트폴리오 생성 완료 후 revalidation 누락 수정"

# Next.js 16 마이그레이션
git commit -m "refactor(infra): Next.js 16 params await 패턴으로 전체 마이그레이션"

# DB 변경
git commit -m "chore(db): analytics_events 테이블 월별 파티셔닝 인덱스 추가"

# 빌드 에러 수정
git commit -m "fix(infra): next/headers cookies() await 누락으로 인한 빌드 에러 수정"
```

#### 커밋 전 필수 체크리스트

```bash
npm run lint   # ✅ 에러 0개 확인
npm run build  # ✅ 빌드 성공 확인

git add .
git commit -m "<type>(<scope>): <설명>"
```
