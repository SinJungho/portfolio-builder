당신은 PortfolioForge 프로젝트의 시니어 풀스택 엔지니어입니다.
첨부된 PLANNING.md와 GEMINI.md를 완전히 숙지한 상태에서 아래 작업을 순서대로 수행하세요.

---

## 프로젝트 컨텍스트 요약

- **서비스**: GitHub 연동 → AI 분석 → 포트폴리오 즉시 자동 생성·배포 플랫폼
- **기술 스택**: Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui + Zustand + TanStack Query + Prisma + Neon PostgreSQL
- **현재 상태**: GitHub 연동 → 실시간 분석 → AI 생성 → 배포로 이어지는 백엔드/자동화 파이프라인(Phase 1~3)은 완성됨
- **남은 작업**: 프론트엔드 UI 3개 화면 + 마무리 보완

---

## 작업 1: 미세 조정(Adjust) UI — `app/generate/[id]/steps/adjust.tsx`

### 배경

- 현재 이 파일에는 더미(Placeholder) UI만 존재함
- 포트폴리오가 즉시 자동 배포된 _이후_ 사용자가 선택적으로 진입하는 화면
- "재배포" 버튼은 절대 없음 — 모든 변경은 변경 즉시 on-demand revalidation으로 배포 페이지에 자동 반영됨

### 구현 요구사항

**1-1. Zustand 스토어 연동**
`usePortfolioStore`에서 다음 액션을 사용하여 UI를 구성하세요:

- `toggleBlock(blockId)` → 블록 표시/숨김 토글
- `reorderBlocks(fromIndex, toIndex)` → 블록 순서 변경
- `setTheme(theme)` → 테마 변경
- `updateOptionalField(field, value)` → 선택적 보완 필드 업데이트

**1-2. 블록 목록 패널 (좌측)**

- `usePortfolioStore`에서 `blocks` 배열을 가져와 리스트로 렌더링
- 각 블록 카드에 포함할 요소:
  - 블록 타입 아이콘 (hero → User, project_grid → Grid, skills → BarChart, contact → Mail, blog_feed → Rss) — Lucide React 사용
  - 블록 이름 한글 레이블 (hero → "소개", project_grid → "프로젝트", skills → "기술 스택", contact → "연락처", blog_feed → "블로그")
  - `is_visible` 상태를 반영하는 토글 스위치 (shadcn/ui `Switch` 컴포넌트) → 변경 시 `toggleBlock` 호출 + `PATCH /api/portfolios/:id/blocks/:blockId` 즉시 호출
  - 순서 변경을 위한 ↑ / ↓ 버튼 → `reorderBlocks` 호출 + `PUT /api/portfolios/:id/blocks` 즉시 호출
  - `is_ai_generated: true`인 블록에는 "AI 생성" 뱃지 표시

**1-3. 테마 선택 패널 (우측 상단)**
PLANNING.md의 6개 프리셋을 카드 그리드로 표시:

- Minimalist, Creative, Corporate, Dark, Pastel, Tech
- 현재 선택된 테마는 강조 테두리로 표시
- 선택 시 `setTheme` 호출 + `PATCH /api/portfolios/:id` 즉시 호출
- 각 테마 카드에는 미니 색상 팔레트 스와치 3개 표시

**1-4. 선택적 보완 패널 (우측 하단)**
TanStack Query로 `GET /api/portfolios/generate/:job_id`의 `missing_optional_fields`를 조회하여,
미등록 항목에 대해 인라인 입력 카드를 렌더링:

- `email` → 이메일 입력 필드
- `linkedin_url` → LinkedIn URL 입력 필드
- `website_url` → 개인 웹사이트 URL 입력 필드
- 입력 후 포커스 아웃(onBlur) 시 `updateOptionalField` + `PATCH /api/portfolios/:id/blocks/:contactBlockId` 자동 저장
- 저장 완료 시 shadcn/ui `toast`로 "저장되었습니다" 알림

**1-5. 상단 헤더 바**

- 좌측: "← 대시보드로" 링크
- 중앙: 배포된 URL (`{slug}.portfolioforge.app`) — 클릭 시 새 탭 오픈
- 우측: "배포 URL 복사" 버튼 (Clipboard API), "포트폴리오 보기" 버튼

**1-6. API 호출 패턴**
모든 변경은 낙관적 업데이트(optimistic update) 방식으로 처리하세요:

1. `usePortfolioStore` 로컬 상태 즉시 반영
2. TanStack Query `useMutation`으로 API 비동기 호출
3. 실패 시 로컬 상태 롤백 + `toast` 에러 알림

---

## 작업 2: 퍼블릭 포트폴리오 뷰어 — `app/[slug]/page.tsx` 및 블록 컴포넌트

### 배경

- ISR 렌더링 (`revalidate: 60`) 적용된 공개 페이지
- `portfolioforge.app/{slug}` URL로 접근하는 최종 결과물
- Output Layer와 미세 조정 미리보기는 동일한 `<PortfolioPreview>` 컴포넌트를 공유해야 함
- WCAG 2.1 색상 대비도 기준 충족 필수

### 구현 요구사항

**2-1. `app/[slug]/page.tsx` — ISR 서버 컴포넌트**

```typescript
// 구현할 로직
export const revalidate = 60;

export async function generateMetadata({ params }) {
  // portfolios + users 조인으로 seo_title, seo_description, og_image_url 조회
  // og:image, twitter:card 메타태그 자동 생성
}

export default async function PortfolioPage({ params }) {
  // slug로 portfolio + portfolio_blocks + raw_projects 조회
  // is_published: false면 notFound() 반환
  // is_visible: false인 블록은 필터링하여 렌더링에서 제외
  // position 기준 오름차순 정렬
  // <PortfolioPreview> 컴포넌트에 데이터 전달
}
```

**2-2. `src/preview/PortfolioPreview.tsx` — 공유 컴포넌트**

- 미세 조정 화면(`?step=adjust`)과 퍼블릭 뷰어(`/[slug]`) 양쪽에서 사용
- `blocks`, `theme`, `designTokens`를 props로 받아 렌더링
- 테마별 CSS 변수를 루트에 적용 (Minimalist, Creative, Corporate, Dark, Pastel, Tech 각각 정의)

**2-3. 블록별 렌더링 컴포넌트 (각각 독립 파일로)**

`src/preview/blocks/HeroBlock.tsx`:

- `headline` (이름), `subheadline` (AI 생성 소개 문구) 표시
- GitHub avatar 이미지 (next/image 최적화)
- `show_github_stats: true`이면 GitHub 기여도 히트맵 시각화 (단순 SVG 또는 캘린더 그리드)
- 배경: 테마별 그라디언트 또는 패턴 적용

`src/preview/blocks/ProjectGridBlock.tsx`:

- `project_ids`로 `raw_projects` 테이블에서 프로젝트 데이터 조회
- `layout: 'grid'` → CSS Grid, `'list'` → 세로 리스트
- 각 카드: 프로젝트명, `ai_summary`, 기술 태그(`ai_tags`), GitHub 링크, ⭐ star 수
- 카드 hover 시 살짝 올라오는 애니메이션 (Tailwind `hover:scale-105 transition-transform`)

`src/preview/blocks/SkillsBlock.tsx`:

- `chart_type: 'radar'` → Recharts `RadarChart` (shadcn/ui 차트 래퍼 사용)
- `chart_type: 'bar'` → Recharts `BarChart`
- `chart_type: 'tag_cloud'` → 폰트 사이즈 가중치 기반 태그 클라우드 (CSS만으로 구현)
- 모든 차트는 반응형 (`ResponsiveContainer`)

`src/preview/blocks/ContactBlock.tsx`:

- GitHub URL, 이메일, LinkedIn URL, 웹사이트 URL 버튼 렌더링
- 없는 필드는 렌더링하지 않음
- 클릭 시 `POST /api/analytics/event` (event_type: 'contact_click') 자동 전송
- 아이콘: Lucide React (Github, Mail, Linkedin, Globe)

`src/preview/blocks/BlogFeedBlock.tsx`:

- `feed_items` 테이블에서 `integration_provider` 기준으로 최신 `max_items`개 조회
- 썸네일 있으면 이미지 표시 (`show_thumbnail: true`)
- 포스팅 제목, 발행일, 외부 링크 표시

**2-4. 방문자 이벤트 수집**

- 페이지 진입 시 자동으로 `POST /api/analytics/event` 호출 (event_type: 'page_view')
- 클라이언트 컴포넌트 `<AnalyticsTracker portfolioId={id} />` 분리 구현
- `session_id`는 `sessionStorage`에 UUID v4로 생성·저장

---

## 작업 3: 대시보드 화면 — `app/(dashboard)/dashboard/page.tsx`

### 배경

- 로그인한 사용자가 포트폴리오를 관리하는 메인 작업 공간
- PLANNING.md의 "재방문 사용자 처리 플로우" 반영 필수
- Free 플랜 사용자가 포트폴리오 1개 보유 시 "새 포트폴리오 만들기" 버튼 비활성화 + 업그레이드 유도

### 구현 요구사항

**3-1. 포트폴리오 카드 목록**
TanStack Query로 `GET /api/portfolios` 호출하여 카드 그리드 렌더링.
각 카드에 포함:

- 포트폴리오 이름 + slug
- 배포 상태 뱃지 (is_published: true → 초록 "배포 중" / false → 회색 "미배포")
- 테마 뱃지
- 생성일 (상대 시간, 예: "3일 전")
- 버튼 3개:
  - "포트폴리오 보기" → `{slug}.portfolioforge.app` 새 탭 오픈
  - "미세 조정" → `/generate/{id}?step=adjust` 이동
  - "삭제" → `DELETE /api/portfolios/:id` 호출 + 확인 다이얼로그 (shadcn/ui `AlertDialog`)

**3-2. "새 포트폴리오 만들기" CTA**

- Free 플랜 + 포트폴리오 0개: 눈에 띄는 CTA 카드 (점선 테두리 + Plus 아이콘)
- Free 플랜 + 포트폴리오 1개 이상: 버튼 비활성화 + "Pro로 업그레이드하면 무제한 생성 가능" 툴팁
- Pro 플랜: 항상 활성화
- 클릭 시: `POST /api/portfolios` 호출 → 성공 시 `/generate/{portfolio_id}` 이동

**3-3. GitHub 연동 상태 배너**
페이지 상단에 연동 상태 확인:

- GitHub 미연동: 주황 배너 "GitHub 연동이 필요합니다" + "연동하기" 버튼
- GitHub bio 미등록: 노란 배너 "GitHub bio를 등록하면 포트폴리오 품질이 향상됩니다" + 설정 링크
- 마지막 동기화 시간 표시 (`synced_at` 기준, 예: "1시간 전 동기화됨")

**3-4. AI 크레딧 현황 (Free 플랜)**

- 사이드바 하단 또는 헤더에 크레딧 잔량 표시: "이번 달 생성 횟수: 2/3회 사용"
- `ai_credits` 0이면 주황 경고 + "Pro로 업그레이드" 링크

**3-5. 빈 상태(Empty State)**
포트폴리오가 0개일 때:

- 일러스트 또는 아이콘 + "아직 포트폴리오가 없어요"
- "GitHub 연동하고 5분 만에 포트폴리오 만들기" CTA 버튼

---

## 작업 4: 마무리 보완 사항

**4-1. 생성 완료 화면 개선 (`app/generate/[id]/steps/generate.tsx`)**
Phase 03 완료 시 보여주는 화면:

- 배포된 URL을 크고 눈에 띄게 표시 (shadcn/ui `Card` + 복사 버튼)
- "포트폴리오 보기" 버튼 (primary) + "미세 조정하기" 버튼 (secondary)
- `missing_optional_fields`가 있으면 "💡 이메일과 LinkedIn을 추가하면 더 완성도 높은 포트폴리오가 됩니다" 인라인 안내
- 소셜 공유 버튼 (Twitter/X, LinkedIn) — 공유 텍스트: "GitHub으로 포트폴리오를 5분 만에 만들었어요! 👉 {url}"

**4-2. `/onboarding/bio` 페이지 품질 개선**
현재 안내 페이지가 부정적으로 보이지 않도록:

- 타이틀: "포트폴리오를 더 잘 만들기 위한 마지막 준비 단계예요 👋"
- GitHub bio 작성 예시 3가지 (백엔드, 프론트엔드, 풀스택 각각):
  - `"Backend Engineer. Java/Spring Boot/PostgreSQL. Interested in distributed systems."`
  - `"Frontend Developer. React/TypeScript. UX-focused. Open to work."`
  - `"Fullstack Engineer. Node.js/React/AWS. Open-source contributor."`
- 예시 클릭 시 클립보드 복사
- GitHub 설정 페이지 직접 링크: `https://github.com/settings/profile`
- "등록 완료했어요" 버튼 → `GET /api/integrations/github/bio` 재호출 → bio 확인 시 `/dashboard` 이동

**4-3. 전역 에러 처리 및 로딩 상태**

- `app/error.tsx` (글로벌 에러 바운더리)
- `app/loading.tsx` (글로벌 로딩 스켈레톤)
- `app/(dashboard)/dashboard/loading.tsx` — 포트폴리오 카드 스켈레톤 (shadcn/ui `Skeleton`)
- TanStack Query `isError` 상태에 shadcn/ui `Alert` 컴포넌트로 에러 안내

**4-4. 반응형 레이아웃 검증**

- 대시보드 사이드바: 모바일(< 768px)에서 하단 탭 메뉴로 전환 (shadcn/ui `Sheet` 활용)
- `/[slug]` 퍼블릭 뷰어: 모바일에서 ProjectGrid columns를 1로 자동 축소
- 미세 조정 화면: 모바일에서 좌/우 패널을 탭 형태로 전환

---

## 구현 시 반드시 지켜야 할 원칙

1. **"재배포" 버튼은 절대 만들지 마세요.** 모든 변경은 즉시 revalidation으로 자동 반영됩니다.
2. **블록 직접 추가/삭제 UI는 MVP 범위 외입니다.** `is_visible` 토글과 `position` 순서 변경만 구현하세요.
3. **`<PortfolioPreview>` 컴포넌트는 반드시 하나로 통일하세요.** 미세 조정 미리보기와 `/[slug]` 퍼블릭 뷰어가 동일 컴포넌트를 재사용해야 "보이는 것 = 실제 결과물"이 보장됩니다.
4. **모든 API 요청은 TanStack Query (`useQuery`, `useMutation`)를 사용하세요.** 직접 `fetch` 호출은 지양합니다.
5. **shadcn/ui 컴포넌트 우선 사용.** 커스텀 컴포넌트는 shadcn/ui로 충당 불가한 경우에만 작성하세요.
6. **TypeScript strict 모드 유지.** `any` 타입 사용 금지. GEMINI.md의 Zod 스키마(`BlockConfigSchema`, `DesignTokenSchema`)를 재사용하세요.
7. **GitHub bio는 항상 존재한다고 가정하세요.** 미세 조정 화면 및 퍼블릭 뷰어 진입 시점에는 bio 검증이 완료된 상태입니다.

---

## 작업 순서 권장

1. `src/preview/PortfolioPreview.tsx` + 블록 컴포넌트 5개 (공유 기반 컴포넌트 먼저)
2. `app/[slug]/page.tsx` (ISR 퍼블릭 뷰어)
3. `app/generate/[id]/steps/adjust.tsx` (미세 조정 UI)
4. `app/(dashboard)/dashboard/page.tsx` (대시보드)
5. 마무리 보완 4가지

각 파일 작성 후 TypeScript 컴파일 오류가 없는지 확인하고 다음 파일로 넘어가세요.
