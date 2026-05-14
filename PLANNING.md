# PortfolioForge — 프로젝트 기획서

> **개발자 맞춤형 동적 포트폴리오 빌더**
>
> _"개발자가 코드에 집중하는 동안, 포트폴리오는 저희가 관리합니다"_

---

## 📋 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [문제 정의](#2-문제-정의)
3. [솔루션 및 비즈니스 모델](#3-솔루션-및-비즈니스-모델)
4. [타겟 사용자](#4-타겟-사용자)
5. [핵심 기능 명세](#5-핵심-기능-명세)
6. [개발 로드맵](#6-개발-로드맵)
7. [차별화 전략](#7-차별화-전략)
8. [포트폴리오 전략](#8-포트폴리오-전략)
9. [KPI 및 성공 지표](#9-kpi-및-성공-지표)

---

## 1. 프로젝트 개요

| 항목           | 내용                                                                                                                                   |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **프로젝트명** | PortfolioForge                                                                                                                         |
| **한 줄 설명** | GitHub·블로그·알고리즘 플랫폼 데이터를 자동 수집해 AI가 포트폴리오를 자동 생성하고 즉시 배포하는 개발자 전용 포트폴리오 플랫폼         |
| **핵심 전제**  | **개발자 전용** — GitHub 계정 + GitHub bio 보유자만 사용 가능. 에디터 없이 AI가 포트폴리오를 자동 구성하고 **즉시 자동 배포**까지 완료 |

---

## 2. 문제 정의

### 2.1 개발자 포트폴리오 작성의 어려움

| 문제점          | 설명                                                                | 데이터 근거       |
| --------------- | ------------------------------------------------------------------- | ----------------- |
| 시간 소모       | 초기 제작 평균 8~15시간, 이후 업데이트 지연                         | 커뮤니티 설문조사 |
| 디자인 부담     | 개발자의 68%가 디자인 부담으로 업데이트 미룸                        | GitHub 설문       |
| 정적 콘텐츠     | GitHub 커밋·블로그 포스팅 등 실시간 성과 반영 불가                  | 사용자 인터뷰     |
| 관리 분산       | GitHub·블로그·알고리즘 플랫폼 등 여러 소스 통합 불편                | 커뮤니티 피드백   |
| **에디터 마찰** | 빌더의 드래그앤드롭 에디터는 개발자에게 불필요한 조작 복잡도를 유발 | 사용자 인터뷰     |

### 2.2 기존 솔루션의 한계

| 솔루션       | 한계                                 | PortfolioForge 대응                        |
| ------------ | ------------------------------------ | ------------------------------------------ |
| 정적 템플릿  | 개인화 부족, 수동 업데이트 필요      | GitHub 자동 동기화 + ISR                   |
| GitHub Pages | 디자인 제한, Jekyll 설정 복잡        | 에디터 없이 AI 자동 생성 + 즉시 자동 배포  |
| Notion       | SEO 취약, 개발자 특화 기능 부재      | SSR/ISR SEO 최적화 + 기술 시각화           |
| 유료 템플릿  | $20~100 초기 비용, 유연성 낮음       | 무료 시작 + 단계적 유료 전환               |
| 기존 빌더    | 에디터 마찰 — 개발자에겐 과도한 조작 | 에디터 없이 AI가 구성, 생성 즉시 자동 배포 |

---

## 3. 솔루션 및 비즈니스 모델

### 3.1 핵심 가치 제안

| 가치                 | 설명                                                                                          |
| -------------------- | --------------------------------------------------------------------------------------------- |
| **즉시 자동 배포**   | GitHub 연동 후 AI가 포트폴리오를 구성하고, 사용자 확인 없이도 즉시 배포까지 완료              |
| **에디터 제로 마찰** | 드래그앤드롭 에디터 불필요. GitHub 데이터가 이미 구조화되어 있어 AI가 최적 구성을 결정        |
| **데이터 자동화**    | GitHub 연동으로 레포지토리·기여도·기술 스택 자동 수집, 수동 정리 시간 90% 절감                |
| **스마트 큐레이션**  | AI(GPT-4o-mini)가 README·package.json 분석 후 채용 담당자 선호도 기반 최적 프로젝트 선별·배열 |
| **선택적 미세 조정** | 배포 후 원하는 경우에만 블록 ON/OFF·순서·테마를 조정. 조정 내용은 즉시 배포 페이지에 반영     |

### 3.2 사용 가능 조건 (진입 요건)

| 조건           | 내용                        | 미충족 시 처리                                 |
| -------------- | --------------------------- | ---------------------------------------------- |
| GitHub 계정    | GitHub OAuth 로그인 필수    | 로그인 페이지로 리다이렉트                     |
| **GitHub bio** | GitHub 프로필 bio 등록 필수 | `/onboarding/bio` 안내 페이지 → 등록 후 재확인 |

### 3.3 운영 모델

| 항목            | 내용                                                                                 |
| --------------- | ------------------------------------------------------------------------------------ |
| **가격 정책**   | **완전 무료** — 누구나 제한 없이 포트폴리오를 생성하고 배포할 수 있습니다.           |
| **운영 목적**   | 개발자 커뮤니티 기여 및 개인 프로젝트 쇼케이스 활성화                                |
| **크레딧 정책** | AI 생성 기능은 무제한 이용 가능 (안정적 운영을 위해 시간당 생성 횟수 제한 적용 예정) |

---

## 4. 타겟 사용자

### 4.1 사용자 분류

| **대상** | 모든 개발자 | 부트캠프 수료생·취준생 | 퍼스널 브랜딩 시니어 개발자 |
| **연차** | 제한 없음 | 0~1년 | 8년 이상 |
| **핵심 니즈** | 시간 절약 + 자동화 | 스토리텔링 차별화 | 전문성 + 방문자 분석 |
| **진입 요건** | GitHub 계정 + bio 등록 | GitHub 계정 + bio 등록 | GitHub 계정 + bio 등록 |

### 4.2 상세 페르소나

#### 👤 페르소나 A — 이직 희망자 강민준 (31세, 4년차 백엔드)

- GitHub bio: `"Backend Engineer. Java/Spring Boot/PostgreSQL. Interested in distributed systems."`
- 핵심 니즈: 퇴근 후 정리 시간 없음 → **연결하면 바로 나오면 좋겠다**
- 시나리오: GitHub 연동 → AI 자동 분석 → 즉시 배포 URL → 이력서 첨부 → (선택) 테마 변경

#### 👤 페르소나 B — 취준생 이지수 (26세, 부트캠프 수료)

- GitHub bio: `"Frontend Developer. React/TypeScript. UX-focused. Open to work."`
- 핵심 니즈: **일단 빠르게 하나 완성하고 싶다**
- 시나리오: bio 기반 hero 자동 생성 → 3개 레포 요약 → 즉시 배포 → (선택) LinkedIn URL 추가

#### 👤 페르소나 C — 프리랜서 박성진 (38세, 12년차 풀스택)

- GitHub bio: `"Fullstack Engineer & Consultant. 12yr exp. Node/React/AWS. Open-source contributor."`
- 핵심 니즈: 미팅 전 URL 즉시 전달, 방문자 통계 확인
- 시나리오: 즉시 배포 → 미팅 전날 URL 전달 → 커스텀 도메인 연결 (Phase 2)

---

## 5. 핵심 기능 명세

### 5.1 GitHub bio 기반 진입 검증

- bio `null` → `/onboarding/bio` 리다이렉트
- GitHub 설정 링크 제공 + bio 작성 예시 제공
- "등록 완료했어요" 버튼 → bio 재확인 → 확인되면 `/dashboard`

### 5.2 데이터 자동 수집 모듈

- GitHub OAuth 토큰으로 레포지토리, 기여도, 언어 분포 수집
- RSS 피드로 블로그 포스팅 연동
- Rate Limit 대응: Redis TTL 1h 캐싱 + Webhook 증분 업데이트

### 5.3 AI 기반 포트폴리오 즉시 자동 생성 및 배포

자동 생성 블록:

| 블록           | 생성 기반                          | 필수 여부 |
| -------------- | ---------------------------------- | --------- |
| `hero`         | GitHub bio + name + AI 요약        | 필수      |
| `project_grid` | ai_score 상위 4개 레포 (fork 제외) | 필수      |
| `skills`       | 언어 분포 + package.json 분석      | 필수      |
| `contact`      | GitHub 이메일 + github_url         | 필수      |
| `blog_feed`    | RSS 연동 시 자동 추가              | 선택      |

### 5.4 배포 후 선택적 미세 조정

MVP에서 가능한 것: 블록 ON/OFF 토글, 블록 순서 조정, 테마 선택 6종, 선택적 정보 보완  
Phase 2에서 가능: 블록 내부 직접 편집, 새 블록 추가·삭제, 디자인 토큰 세부 편집

### 5.5 디자인 시스템

| 레벨    | 명칭                | 기능                                                             | 적용 단계 |
| ------- | ------------------- | ---------------------------------------------------------------- | --------- |
| Level 1 | 테마 선택기         | 6개 프리셋 (Minimalist, Creative, Corporate, Dark, Pastel, Tech) | MVP       |
| Level 2 | 디자인 토큰 편집기  | 색상 팔레트, 타이포그래피, Spacing, Border Radius                | Phase 2   |
| Level 3 | 고급 CSS 편집 (Pro) | CSS-in-JS 지원, 컴포넌트별 스타일 오버라이드                     | Phase 3   |

---

## 6. 개발 로드맵

### ⚙️ 개발 공통 원칙 (모든 Phase에 적용)

> 아래 원칙은 Phase 1부터 Phase 3까지 **모든 개발 단계에서 예외 없이 적용**합니다.

#### Next.js 16 문법 필수 준수

Next.js 16에서 `params`, `searchParams`, `cookies()`, `headers()`가 모두 **비동기(Promise)** 로 변경되었습니다.  
구버전 문법 사용 시 빌드가 실패하므로 반드시 아래 패턴을 사용합니다.

```typescript
// ✅ Page / Layout — params, searchParams 반드시 await
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

// ✅ Route Handler — params 반드시 await
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
}

// ✅ next/headers — 반드시 await
import { cookies, headers } from "next/headers";
const cookieStore = await cookies();
const headersList = await headers();

// ✅ 라우터 / 리다이렉트 / 404 — next/navigation에서만 import
import { useRouter, redirect, notFound } from "next/navigation";
```

#### Task 완료 시 빌드·린트 검사 필수

모든 Task 단위 구현이 완료될 때마다 아래 두 명령을 순서대로 실행합니다.  
**두 명령 모두 성공한 후에만 커밋을 작성합니다.**

```bash
npm run lint   # ESLint: 문법 오류, 미사용 변수, Next.js 16 호환성 등 검출
npm run build  # TypeScript 컴파일 + Next.js 전체 빌드 검사
```

| 에러 유형                    | 처리 방법                                            |
| ---------------------------- | ---------------------------------------------------- |
| ESLint warning               | 즉시 수정. `eslint-disable` 주석으로 억제 금지       |
| ESLint error                 | 반드시 수정. `// eslint-disable-next-line` 사용 금지 |
| TypeScript 타입 에러         | `any` 캐스팅 우회 금지. 올바른 타입으로 해결         |
| Next.js 16 params await 누락 | 즉시 `await params` 패턴으로 수정                    |
| 빌드 에러                    | 수정 완료 후 재빌드로 반드시 확인                    |

#### Task 완료 시 Git 커밋 필수

`npm run lint && npm run build` 성공 직후, **Task 단위마다** 커밋을 작성합니다.

```bash
# 커밋 순서
npm run lint && npm run build  # 반드시 먼저 성공 확인
git add .
git commit -m "<type>(<scope>): <설명>"
```

**커밋 메시지 형식 (Conventional Commits)**

```
<type>(<scope>): <설명>
```

| type       | 사용 시점        | scope 예시                                   |
| ---------- | ---------------- | -------------------------------------------- |
| `feat`     | 새 기능          | `github`, `portfolio`, `block`, `ai`, `auth` |
| `fix`      | 버그 수정        | `analytics`, `theme`, `db`, `api`, `ui`      |
| `refactor` | 구조 개선        | `infra`, `auth`, `portfolio`                 |
| `chore`    | 빌드·패키지·환경 | `infra`, `db`                                |
| `docs`     | 문서·주석        | —                                            |
| `perf`     | 성능 개선        | `ai`, `github`                               |

```bash
# 커밋 예시
git commit -m "feat(github): GitHub bio 검증 API 및 미등록 차단 플로우 구현"
git commit -m "fix(portfolio): 포트폴리오 생성 완료 후 revalidation 누락 수정"
git commit -m "refactor(infra): Next.js 16 params await 패턴으로 전체 마이그레이션"
git commit -m "chore(db): analytics_events 테이블 월별 파티셔닝 인덱스 추가"
git commit -m "fix(infra): next/headers cookies() await 누락 빌드 에러 수정"
```

> ⚠️ **금지 사항**
>
> - lint / build 실패 상태로 커밋 — 절대 금지
> - 여러 Task를 하나로 묶어서 커밋 — 금지. Task별로 분리
> - `any` 타입 캐스팅으로 타입 에러 우회 — 금지
> - `eslint-disable` 주석으로 경고 억제 — 금지

---

### Phase 1 — MVP (6주): "GitHub 연동 후 즉시 포트폴리오 자동 생성·배포"

| 주차  | 주제                  | 핵심 태스크                                                                                                                    |
| ----- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 1–2주 | 기반 아키텍처         | NextAuth + GitHub OAuth, bio 검증 미들웨어 + `/onboarding/bio`, Prisma 스키마 마이그레이션, GitHub API 동기화 + Redis 캐싱     |
| 3–4주 | 자동 생성 + 즉시 배포 | 4단계 플로우 UI, `POST /api/portfolios/generate` + 즉시 배포, 폴링 UX, 완료 화면(URL 발급), 선택적 `?step=adjust` UI, 테마 3종 |
| 5–6주 | 출력 파이프라인       | Output Layer ISR 렌더링, 서브도메인 라우팅(`slug.portfolioforge.app`), on-demand revalidation, 기본 SEO, Lighthouse 90+ 달성   |

> ⚠️ **MVP 범위 제외**
>
> - WYSIWYG 에디터 (dnd-kit 블록 편집) → Phase 2
> - 방문자 분석 대시보드 → Phase 2
> - 커스텀 도메인 → Phase 2
> - 디자인 토큰 세부 편집 → Phase 2
> - 런타임 접근성 경고 → Phase 2

---

### Phase 2 — 에디터 도입 및 고도화 (4주)

- WYSIWYG 에디터 (dnd-kit 기반 블록 편집)
- 방문자 분석 대시보드 (블록 인게이지먼트, 레퍼러, 전환율)
- 블로그 RSS 피드 연동 (Tistory, Velog, Medium, custom RSS)
- 커스텀 도메인 연동 (Vercel Domains API)
- 디자인 토큰 편집기 (색상·폰트·spacing)
- 런타임 접근성 경고 (색상 대비도 사용자 알림)

---

### Phase 3 — 확장 고도화 (진행 중)

- **[완료]** CV/이력서 PDF 내보내기 (Puppeteer 기반) — `api/export/pdf?slug=[slug]`
- **[완료]** 고급 CSS 편집
- **[완료]** 다국어 지원 (i18next 기반 KO/EN 전환)
- **[완료]** SEO 고도화 (JSON-LD 및 sitemap.xml 자동 생성)

---

## 7. 차별화 전략

### 7.1 경쟁사 기능 비교

| 기능                  | PortfolioForge | GitHub Pages | Notion  | 유료 템플릿 |
| --------------------- | :------------: | :----------: | :-----: | :---------: |
| 데이터 자동화         |       ✅       |      ❌      |   ⚠️    |     ❌      |
| 에디터 없는 즉시 배포 |       ✅       |      ❌      |   ❌    |     ❌      |
| AI 큐레이션           |       ✅       |      ❌      |   ❌    |     ❌      |
| SEO 최적화            |       ✅       |      ⚠️      |   ❌    |     ⚠️      |
| 방문자 분석           |       ✅       |      ❌      |   ❌    |     ❌      |
| 접근성 검사           |       ✅       |      ❌      |   ❌    |     ⚠️      |
| **비용**              |      무료      |     무료     | 무료~$8 |  $20~$100   |

### 7.2 고유 가치 제안

- **에디터 없는 즉시 배포**: bio + README + package.json → 5분 내 완성 및 즉시 배포
- **Context-Aware 큐레이션**: bio 기반 직군 맥락 반영 프로젝트 배열
- **지속적 업데이트**: GitHub Webhook 기반 자동 동기화

---

## 8. 포트폴리오 전략

### 8.1 이 프로젝트로 증명할 역량

| 역량 분류         | 세부 항목                                                                                              |
| ----------------- | ------------------------------------------------------------------------------------------------------ |
| **기술적 깊이**   | GitHub OAuth + 외부 API 통합, AI 파이프라인 설계 (프롬프트 → 캐싱 → 비용 최적화), TypeScript 고급 활용 |
| **문제 해결**     | GitHub API Rate Limit 핸들링, 비동기 Job 폴링 UX, ISR 캐시 전략, 즉시 배포 자동화                      |
| **프로덕트 센스** | 에디터 제거로 마찰 최소화, 즉시 배포 기본값 설계, 배포 후 선택적 조정 UX                               |

### 8.2 GitHub 저장소 구성

```
portfolio-forge/
├── README.md
├── CHANGELOG.md
├── PLANNING.md       ← 이 문서
├── GEMINI.md         ← 기술 스택 및 아키텍처
├── docs/
│   ├── ARCHITECTURE.md
│   ├── API.md
│   └── DEPLOYMENT.md
└── src/
    ├── core/
    ├── generate/
    ├── integrations/
    ├── preview/
    └── utils/
```

---

## 9. KPI 및 성공 지표

### 9.1 제품 메트릭

| 구분            | 지표                      | 목표          | 측정 방법                   |
| --------------- | ------------------------- | ------------- | --------------------------- |
| **진입 퀄리티** | bio 등록 후 배포 완료율   | > 80%         | `portfolios.is_published`   |
|                 | 즉시 배포율               | > 90%         | auto_publish 완료율         |
|                 | bio 안내 이탈률           | < 30%         | `/onboarding/bio` 이탈 추적 |
| **사용자 참여** | 평균 세션 시간            | > 5분         | 자체 analytics_events       |
|                 | GitHub 연동률             | > 95%         | integrations 테이블         |
|                 | 배포 후 미세 조정 진입률  | > 40%         | `?step=adjust` 전환율       |
| **기술 성능**   | Lighthouse 점수           | > 90          | CI/CD 자동 측정             |
|                 | API 응답 시간             | < 200ms (p95) | Vercel Analytics            |
|                 | 자동 생성 + 배포 소요시간 | < 30초        | Job 완료 시간 측정          |
|                 | 에러 발생률               | < 0.1%        | Sentry (무료 티어)          |

### 9.2 비즈니스 메트릭 (3개월 목표)

| 지표                   | 목표      | 전략                                        |
| ---------------------- | --------- | ------------------------------------------- |
| MAU (월간 활성 사용자) | 1,000명   | 개발자 커뮤니티(오픈카톡, Reddit, X) 바이럴 |
| 무료 추천율            | 10%       | 포트폴리오 하단 "Made with PortfolioForge"  |
| NPS (순추천지수)       | > 40      | 연동 후 즉시 배포 WOW 모멘트                |
| 채용 성공 사례 수집    | 50건 이상 | 사용자 인터뷰 + 소셜 인증 배지 기능         |
