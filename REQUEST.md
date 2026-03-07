# PortfolioForge — 메뉴 구조 · 개발 플로우 · 워킹 플로우

> GEMINI.md(기술 스택·아키텍처) + PLANNING.md(기획서)를 기반으로 작성된 실행 문서입니다.  
> MVP(Phase 1) 기준이며, Phase 2 이후 변경 사항은 각 섹션 하단에 별도 명시합니다.

---

## 📋 목차

1. [에디터 메뉴 변경](#1-에디터-메뉴-변경)
2. [개발 플로우](#2-개발-플로우)
3. [워킹 플로우](#3-워킹-플로우)

---

## 1. 에디터 메뉴 변경

### 1.1 변경 배경

MVP에서 `/editor/[id]` 경로와 WYSIWYG 에디터는 Phase 2로 이관됐습니다.  
사용자가 "편집"하러 가는 흐름이 아닌, "생성 → 즉시 배포"하는 **최단 선형 플로우**로 대체됐기 때문에  
사이드바에 "에디터" 메뉴를 노출할 근거가 없어졌습니다.

> ✅ **핵심 원칙**: GitHub 데이터는 이미 충분히 구조화되어 있습니다.  
> AI가 bio + README + package.json을 분석해 블록을 자동 구성하면,  
> 사용자는 검토 없이 **즉시 배포**할 수 있습니다.  
> 검토·수정은 배포 이후 선택적으로 수행합니다.

### 1.2 사이드바 메뉴 Before / After

**Before (기존)**

```
대시보드
에디터        ← 제거
프로젝트
설정
```

**After (MVP)**

```
대시보드      /dashboard
프로젝트      /projects
설정          /settings
```

> ℹ️ "에디터" 항목을 별도 메뉴로 두지 않습니다.  
> 포트폴리오 생성·수정 진입은 대시보드 카드에서 버튼으로 처리합니다.  
> Phase 2에서 WYSIWYG 에디터가 완성되면 그때 메뉴에 "에디터"를 재추가합니다.

### 1.3 대시보드 카드 진입점 구성

사이드바에서 에디터 메뉴를 제거하는 대신, `/dashboard`의 포트폴리오 카드에 세 가지 진입점을 붙입니다.

```
┌─────────────────────────────────────┐
│  포트폴리오 카드                    │
│                                     │
│  slug.portfolioforge.app            │
│  마지막 수정: 2025-03-07            │
│                                     │
│  [미세 조정]  [배포 URL]            │
└─────────────────────────────────────┘
```

| 버튼                     | 경로                                      | 설명                                                                         |
| ------------------------ | ----------------------------------------- | ---------------------------------------------------------------------------- |
| **새 포트폴리오 만들기** | `POST /api/portfolios` → `/generate/{id}` | 생성 플로우 Phase 01부터 시작. Phase 04는 건너뛰고 즉시 배포 가능            |
| **미세 조정**            | `/generate/{id}?step=adjust`              | 배포 후 블록 ON/OFF·순서·테마를 선택적으로 조정하는 화면. 크레딧 재차감 없음 |
| **배포 URL**             | `{slug}.portfolioforge.app`               | 공개 포트폴리오 페이지 새 탭                                                 |

> ✅ **"즉시 배포"가 기본값**: 생성 완료 후 Phase 05(배포)로 자동 진행됩니다.  
> 사용자가 원하면 그 전에 "미세 조정" 단계를 선택할 수 있지만, 강제하지 않습니다.

> ⚠️ **재방문 시 `?step=adjust`를 통해 크레딧 절약**  
> Phase 01~03(레포 수집 + AI 분석 + 블록 생성)을 다시 실행하면 `ai_credits`가 재차감됩니다.  
> 배포 후 수정은 항상 `adjust` 단계에서만 수행해야 크레딧 낭비가 없습니다.

### 1.4 경로 변경 이력

| 구분            | 기존 경로             | 변경 후 경로          | 이유                                                                        |
| --------------- | --------------------- | --------------------- | --------------------------------------------------------------------------- |
| 에디터 진입     | `/editor/[id]`        | `/generate/[id]`      | 에디터 없는 자동 생성 + 즉시 배포 플로우로 전환                             |
| 온보딩          | `/(auth)/onboarding`  | `/onboarding/bio`     | bio 차단은 인증 관심사가 아닌 온보딩 관심사. 로그인 유저도 접근 가능해야 함 |
| 에디터 레이아웃 | `editor/layout.tsx`   | `generate/layout.tsx` | 전체화면, 사이드바 없음 원칙 유지                                           |
| 검토 단계       | `?step=review` (필수) | `?step=adjust` (선택) | 검토를 필수 단계에서 배포 후 선택적 조정으로 변경                           |

### 1.5 Phase 2 에디터 메뉴 재추가 계획

Phase 2에서 WYSIWYG 에디터가 도입되면 다음과 같이 변경합니다.

```
대시보드      /dashboard
에디터        /editor/[id]    ← Phase 2에서 재추가
프로젝트      /projects
설정          /settings
```

Phase 2 에디터는 자동 생성 + 즉시 배포 이후의 **심화 편집** 도구로 포지셔닝합니다.  
즉, 생성 플로우(`/generate`) → 즉시 배포 → 에디터(`/editor`)로 세부 편집하는 3단계 구조입니다.

---

## 2. 개발 플로우

> 레이어 의존 관계를 기준으로 순서를 설계했습니다.  
> 하위 레이어가 완성되지 않으면 상위 레이어를 구현할 수 없기 때문에, 아래 순서를 지키는 것이 중요합니다.

### 2.1 전체 개발 순서 요약

```
Week 1–2: 기반 레이어
  └─ DB 스키마 → OAuth → Middleware → /onboarding/bio → GitHub 동기화

Week 3–4: 생성 + 즉시 배포 레이어
  └─ OpenAI 파이프라인 → 포트폴리오 생성 API → /generate/[id] UI → Zustand 상태
  └─ 자동 배포 트리거 (생성 완료 → 즉시 PATCH is_published: true)

Week 5–6: 출력 + 조정 레이어
  └─ <PortfolioPreview> 공유 컴포넌트 → /[slug] ISR → SEO → CI/CD
  └─ 배포 후 선택적 조정 UI (?step=adjust)
```

---

### 2.2 Week 1–2: 기반 레이어

#### Step 1. Prisma 스키마 마이그레이션

아래 테이블을 순서대로 생성합니다. 외래키 의존 순서를 지켜야 합니다.

```
users              (github_bio, github_bio_verified, ai_credits 포함)
  └─ integrations  (user_id FK)
  └─ raw_projects  (user_id FK)
  └─ portfolios    (user_id FK, generation_mode, auto_published 포함)
       └─ portfolio_blocks  (portfolio_id FK, is_ai_generated 포함)
       └─ analytics_events  (portfolio_id FK)
  └─ feed_items    (user_id FK, integration_id FK)
```

검증: `npx prisma migrate dev` 후 Zod `BlockConfigSchema` discriminatedUnion으로 블록 config 타입 체크

#### Step 2. NextAuth + GitHub OAuth

```
- GitHub OAuth App 생성 (scope: read:user, user:email)
- NextAuth 콜백에서 github_bio, github_id, github_login DB 저장
- 세션에 user.id 포함
- /api/auth/[...nextauth] 핸들러 구성
```

#### Step 3. Edge Middleware bio 검증

```typescript
// middleware.ts
// 보호 경로: /dashboard/*, /generate/*
// 로그인 + github_bio_verified = false → /onboarding/bio 리다이렉트
// 미로그인 → /login 리다이렉트
```

#### Step 4. /onboarding/bio 페이지

```
- GitHub 프로필 설정 링크 제공 (https://github.com/settings/profile)
- bio 작성 예시 텍스트 제공
- "등록 완료했어요" 버튼 → GET /api/integrations/github/bio 재호출
- 확인 시: github_bio_verified = true 저장 → /dashboard 이동
- 미확인 시: 안내 유지 (에러 토스트)
```

#### Step 5. GitHub API 동기화 + Redis 캐싱

```
POST /api/integrations/github/sync
  └─ Upstash Redis TTL 1시간 캐싱
  └─ 비동기 Job 생성 → job_id 반환

GET /api/integrations/github/sync/:job_id
  └─ 폴링 응답: { status, progress, synced_count, error? }

GET /api/integrations/github/bio
  └─ bio 존재 여부 반환
  └─ 없으면 github_settings_url 반환
```

---

### 2.3 Week 3–4: 생성 + 즉시 배포 레이어

#### Step 6. OpenAI 분석 파이프라인

```
입력: raw_projects.raw_data (README, package.json)
출력: ai_summary, ai_tags, ai_score → raw_projects 테이블에 캐싱

처리 순서:
  1. is_fork = false 레포만 대상
  2. ai_summary가 이미 존재하면 OpenAI 호출 없이 캐시 반환
  3. 없는 경우만 GPT-4o-mini 호출
  4. ai_score = stars * 0.3 + recency * 0.4 + readme_quality * 0.3
  5. 언어 분포 집계 → skills 블록 데이터 생성
```

#### Step 7. 포트폴리오 레코드 사전 생성

```
POST /api/portfolios
  Request:  { slug: string, theme?: string }
  Response: { portfolio_id: string }

  → 클라이언트가 /generate/{portfolio_id}로 이동
```

#### Step 8. POST /api/portfolios/generate + 즉시 배포 자동화

```
POST /api/portfolios/generate
  Request:  { portfolio_id: string, auto_publish?: boolean }  ← auto_publish 기본값 true
  Response 202: { job_id: string, estimated_seconds: number }
  Response 402: { error: 'insufficient_credits', credits_remaining: 0 }

  내부 처리:
    1. ai_credits 1회 차감 (Free: 월 3회, Pro: 무제한)
    2. generatePortfolio() 실행
       - hero 블록: github_bio → GPT-4o-mini subheadline 생성
       - project_grid: ai_score 상위 4개 (fork 제외)
       - skills: 언어 분포 + package.json 분석
       - contact: github_url + email (있으면 자동 삽입)
       - blog_feed: RSS 연동 있으면 추가
    3. auto_publish = true이면 생성 완료 즉시 is_published: true 저장
    4. on-demand revalidation 자동 트리거
    5. missing_optional_fields 계산 (배포 후 조정 안내용)

GET /api/portfolios/generate/:job_id
  폴링 간격: 3초 / 타임아웃: 60초
  Response: { status, progress, blocks?, published_url?, missing_optional_fields?, error? }
  ← published_url: 즉시 배포된 경우 서브도메인 URL 포함
```

> ✅ **즉시 배포 기본값**: `auto_publish`가 `true`이면 생성 완료와 동시에 배포됩니다.  
> 사용자는 생성 완료 화면에서 배포된 URL을 바로 확인할 수 있습니다.

#### Step 9. /generate/[id] 4단계 플로우 UI (Phase 04 선택화)

```
app/generate/[id]/
├── layout.tsx         전체화면, 사이드바 없음, 상단에 단계 표시 + 저장 상태
├── page.tsx           step 파라미터로 현재 Phase 결정
└── steps/
    ├── connect.tsx    Phase 01: GitHub 연동 확인 + bio 검증 + 레포 수집 트리거
    ├── analyze.tsx    Phase 02: AI 분석 폴링 UI (진행률 바, 120초 타임아웃)
    ├── generate.tsx   Phase 03: 블록 구성 폴링 UI (60초 타임아웃) + 즉시 배포 완료 화면
    └── adjust.tsx     Phase 04 (선택): 블록 ON/OFF + 순서 조정 + 테마 + 선택적 보완 + 미리보기
```

> ✅ **기존 5단계 → 4단계로 간소화**  
> Phase 04(검토)와 Phase 05(배포)를 통합: 생성 완료 = 즉시 배포.  
> `adjust` 단계는 배포 후 원하는 경우에만 진입하는 선택적 화면입니다.

**생성 완료 화면 (Phase 03 완료 시)**

```
┌──────────────────────────────────────────────────────┐
│  🎉 포트폴리오가 생성되었습니다!                     │
│                                                      │
│  slug.portfolioforge.app                             │
│                                                      │
│  [배포 URL 열기]    [미세 조정하기]                  │
│                                                      │
│  💡 미세 조정: 블록 순서·테마·연락처 추가 가능       │
└──────────────────────────────────────────────────────┘
```

폴링 UX 처리 기준:

| 상태         | 화면 처리                                                     |
| ------------ | ------------------------------------------------------------- |
| `pending`    | 스피너 + "분석 준비 중..."                                    |
| `processing` | 진행률 바 + 단계별 메시지 (예: "레포지토리 분석 중... 23/57") |
| `completed`  | 즉시 배포 완료 화면 (URL + "미세 조정하기" 버튼)              |
| `failed`     | 에러 메시지 + 재시도 버튼                                     |
| 타임아웃     | "시간이 오래 걸리고 있어요" 안내 + 재시도 버튼                |

#### Step 10. Zustand portfolioStore + 블록 API

```typescript
// portfolioStore (Zustand)
{
  blocks: Block[],           // 현재 블록 목록
  theme: string,             // 선택 테마
  designTokens: object,      // 색상·폰트 설정 (Phase 2에서 확장)
  isPublished: boolean,      // 배포 상태
  publishedUrl: string,      // 배포된 URL

  // 액션
  toggleBlock(blockId): void          // PATCH is_visible
  reorderBlocks(blocks): void         // PUT position 일괄 저장
  setTheme(theme): void               // PATCH portfolios/:id + 즉시 revalidation
  updateOptionalField(field): void    // PATCH blocks/:blockId config
}

// API 연결
PATCH /api/portfolios/:id/blocks/:blockId   블록 ON/OFF, config 수정 → 자동 revalidation
PUT   /api/portfolios/:id/blocks            순서 일괄 저장 → 자동 revalidation
PATCH /api/portfolios/:id                  테마 변경 → 자동 revalidation
```

> ✅ **조정 내용은 저장 즉시 배포된 페이지에 반영됩니다.**  
> "재배포" 버튼 없이, 변경할 때마다 on-demand revalidation이 자동 실행됩니다.

---

### 2.4 Week 5–6: 출력 + 조정 레이어

#### Step 11. \<PortfolioPreview\> 공유 컴포넌트

```
src/preview/PortfolioPreview.tsx

props: { blocks: Block[], theme: string, designTokens: object }

- /generate/[id] adjust 단계 미리보기에서 사용
- /[slug] 출력 페이지에서 그대로 재사용
- 동일 컴포넌트를 공유하므로 미리보기 = 실제 결과물 보장
- 테마 변경 시 양쪽 동시 반영
```

#### Step 12. /[slug] ISR 포트폴리오 페이지

```
app/[slug]/page.tsx

- generateStaticParams: 배포된 포트폴리오 slug 목록
- revalidate: 60 (GitHub Webhook 업데이트 최대 60초 지연)
- <PortfolioPreview> 렌더링
- analytics page_view 이벤트 수집 (POST /api/analytics/event)
```

#### Step 13. 배포 API + on-demand revalidation

```
PATCH /api/portfolios/:id → { is_published: true }
  └─ /api/revalidate 호출 → revalidatePath('/[slug]')
  └─ {slug}.portfolioforge.app 즉시 반영
  └─ 생성 완료 시 자동 호출 (별도 사용자 액션 불필요)

PATCH /api/portfolios/:id/blocks/:blockId (조정 시)
  └─ 변경 저장 즉시 revalidatePath 자동 트리거

/api/webhooks/github
  └─ push 이벤트 수신 → raw_projects 증분 업데이트
  └─ revalidatePath 트리거 (60초 지연 허용)
```

#### Step 14. SEO 자동화

```
- 메타 태그: GitHub bio + 프로젝트명 조합으로 자동 생성
- OG 이미지: Vercel OG 라이브러리 또는 Cloudflare R2에 저장
- 사이트맵: 배포된 포트폴리오 slug 기반 자동 생성
- robots.txt: /[slug] 허용, /dashboard/* 차단
```

#### Step 15. CI/CD Lighthouse 검증

```
GitHub Actions:
  - PR 머지 시 Lighthouse CI 자동 실행
  - 성능 점수 90+ 미달 시 빌드 실패
  - WCAG 2.1 색상 대비도: 테마 프리셋 자체가 기준 충족하도록 사전 설계
```

---

## 3. 워킹 플로우

### 3.1 신규 사용자 플로우

```
랜딩(/)
  └─ [GitHub으로 시작하기] 클릭
        │
        ▼
  GitHub OAuth 로그인
        │
        ├─ bio 없음
        │     └─ /onboarding/bio
        │           ├─ GitHub 설정 페이지에서 bio 작성
        │           └─ "등록 완료했어요" 클릭
        │                 ├─ bio 확인됨 → /dashboard
        │                 └─ 미확인 → 안내 유지 (에러 토스트)
        │
        └─ bio 있음
              └─ /dashboard
                    │
                    ▼ (포트폴리오 없음 → 신규 생성 CTA 강조)
              [새 포트폴리오 만들기]
                    │
                    ▼
              POST /api/portfolios → portfolio_id 발급
                    │
                    ▼
              /generate/{id}
                    │
          ┌─────────┴────────────────────────────────────────────────┐
          │                                                          │
          │  Phase 01 — GitHub 연동 확인                             │
          │    ├─ GitHub OAuth 완료 여부 체크                        │
          │    ├─ GET /api/integrations/github/bio 확인              │
          │    └─ POST /api/integrations/github/sync 트리거          │
          │                                                          │
          │  Phase 02 — AI 분석 (최대 120초)                         │
          │    ├─ 폴링 3초 간격                                      │
          │    ├─ 진행률 바: "레포지토리 분석 중... 23/57"           │
          │    └─ README + package.json → ai_summary, ai_score       │
          │                                                          │
          │  Phase 03 — 블록 자동 구성 + 즉시 배포 (최대 60초)       │
          │    ├─ ai_credits 1회 차감                                │
          │    ├─ hero / project_grid / skills / contact 생성        │
          │    ├─ RSS 연동 시 blog_feed 추가                         │
          │    ├─ auto_publish: true → is_published 자동 저장        │
          │    ├─ on-demand revalidation 자동 트리거                  │
          │    └─ 완료 화면: URL 발급 + "미세 조정하기" 버튼         │
          │                                                          │
          │  Phase 04 — 미세 조정 [선택 사항]                        │
          │    ├─ 블록 ON/OFF 토글 (변경 즉시 배포 반영)             │
          │    ├─ 블록 순서 조정 ↑↓ (변경 즉시 배포 반영)            │
          │    ├─ 테마 선택 6종 (변경 즉시 배포 반영)                │
          │    └─ 선택적 보완 (email, linkedin, website)             │
          │         └─ 강제 아님, 언제든 건너뛰어도 됨               │
          │                                                          │
          └──────────────────────────────────────────────────────────┘
```

### 3.2 재방문 사용자 플로우

```
재방문 → /dashboard (포트폴리오 카드 목록)
    │
    ├─ [미세 조정] 클릭
    │     └─ /generate/{id}?step=adjust  ← 크레딧 재차감 없음
    │           ├─ 블록 ON/OFF 토글 → 변경 즉시 배포에 반영
    │           ├─ 블록 순서 조정  → 변경 즉시 배포에 반영
    │           └─ 테마 변경       → 변경 즉시 배포에 반영
    │               ("재배포" 버튼 불필요 — 자동 revalidation)
    │
    ├─ [새 포트폴리오 만들기] 클릭
    │     └─ POST /api/portfolios → /generate/{new_id}
    │           └─ 신규 생성 플로우 Phase 01부터 재시작
    │               (ai_credits 1회 추가 차감)
    │
    └─ [배포 URL] 클릭
          └─ {slug}.portfolioforge.app 새 탭 (공개 포트폴리오 확인)
```

### 3.3 GitHub 데이터 자동 업데이트 플로우

배포 후 GitHub에 새 레포를 push하면, 별도 사용자 액션 없이 포트폴리오가 자동 갱신됩니다.

```
GitHub push 이벤트
    │
    ▼
POST /api/webhooks/github
    │
    ├─ raw_projects 증분 업데이트
    │    └─ 변경된 레포만 ai_summary 재분석 (캐시 무효화)
    │
    └─ revalidatePath('/[slug]')
         └─ 최대 60초 이내 포트폴리오 페이지 반영
              └─ 사용자에게 "변경 후 최대 60초 이내 반영" 명시적 고지
```

### 3.4 크레딧 소진 시 플로우

```
Phase 03 진입 시 ai_credits = 0
    │
    ▼
POST /api/portfolios/generate → 402 응답
    │
    ▼
Phase 03 화면에 크레딧 소진 안내 표시
    ├─ "이번 달 자동 생성 횟수를 모두 사용했어요."
    ├─ [Pro로 업그레이드] 버튼 → /settings/billing
    └─ 다음 달 초 자동 리셋 안내 (리셋 날짜 표시)
```

---

## 부록: 경로·API 빠른 참조

### 경로 목록

| 경로                         | 설명                          | 렌더링       |
| ---------------------------- | ----------------------------- | ------------ |
| `/`                          | 메인 랜딩                     | SSG          |
| `/login`                     | GitHub OAuth 로그인           | SSR          |
| `/onboarding/bio`            | bio 미등록 안내               | SSR          |
| `/dashboard`                 | 포트폴리오 목록               | SSR + Client |
| `/projects`                  | GitHub 레포 관리              | SSR + Client |
| `/settings`                  | 계정·연동·결제                | SSR + Client |
| `/generate/[id]`             | 자동 생성 + 즉시 배포 플로우  | SSR + Client |
| `/generate/[id]?step=adjust` | 배포 후 선택적 미세 조정      | SSR + Client |
| `/[slug]`                    | 배포된 포트폴리오 공개 페이지 | ISR (60s)    |

### API 목록

| Method   | 경로                                    | 설명                                          |
| -------- | --------------------------------------- | --------------------------------------------- |
| `GET`    | `/api/integrations/github/bio`          | bio 존재 여부 확인                            |
| `POST`   | `/api/integrations/github/sync`         | 레포 수집 트리거                              |
| `GET`    | `/api/integrations/github/sync/:job_id` | 수집 진행 상태 폴링                           |
| `GET`    | `/api/projects`                         | 레포 목록                                     |
| `POST`   | `/api/projects/:id/analyze`             | 개별 레포 AI 분석 (크레딧 미차감)             |
| `POST`   | `/api/portfolios`                       | 포트폴리오 레코드 사전 생성                   |
| `GET`    | `/api/portfolios`                       | 포트폴리오 목록                               |
| `PATCH`  | `/api/portfolios/:id`                   | 테마·slug 등 메타 수정 + 자동 revalidation    |
| `DELETE` | `/api/portfolios/:id`                   | 삭제                                          |
| `POST`   | `/api/portfolios/generate`              | AI 자동 생성 + 즉시 배포 트리거 (크레딧 차감) |
| `GET`    | `/api/portfolios/generate/:job_id`      | 생성 진행 상태 폴링 (published_url 포함)      |
| `GET`    | `/api/portfolios/:id/blocks`            | 블록 목록                                     |
| `PATCH`  | `/api/portfolios/:id/blocks/:blockId`   | 블록 ON/OFF·config 수정 + 자동 revalidation   |
| `PUT`    | `/api/portfolios/:id/blocks`            | 블록 순서 일괄 저장 + 자동 revalidation       |
| `POST`   | `/api/analytics/event`                  | 방문자 이벤트 수집 (Auth 불필요)              |
| `GET`    | `/api/analytics/:portfolioId/summary`   | 분석 요약 (Pro)                               |
| `POST`   | `/api/revalidate`                       | on-demand ISR revalidation                    |
| `POST`   | `/api/webhooks/github`                  | GitHub push 이벤트 수신                       |
