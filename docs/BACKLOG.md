# 후속 작업 백로그

마케팅 표면에 대해 감사 → 구현 → critique → 후속 조치를 한 바퀴 돌리고 남은 것들이다.
최종 갱신 2026-08-07.

각 항목에 **검증 상태**를 붙였다. 이번 라운드에서 검출기가 올린 항목 중 상당수가 실제로는
오탐이었기 때문에, 이 구분이 없으면 다음 사람이 같은 함정에 빠진다.

- **확인됨** — 코드나 브라우저에서 직접 재현·측정함
- **미확인** — 보고는 됐지만 검증하지 않음
- **반증됨** — 확인해보니 문제가 아니었음. 아래 "하지 않기로 한 것" 참조

---

## 1. 처리 완료 (2026-08-07)

### 1.1 `MockPortfolio`의 torvalds 데이터 — 완료

`src/components/common/MockPortfolio.tsx`

히어로의 목업이 `react-github-calendar`로 **Linus Torvalds의 실제 GitHub 기여 데이터를
런타임에 가져온다**(184행 `username="torvalds"`). 그런데 176행의 총 기여 수는 하드코딩된
`1,428회`이고, 프로필 인물은 가상의 "김재민"이다.

세 문제가 겹쳐 있다.

1. 숫자와 그리드가 서로 무관하다. 방문자가 대조하면 어긋난다.
2. 마케팅 히어로가 매번 외부 네트워크 요청을 낸다. LCP 3.1초의 일부다.
3. 실존 인물의 활동 기록을 가상 인물의 것으로 보여준다.

정적 샘플 데이터로 대체했고, 표시 총합과 일치 여부를 테스트로 고정했다.
`react-github-calendar`와 전용 스타일, 전이 의존성(`react-activity-calendar`)도 제거했다.

### 1.2 생성 플로우 토큰 정리 — 완료

`src/app/generate`

- 라운드 스케일 이탈 **34곳** (`rounded-2xl` / `rounded-3xl` / `rounded-[Npx]`)
- 한글에 `uppercase` + 넓은 자간이 걸린 파일 4개
  — `DomainSettingsPanel.tsx`, `ProjectSelectionItem.tsx`, `SortableBlockItem.tsx`, `generate.tsx`

`uppercase`는 한글에 무효이고 1.4px 자간은 한글 조판을 깨뜨린다. 라틴 캡션에만 남겨야 한다.

기준은 마케팅에서 이미 정했다 — 카드/패널 `rounded-lg`(8px), 카드 안 작은 요소
`rounded-md`(6px), 버튼/배지/아바타 `rounded-full`. `src/styles/globals.css`의 radius 주석 참조.
생성 플로우의 이탈 반경을 토큰 3종으로 치환했고, 한글 캡션의 `uppercase`/넓은 자간을 제거했다.

**주의:** 생성 플로우는 Persuade가 아니라 **Operate 표면**이다. 마케팅 기준으로 감사하면
"밀도를 낮춰라"가 나오는데 도구 UI에서는 반대가 맞다. 토큰 3종만 맞추고 레이아웃은 건드리지 않는다.

### 1.3 에디터·대시보드 토큰 정리 — 완료

`src/app/(dashboard)` **48곳** + `src/components/features` **21곳**.
`ThemeSelector.tsx:112`에 한글 `uppercase` 1곳.

1.2와 같은 기준으로 이탈 반경과 `ThemeSelector`의 한글 캡션을 정리했다.

### 1.4 온보딩 잔여 — 완료

`src/app/onboarding/bio/page.tsx`의 `rounded-2xl` 2곳을 카드 토큰으로 치환했다.

### 1.5 `/templates`에 CTA 없음 — 완료

`src/app/(marketing)/templates/page.tsx`에 로그인으로 연결되는 “이 테마로 시작하기” CTA를 추가했다.

---

## 2. 사용자 입력 대기

### 2.1 법적 페이지 연락처 — 확인됨

`src/app/(marketing)/privacy/page.tsx:112`, `src/app/(marketing)/terms/page.tsx:96`

두 페이지 모두 **"연락처 미정. 서비스 공개 전 반드시 채워야 합니다."** 가 공개 노출 중이다.
주소를 지어내지 않으려고 의도적으로 눈에 띄게 뒀지만, 지금 상태로는 내부 메모가 샌 것으로 읽힌다.
실제 주소가 정해져야 해결된다.

상단의 "초안입니다. 법률 검토 전이며" 경고 배너도 검토 완료 시 함께 제거한다.

### 2.2 Pretendard OFL 고지 — 완료

웹폰트가 루트 레이아웃에서 번들에 포함되는 것을 확인했다. 원문 OFL-1.1을
`public/LICENSE-Pretendard.txt`로 함께 배포한다.

---

## 3. 제품 판단 필요

### 3.1 `DEFAULT_PORTFOLIO_THEME` 불일치 — 확인됨

`src/preview/themes.ts:37`은 `"minimal"`인데 `/templates`는 spotify를 플래그십으로 소개한다.

이건 실수가 아니다. `src/preview/__tests__/design-config.test.ts`가 "채용 친화·읽기 중심"이라는
이유로 `minimal`을 핀 고정하고 있다. 앱 크롬은 다크, 신규 포트폴리오 기본은 라이트라는 결정이다.

마케팅 소개를 기본값에 맞출지, 기본값을 바꿀지가 먼저 정해져야 한다.

### 3.3 채용 담당자 시점의 부재 — 완료

핵심 약속이 "채용 담당자가 빠르게 이해할 수 있는"인데, 마케팅 어디에도 심사자 시점이 없다.
사용자의 실제 공포는 심사받는 것인데 심사자를 한 번도 보여주지 않는다.

실제 채용 성과나 인용을 만들지 않고, 검토자가 한 화면에서 확인하는 정보 구조를 예시 화면으로 추가했다.
모든 인물·프로젝트 데이터는 “예시”로 명시한다.

---

## 4. 하지 않기로 한 것

근거 없이 지우면 누군가 다시 목록에 올린다.

### `/templates` 첫 화면 영구 암전 — 반증됨

critique의 디자인 리뷰가 P0으로 올렸고 재현도 됐다. scrollY=0에서 h1(top=160)과
카드(top=380)가 모두 `opacity: 0`, 3초 뒤에도 동일.

그러나 같은 탭에서 **옵션을 달리한 IntersectionObserver 4종(default / threshold 0.15 /
rootMargin / rootMargin 0px)이 전부 콜백을 내지 않았다.** 828px 뷰포트 안 top=160·height=140
요소는 어떤 설정에서도 교차 상태이고, 정상 IO라면 관측 즉시 초기 콜백이 온다.
즉 그 탭에서 IO 콜백 전달 자체가 멈춰 있었다 — **백그라운드 탭 스로틀링이지 앱 버그가 아니다.**

> **다음에 자동화 브라우저에서 빈 화면을 보면 이 프로브부터 돌린다.**
> 옵션이 다른 IO 여러 개를 걸어 하나라도 콜백이 오는지 확인한다. 전부 침묵하면 harness 문제다.

`src/hooks/useReveal.ts`에는 별개로 동기 초기 검사를 넣어 두었다(JS 실패 대비).

### 11px 미만 텍스트 68곳 — 축소됨

브라우저 검출기가 `/`에서 68건을 올렸지만, 실제 위치는 `StepVisualCustomize`(10)
`StepVisualDeploy`(6) `StepVisualAnalyze`(2) `MockPortfolio`(2)로 **전부 축소된 UI를 묘사하는
목업 내부 텍스트**다. 작은 글자가 곧 그 목업의 표현이다.

사용자가 실제로 읽는 UI 텍스트 대상은 히어로의 "예시" 배지 하나뿐이었고 이미 11px로 올렸다.

### 시맨틱 색 사용 16곳 — 정당

`#539df5`/`#ffa42b` 사용처를 전수 확인한 결과 전부 정당한 시맨틱 사용이다 — 동기화 지연 경고,
DNS 대기, 접근성 알림, 안내 패널. `StepVisualCustomize`의 색상 스와치도 제품의 컬러 피커를
묘사하는 샘플이라 정당하다.

### `dark-glow` 21건 — 검출기 예외 후보

대부분 `#1ed760` 유색 그림자다. `DESIGN.md`가 명시적으로 허용한 표현이라 룰과 브랜드가
충돌하는 지점이다. 코드가 아니라 `.impeccable/critique/ignore.md`에 등록할 후보.

### `src/preview` · 인증 라운드 정리 — 불필요

이탈 0건. `src/preview`는 자체 토큰 계약(`ThemeTokens.cardRadius`)을 쓰고 있어 이미 일관적이다.

---

## 5. 기준선

다음 라운드에서 회귀를 판단할 기준이다. 2026-08-07 측정.

| 항목 | 값 |
|---|---|
| Lighthouse 성능 | 94 |
| Lighthouse 접근성 | 100 |
| Lighthouse 모범사례 | 96 |
| Lighthouse SEO | 91 |
| LCP | 3.1초 |
| CLS | 0 |
| 홈 페이지 길이 | 6.3뷰포트 (1920px) |
| 제목 레벨 건너뜀 | 0건 (`/` `/templates` `/privacy` `/terms`) |
| `href="#"` 죽은 링크 | 0건 |
| 375px 가로 오버플로 | 0건 |
| 최저 텍스트 대비 | 8.12:1 |

재측정:

```bash
npx --yes @lhci/cli@0.14.x autorun
```

`lighthouserc.js`가 4개 카테고리 각 0.9를 error로 걸어 두어, 임계값 아래로 떨어지면 실패한다.

---

## 관련 문서

- `docs/DESIGN_TASTE_PROMPT.md` — 디자인 감사 프로토콜과 보존 규칙
- `.impeccable/critique/2026-08-07T03-01-03Z__src-app-marketing.md` — 이 백로그의 출처가 된 감사 기록
- `PRODUCT.md` — 제품 원칙과 근거 있는 주장만 쓴다는 규칙
- `DESIGN.md` — Spotify 파생 디자인 시스템
