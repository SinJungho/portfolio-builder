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
