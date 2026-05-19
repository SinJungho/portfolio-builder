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