# 디자인 리뉴얼 프롬프트 (PortfolioForge 전용)

`design-taste-frontend` 스킬을 이 프로젝트에 물릴 때 그대로 복사해서 쓰는 프롬프트다.
`<>` 부분만 채우고 나머지는 프로젝트 사실이라 건드리지 않는다.

---

## 복사해서 쓰는 본문

```
design-taste-frontend 스킬을 유일한 디자인 규칙 소스로 로드했다. 한국어로 답한다.

브리프
- 저장소: /Users/sinjungho/Project/portfolio-builder (Next.js App Router + TypeScript + Tailwind + shadcn/ui)
- 대상 범위: <예: src/app/(marketing) 전체 / (dashboard)/editor / src/preview 렌더러>
- 모드: <preserve / overhaul / 모르겠음>
- 사용자: <예: 개발자 취업준비생 — GitHub는 있는데 포트폴리오 페이지가 없는 사람>
- 지금 잘 되는 것: <2~3개>
- 지금 깨진 것: <2~3개>
- SEO 제약: <바꾸면 안 되는 라우트/헤딩/앵커>

브랜드 사실 (변경 금지, 내가 명시로 승인하기 전까지)
- 제품명 PortfolioForge, 로고 처리 그대로.
- 시각 정체성은 Spotify 다크 계열: 배경 #121212 계열, 액센트 그린 #1ED760.
  액센트는 기능(CTA·프로그레스·활성/포커스)에만. 배경·장식에 쓰지 않는다.
- 카드는 그림자가 아니라 면 명도 + 1px 헤어라인으로 구분(플랫 엘리베이션).
- 본문 폰트 Pretendard, 기본 토큰은 src/preview/themes.ts의 DEFAULT_DESIGN_TOKENS.
- 앱 크롬의 토큰 소스는 src/styles/globals.css (--primary: #1ed760, --color-spotify-*).
  포트폴리오 렌더러의 토큰 소스는 src/preview/themes.ts. 충돌하면 이 둘이 정답이다.
- 하드코딩 hex 금지. 앱 UI는 shadcn 토큰(bg-card, text-primary, border-border 등)을 쓴다.
- 카피는 한국어, 사람이 쓴 말투. 마케팅 과장·AI 티 나는 문장 금지.

절대 조용히 바꾸지 않는 것
- URL 구조: /, /templates, /privacy, /terms, /login,
  /onboarding/bio, /generate, /generate/[id], /dashboard, /projects,
  /analytics, /settings, /settings/integrations, /editor/[id], /[slug]
- next.config.ts의 리다이렉트(/template → /templates, /blog·/features → /)
- Header/Sidebar/DashboardHeader/Footer의 내비 라벨과 링크 대상
- 폼 필드 name, Zod 스키마 키(src/schemas), API 응답 형태
- 퍼블릭 포트폴리오 렌더러가 읽는 토큰 키(ThemeTokens 인터페이스)
- src/app/sitemap.ts가 만드는 서브도메인 URL 규칙
- 법적 문구(/privacy, /terms)

1단계. 스킬 Section 11.B 감사를 글로 먼저 낸다. 코드는 아직 손대지 않는다.
- 실제로 쓰이는 브랜드 토큰 (primary, accent, 타입 스택, radius) — themes.ts와
  tailwind.config.ts, globals.css에서 실측
- 정보 구조 (라우트 트리, 내비, 전환 경로: 랜딩 → 로그인 → 온보딩 → 생성 → 에디터 → 발행)
- 지킬 패턴 (알아보는 히어로, 시그니처 인터랙션, 카피 톤)
- 버릴 패턴 (슬롭 신호, 깨진 레이아웃, 죽은 링크, 라이트/다크 혼용)
- 현재 사이트의 다이얼 추정치 (DESIGN_VARIANCE, MOTION_INTENSITY, VISUAL_DENSITY)
- SEO 베이스라인 (metadata title/description, 헤딩 구조, 앵커)
감사 끝나면 멈춘다.

2단계 (내 OK 후). 모드(Preserve / Overhaul / Greenfield-with-content-preserved)를
선언하고, Section 11.D 현대화 레버 중 무엇을 어떤 우선순위로 적용할지 쓴다. 멈춘다.

3단계 (내 OK 후). 구현한다. 위 "절대 조용히 바꾸지 않는 것"은 그대로 둔다.

4단계. 글로 낸다.
- em dash 감사 (Section 9.G)
- Pre-Flight Check (Section 14)
- 보존 감사: 바뀐 URL·내비 라벨·폼 필드·앵커 전부 나열. 내가 승인한 것 외에는 비어 있어야 한다.
- 브랜드 충실도 감사: #1ED760 액센트 규율, Pretendard 스택, 로고 처리가 살아남았는지 확인.
- 프로젝트 게이트: pnpm lint / pnpm test / pnpm build 통과. Lighthouse 예산(lighthouserc.js) 위반 없음.
하나라도 Fail이면 완료 아님.
```

---

## 채울 때 참고

**대상 범위 후보**

| 범위 | 경로 | 성격 |
|---|---|---|
| 마케팅 | `src/app/(marketing)`, `src/components/home` | 공개·SEO 민감, 카피 중요 |
| 인증/온보딩 | `src/app/(auth)/login`, `src/app/onboarding/bio` | 전환율, 폼 필드 고정 |
| 생성 플로우 | `src/app/generate/[id]/steps` | 다단계 상태, 모션 절제 |
| 대시보드/에디터 | `src/app/(dashboard)` | 밀도 높음, 도구 UI |
| 퍼블릭 렌더러 | `src/preview` | 테마 토큰 계약, 최종 산출물 |

**모드 고르기**
- 마케팅 카피/레이아웃만 손보면 → preserve
- 에디터·대시보드처럼 내부 도구를 통째로 다시 짜면 → overhaul
- 범위가 두 개 이상 걸치면 나눠서 두 번 돌린다. 한 번에 다 하면 감사가 무의미해진다.

**SEO 제약 기본값**
공개 라우트는 `/`, `/templates`, `/privacy`, `/terms`, `/[slug]`.
이 중 title/description/h1을 바꾸려면 프롬프트에 명시로 허용을 적는다. 적지 않으면 고정이다.
