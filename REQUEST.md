문서를 다시 정확히 참조해서 프롬프트를 작성하겠습니다.충분히 파악했습니다. 각 Step별 프롬프트를 작성합니다.

---

## Step 1 프롬프트 — `POST /api/portfolios`

````
Next.js 15 환경입니다. params와 searchParams는 Promise 타입이므로 await해서 사용해주세요.

아래 스펙대로 `app/api/portfolios/route.ts`를 구현해줘.

---

## DB 스키마 (관련 테이블만)

```prisma
model portfolios {
  id              String   @id @default(uuid())
  user_id         String
  slug            String
  title           String?
  theme           String   @default("minimalist")
  design_tokens   Json?
  generation_mode String   @default("auto")
  auto_published  Boolean  @default(true)
  custom_domain   String?
  is_published    Boolean  @default(false)
  seo_title       String?
  seo_description String?
  og_image_url    String?
  view_count      Int      @default(0)
  published_at    DateTime?
  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt
  @@unique([user_id, slug])
}

model users {
  id          String  @id @default(uuid())
  github_login String? @unique
  plan        String  @default("free")
  ai_credits  Int     @default(3)
}
````

---

## POST /api/portfolios 스펙

**Request body**: `{ slug?: string, theme?: string }`

- slug는 optional. 생략 시 `github_login` 기반으로 자동 생성

**slug 자동 생성 규칙**:

- 기본값: `github_login` (예: `kimdev`)
- portfolios 테이블 전체에서 해당 slug가 이미 존재하면 숫자 suffix 자동 부여: `kimdev-2`, `kimdev-3`, ...
- 사용자가 직접 입력한 경우: 영문 소문자·숫자·하이픈만 허용, 3~50자 (Zod로 검증)
- slug는 전체 사용자 기준 전역 유일

**응답**:

- 성공: `201 { portfolio_id: string, slug: string }`
- 미인증: `401`
- Free 플랜이고 portfolios 수 >= 1: `403 { error: 'plan_limit_exceeded', current_count: number, limit: 1, upgrade_url: '/settings/billing' }`
- Zod 검증 실패: `400 { error: string }`

**내부 처리 순서**:

1. `getServerSession()`으로 세션 확인 → 없으면 401
2. DB에서 `users` 조회하여 `plan`, `github_login` 확인
3. `plan === 'free'`이면 기존 portfolios 수 COUNT → 1 이상이면 403
4. slug 결정: 요청에 slug 없으면 `github_login`으로 시작, 충돌 시 suffix 순차 탐색
5. `portfolios` 테이블에 INSERT
6. `{ portfolio_id, slug }` 반환

---

## 주의사항

- 모든 DB 작업은 Prisma client 사용
- 인증은 NextAuth v5의 `auth()` 함수 사용
- 에러 응답은 `Response.json({ error: ... }, { status: ... })` 형태로 통일
- slug 중복 탐색 시 무한루프 방지를 위해 최대 10회 시도 후 실패 처리

```

---

## Step 2 프롬프트 — `POST /api/portfolios/generate`

```

Next.js 15 환경입니다. params와 searchParams는 Promise 타입이므로 await해서 사용해주세요.

아래 스펙대로 `app/api/portfolios/generate/route.ts`를 구현해줘.

---

## POST /api/portfolios/generate 스펙

**Request body**: `{ portfolio_id: string, auto_publish?: boolean }`

- `auto_publish` 기본값: `true`

**응답**:

- 성공: `202 { job_id: string, estimated_seconds: 30 }`
- 미인증: `401`
- `ai_credits` 부족: `402 { error: 'insufficient_credits', credits_remaining: 0 }`
- 잘못된 portfolio_id (존재하지 않거나 본인 소유 아님): `404`

**내부 처리 순서**:

1. `auth()`로 세션 확인
2. `portfolio_id`로 portfolios 조회 → 없거나 `user_id !== session.user.id`이면 404
3. `users.ai_credits` 확인 → 0이면 402
4. `ai_credits` 1 차감 (`UPDATE users SET ai_credits = ai_credits - 1`)
5. `job_id` 생성 (`crypto.randomUUID()`)
6. Upstash Redis에 job 초기 상태 저장 (TTL 10분):
   ```json
   {
     "status": "pending",
     "progress": 0,
     "portfolio_id": "...",
     "user_id": "...",
     "auto_publish": true
   }
   ```
7. `generatePortfolio()`를 백그라운드에서 kick-off
   - Vercel 환경이므로 `waitUntil`을 사용할 수 없음
   - 대신 `fetch('/api/portfolios/generate/run', { method: 'POST', body: JSON.stringify({ job_id, portfolio_id, user_id, auto_publish }) })`를 await 없이 호출 (fire-and-forget)
   - 이 내부 fetch는 Authorization 헤더로 `INTERNAL_API_SECRET` 환경변수를 사용해 보호
8. `{ job_id, estimated_seconds: 30 }` 즉시 반환

---

## Redis job 상태 타입

```typescript
type JobStatus = {
  status: "pending" | "processing" | "completed" | "failed";
  progress: number; // 0~100
  portfolio_id: string;
  user_id: string;
  auto_publish: boolean;
  blocks?: any[];
  published_url?: string;
  missing_optional_fields?: string[];
  error?: string;
};
```

---

## 주의사항

- Upstash Redis는 `@upstash/redis` 패키지의 `Redis.fromEnv()` 사용
- Redis key 형식: `generate_job:{job_id}`
- 크레딧 차감과 job 생성은 원자적으로 처리되어야 함 (차감 성공 후 job 저장 실패 시 크레딧 복구 로직 필요)
- 내부 API 호출 URL은 `process.env.NEXT_PUBLIC_APP_URL + '/api/portfolios/generate/run'` 사용

```

---

## Step 3 프롬프트 — `generatePortfolio()` 내부 로직

```

Next.js 15 환경입니다. params와 searchParams는 Promise 타입이므로 await해서 사용해주세요.

아래 스펙대로 두 파일을 구현해줘.

1. `app/api/portfolios/generate/run/route.ts` — 내부 전용 실행 엔드포인트
2. `src/lib/generate/generatePortfolio.ts` — 실제 생성 로직

---

## 1. run/route.ts 스펙

- `INTERNAL_API_SECRET` 헤더 검증 → 불일치 시 `401`
- body에서 `{ job_id, portfolio_id, user_id, auto_publish }` 파싱
- `generatePortfolio()`를 호출하고 결과를 Redis에 저장
- 이 엔드포인트 자체는 `200 { ok: true }` 를 즉시 반환하고, generatePortfolio는 내부적으로 진행

---

## 2. generatePortfolio() 스펙

함수 시그니처:

```typescript
async function generatePortfolio(params: {
  jobId: string;
  portfolioId: string;
  userId: string;
  autoPublish: boolean;
}): Promise<void>;
```

**처리 순서 및 Redis progress 업데이트 타이밍**:

```
progress 0  → status: 'processing' 으로 변경
progress 10 → users, raw_projects 조회 완료
progress 30 → hero 블록 생성 (GPT-4o-mini subheadline 생성)
progress 50 → project_grid, skills 블록 생성
progress 70 → contact, blog_feed 블록 생성
progress 85 → portfolio_blocks DB 저장 완료
progress 95 → is_published: true 저장 + revalidation 트리거
progress 100 → status: 'completed', published_url, missing_optional_fields 저장
```

**블록 생성 상세 규칙**:

hero 블록:

- `headline`: `user.name`
- `subheadline`: GPT-4o-mini 호출. 프롬프트: `"GitHub bio: {bio}\n사용 언어: {skills}\n위 정보를 바탕으로 채용 담당자에게 어필할 수 있는 한 줄 소개를 한국어로 작성해줘. 직군 + 핵심 기술 + 강점 형태로, 50자 이내로."`
- `bio`: `user.github_bio` (항상 존재)
- `show_github_stats`: true

project_grid 블록:

- `raw_projects`에서 `is_fork: false`, `ai_score DESC` 상위 4개 선택
- `ai_score`가 null인 레포는 `stargazers_count DESC`로 폴백

skills 블록:

- `raw_projects`의 `language` 필드 집계 → 언어별 레포 수 비율로 level(0~100) 계산
- level = Math.round((해당 언어 레포 수 / 전체 레포 수) \* 100), 최소 10 보장
- 상위 8개 언어만 포함

contact 블록:

- `github_url`: `https://github.com/{user.github_login}`
- `email`: `user.email` (null이면 필드 자체 제외)

blog_feed 블록:

- `integrations` 테이블에서 `user_id`, `provider IN ('tistory','velog','medium')`, `is_active: true` 조회
- 있으면 블록 추가, 없으면 생략

**missing_optional_fields 계산**:

- `user.email`이 없으면 `'email'` 추가
- 항상 `'linkedin_url'`, `'website_url'` 추가 (MVP에서 모든 사용자 대상)

**즉시 배포 처리**:

- `auto_publish: true`이면:
  1. `portfolios` 업데이트: `{ is_published: true, auto_published: true, published_at: new Date() }`
  2. `fetch(process.env.NEXT_PUBLIC_APP_URL + '/api/revalidate', { method: 'POST', body: JSON.stringify({ slug }) })`

**에러 처리**:

- try-catch로 전체 래핑
- 에러 발생 시 Redis job 상태를 `{ status: 'failed', error: error.message }`로 업데이트
- GPT-4o-mini 호출 실패 시 subheadline 폴백: `user.github_bio` 앞 50자 그대로 사용

---

## readme_quality 점수 산정 (ai_score 계산 보조 함수)

이미 raw_projects에 ai_score가 저장되어 있다고 가정하고 조회만 함.
단, ai_score가 null인 레포에 대해서는 아래 공식으로 즉석 계산:

````
readme_quality:
- README(raw_data.readme) 없음 → 0.0
- 300자 미만 → 0.3
- 300자 이상 → 0.6
- 300자 이상 + '!['포함 → +0.2
- 300자 이상 + '```' 포함 → +0.1
- 최대 1.0

recency: 마지막 push로부터 경과 시간 기준
- 30일 이내 → 1.0
- 90일 이내 → 0.7
- 180일 이내 → 0.4
- 이후 → 0.1

ai_score = stars * 0.3 + recency * 0.4 + readme_quality * 0.3
(stars는 Math.min(stargazers_count / 100, 1.0)로 정규화)
````

---

## 주의사항

- OpenAI SDK: `openai` 패키지, `new OpenAI({ apiKey: process.env.OPENAI_API_KEY })`
- GPT 모델: `gpt-4o-mini`
- Redis key 형식: `generate_job:{jobId}`
- Redis 업데이트는 `redis.set(key, JSON.stringify(updated), { ex: 600 })` 형태
- Prisma `portfolio_blocks.createMany` 사용

```

---

## Step 4 프롬프트 — `GET /api/portfolios/generate/:job_id`

```

Next.js 15 환경입니다. params와 searchParams는 Promise 타입이므로 await해서 사용해주세요.

아래 스펙대로 `app/api/portfolios/generate/[job_id]/route.ts`를 구현해줘.

---

## GET /api/portfolios/generate/:job_id 스펙

**응답**:

- 성공: `200 { status, progress, blocks?, published_url?, missing_optional_fields?, error? }`
- 미인증: `401`
- job 없음: `404 { error: 'job_not_found' }`
- 본인 job 아님: `403 { error: 'forbidden' }`

**내부 처리 순서**:

1. `auth()`로 세션 확인
2. Redis에서 `generate_job:{job_id}` 조회 → 없으면 404
3. `job.user_id !== session.user.id`이면 403
4. job 상태 그대로 반환 (status, progress, blocks, published_url, missing_optional_fields, error)

---

## 클라이언트 폴링 규칙 (주석으로 명시)

- 폴링 간격: 3초
- 타임아웃: 60초 (20회 초과 시 클라이언트에서 타임아웃 처리)
- `status: 'completed'` 또는 `status: 'failed'` 수신 시 폴링 중단

---

## 주의사항

- Redis 값은 JSON.parse로 파싱
- 응답 타입 정의 포함할 것 (export type GenerateJobResponse)
- 이 타입은 클라이언트 폴링 훅에서 재사용할 수 있도록 `src/types/generate.ts`에 별도 export

```

---

## Step 5 프롬프트 — `/generate/[id]` 4단계 UI

```

Next.js 15 환경입니다. params와 searchParams는 Promise 타입이므로 await해서 사용해주세요.

아래 스펙대로 generate 플로우 UI 파일들을 구현해줘.

---

## 파일 목록

1. `app/generate/[id]/layout.tsx`
2. `app/generate/[id]/page.tsx`
3. `app/generate/[id]/steps/connect.tsx`
4. `app/generate/[id]/steps/analyze.tsx`
5. `app/generate/[id]/steps/generate.tsx`

(adjust.tsx는 Step 6·7 완료 후 별도 구현)

---

## 1. layout.tsx

- 전체화면 레이아웃 (사이드바 없음, `min-h-screen`)
- 상단 헤더: 좌측 "PortfolioForge" 로고(텍스트), 우측 현재 단계 표시 ("1 / 3")
- 현재 phase는 searchParams의 `step` 값으로 결정:
  - 없음 또는 `connect` → 1/3
  - `analyze` → 2/3
  - `generate` → 3/3
  - `adjust` → 헤더에 "미세 조정" 텍스트 표시

## 2. page.tsx

- Server Component
- `params.id`로 portfolio 존재 여부 확인 (없으면 notFound())
- `searchParams.step` 값에 따라 해당 step 컴포넌트 렌더링:
  - 없음 → `<ConnectStep portfolioId={id} />`
  - `analyze` → `<AnalyzeStep portfolioId={id} />`
  - `generate` → `<GenerateStep portfolioId={id} />`
  - `adjust` → 추후 구현 (현재는 `/generate/{id}?step=generate`로 리다이렉트)
- 각 step 컴포넌트는 `'use client'`

## 3. connect.tsx — Phase 01

**역할**: GitHub 연동 확인 + 레포 수집 트리거 후 analyze로 자동 이동

**동작 순서**:

1. 마운트 시 `POST /api/integrations/github/sync` 호출
2. 응답에서 `job_id` 수신
3. 완료 화면 없이 바로 `router.push('/generate/{portfolioId}?step=analyze&sync_job_id={job_id}')` 이동

**UI**:

- 중앙 정렬, 스피너 + "GitHub 데이터를 가져오는 중..." 텍스트
- 에러 시: 에러 메시지 + "다시 시도" 버튼

## 4. analyze.tsx — Phase 02

**역할**: sync job 폴링 → 완료 시 generate 단계로 자동 이동

**props**: `{ portfolioId: string }` + URL에서 `sync_job_id` 파싱 (useSearchParams)

**동작**:

- `GET /api/integrations/github/sync/{sync_job_id}` 3초 간격 폴링 (useQuery + refetchInterval)
- `status: 'completed'` → `POST /api/portfolios/generate` 호출 → `generate_job_id` 수신 → `router.push('/generate/{portfolioId}?step=generate&generate_job_id={job_id}')`
- 120초 타임아웃: 폴링 40회 초과 시 타임아웃 처리

**UI**:

- 진행률 바 (progress 값 반영)
- 단계별 메시지: pending → "분석 준비 중...", processing → "레포지토리 분석 중... ({synced_count}개 완료)"
- 타임아웃/실패 시: "시간이 오래 걸리고 있어요" + "다시 시도" 버튼

## 5. generate.tsx — Phase 03

**역할**: generate job 폴링 → completed 시 완료 화면 표시

**props**: `{ portfolioId: string }` + URL에서 `generate_job_id` 파싱

**동작**:

- `GET /api/portfolios/generate/{generate_job_id}` 3초 간격 폴링
- `status: 'completed'` → 폴링 중단 → 완료 화면으로 전환
- 60초 타임아웃 (20회)

**완료 화면 UI**:

```
┌──────────────────────────────────────────────────────┐
│  🎉 포트폴리오가 생성되었습니다!                     │
│                                                      │
│  {slug}.portfolioforge.app                           │
│  (클릭 시 클립보드 복사 + 토스트 알림)               │
│                                                      │
│  [배포 URL 열기 ↗]    [미세 조정하기 →]              │
│                                                      │
│  💡 블록 순서·테마·연락처는 미세 조정에서 변경 가능  │
└──────────────────────────────────────────────────────┘
```

- "배포 URL 열기": `published_url` 새 탭
- "미세 조정하기": `router.push('/generate/{portfolioId}?step=adjust')`

**폴링 중 UI**:

- 진행률 바 (progress 반영)
- 메시지: "포트폴리오를 구성하는 중..." → "거의 다 됐어요..."(progress >= 80)

---

## 공통 주의사항

- 폴링은 TanStack Query `useQuery`의 `refetchInterval` 옵션 사용
- `status: 'completed' | 'failed'`이면 `refetchInterval: false`로 폴링 중단
- 에러 상태는 `shadcn/ui`의 `Alert` 컴포넌트로 표시
- 로딩 스피너는 Tailwind `animate-spin` 사용
- 모든 클라이언트 컴포넌트 상단에 `'use client'` 선언

```

---

## Step 6 프롬프트 — Zustand `portfolioStore`

```

Next.js 15 환경입니다. params와 searchParams는 Promise 타입이므로 await해서 사용해주세요.

아래 스펙대로 `src/stores/portfolioStore.ts`를 구현해줘.

---

## 스토어 상태 타입

```typescript
type Block = {
  id: string;
  block_type: "hero" | "project_grid" | "skills" | "blog_feed" | "contact";
  position: number;
  config: Record<string, unknown>;
  is_visible: boolean;
  is_ai_generated: boolean;
};

type PortfolioStore = {
  // 상태
  portfolioId: string | null;
  blocks: Block[];
  theme: string;
  isPublished: boolean;
  publishedUrl: string | null;
  isSaving: boolean; // API 호출 중 여부 (낙관적 업데이트 후 저장 중 표시용)

  // 초기화
  initialize: (data: {
    portfolioId: string;
    blocks: Block[];
    theme: string;
    isPublished: boolean;
    publishedUrl: string | null;
  }) => void;

  // 액션
  toggleBlock: (blockId: string) => Promise<void>;
  reorderBlocks: (reordered: Block[]) => Promise<void>;
  setTheme: (theme: string) => Promise<void>;
  updateOptionalField: (
    blockId: string,
    config: Partial<Record<string, unknown>>,
  ) => Promise<void>;
};
```

---

## 각 액션 구현 규칙

**공통**: 모든 액션은 낙관적 업데이트(UI 먼저 반영) 후 API 호출. API 실패 시 이전 상태로 롤백.

**toggleBlock(blockId)**:

- 로컬 상태에서 해당 block의 `is_visible` 토글
- `PATCH /api/portfolios/{portfolioId}/blocks/{blockId}` 호출: `{ is_visible: !prev }`

**reorderBlocks(reordered)**:

- 로컬 상태 blocks를 reordered로 교체
- `PUT /api/portfolios/{portfolioId}/blocks` 호출: `{ blocks: reordered.map(b => ({ id: b.id, position: b.position })) }`

**setTheme(theme)**:

- 로컬 상태 theme 업데이트
- `PATCH /api/portfolios/{portfolioId}` 호출: `{ theme }`

**updateOptionalField(blockId, config)**:

- 로컬 상태에서 해당 block의 config를 merge 업데이트
- `PATCH /api/portfolios/{portfolioId}/blocks/{blockId}` 호출: `{ config }`

---

## 주의사항

- `isSaving`은 API 호출 시작 시 true, 완료/실패 시 false
- 롤백은 액션 호출 전 상태를 로컬 변수에 저장해두고 catch에서 복원
- API fetch는 별도 `src/lib/api/portfolio.ts`에 함수로 분리하고 store에서 import해서 사용
- Zustand `immer` 미들웨어 사용 (불변성 편의)

```

---

## Step 7 프롬프트 — 블록 수정 API 3종

```

Next.js 15 환경입니다. params와 searchParams는 Promise 타입이므로 await해서 사용해주세요.

아래 스펙대로 3개의 API Route Handler를 구현해줘.

---

## 공통 소유권 검증 규칙

모든 엔드포인트에서 아래 검증을 먼저 수행:

1. `auth()`로 세션 확인 → 없으면 401
2. `portfolioId`로 portfolios 조회 → 없으면 404
3. `portfolio.user_id !== session.user.id` → 403 `{ error: 'forbidden' }`
4. 검증 통과 후 실제 로직 수행
5. 모든 성공 응답 후 `revalidatePath('/[slug]', 'page')` 또는 내부 `/api/revalidate` 호출

---

## 1. PATCH /api/portfolios/[id]/blocks/[blockId]

파일: `app/api/portfolios/[id]/blocks/[blockId]/route.ts`

**Request body** (Zod 검증):

```typescript
{
  is_visible?: boolean
  config?: Record<string, unknown>  // Partial BlockConfig
}
```

**처리**:

- `portfolio_blocks` 테이블에서 `id === blockId AND portfolio_id === portfolioId` 조회 → 없으면 404
- 전달된 필드만 PATCH (`is_visible`, `config` 각각 undefined면 skip)
- 성공: `200 { block: updatedBlock }`
- revalidation 트리거

---

## 2. PUT /api/portfolios/[id]/blocks

파일: `app/api/portfolios/[id]/blocks/route.ts` (PUT 메서드 추가)

**Request body** (Zod 검증):

```typescript
{
  blocks: Array<{ id: string; position: number }>;
}
```

**처리**:

- blocks 배열의 각 id가 해당 portfolio 소속인지 검증
- `prisma.$transaction`으로 position 일괄 업데이트
- 성공: `200 { ok: true }`
- revalidation 트리거

---

## 3. PATCH /api/portfolios/[id]

파일: `app/api/portfolios/[id]/route.ts`

**Request body** (Zod 검증, 허용 필드만):

```typescript
{
  theme?: z.enum(['minimalist', 'creative', 'corporate', 'dark', 'pastel', 'tech'])
  slug?: string  // 변경 시 slug 중복 검사 필요
  title?: string
}
```

**처리**:

- 전달된 필드만 PATCH
- `slug` 변경 요청 시: 다른 portfolios에서 해당 slug 사용 여부 확인 → 중복이면 `409 { error: 'slug_conflict' }`
- 성공: `200 { portfolio: updatedPortfolio }`
- revalidation 트리거

---

## revalidation 처리 방식

직접 `revalidatePath`를 사용하되, 이 API Route는 Edge Runtime이 아닌 Node.js Runtime에서 실행:

```typescript
import { revalidatePath } from "next/cache";
// portfolio의 slug를 조회하여
revalidatePath(`/${portfolio.slug}`);
```

---

## 공통 주의사항

- 모든 응답은 `Response.json()` 사용
- Zod 스키마는 각 파일 상단에 정의
- 소유권 검증 로직은 `src/lib/api/validatePortfolioOwnership.ts`로 분리하고 3개 파일 모두에서 import해서 사용

```

---

7개 프롬프트 모두 작성했습니다. 각 프롬프트는 이전 Step의 결과물을 전제로 하므로 **Step 1 → 7 순서대로** Claude에게 전달하면 됩니다. Step 3은 분량이 크니 `generatePortfolio()` 로직과 `run/route.ts`를 한 번에 처리하기 어려우면 둘로 나눠서 보내도 됩니다.
```
