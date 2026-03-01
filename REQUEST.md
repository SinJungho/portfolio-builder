코드를 보니 몇 가지 원인이 있을 것 같습니다. 구체적으로 확인해볼게요.원인을 정확히 파악했습니다. **3가지 핵심 원인**이 있습니다.

---

## 🔍 왜 다르게 보이는가

### 원인 1. `--ink-900` CSS 변수가 Tailwind에서 안 읽힘

`globals.css`에서 `--ink-900: #191F28`처럼 정의했는데, `globals.css` 커스텀 유틸리티에서 `var(--ink-900)`으로 참조합니다. 하지만 **Tailwind `@layer utilities`에서 정의한 `.btn-pill-primary` 등은 CSS 변수를 못 읽는 게 아니라**, 문제는 **Tailwind 클래스 `text-ink-900`, `bg-ink-50` 등이 `tailwind.config.ts`의 `colors.ink`에 등록되어 있어서 잘 작동해야 하는데**, `--ink-900` CSS 변수명의 하이픈이 Tailwind 변수 이름과 충돌할 수 있다는 점입니다.

실제 핵심 문제는 아래 두 가지입니다.

---

### 원인 2. `bg-ink-50` → `#FAFAFA`인데 기본 `background`가 덮어씀 ⚠️

```css
/* globals.css @layer base */
body {
  @apply bg-background text-foreground; /* hsl(0 0% 98%) = #FAFAFA에 가깝지만 */
}
```

`bg-ink-50`를 섹션에 쓰는데, **`@layer base`의 `body` 배경이 이미 `#FAFAFA`라서** 섹션 배경색이 묻혀 보입니다. 큰 문제는 아닙니다.

---

### 원인 3. `grid-bg` 클래스의 `mask-image`가 Safari/Chrome에서 다르게 렌더링됨 ⚠️

```css
/* 현재 코드 */
.grid-bg {
  mask-image: radial-gradient(...); /* -webkit- prefix 없음! */
}
```

Safari는 `-webkit-mask-image`가 필요하고, 없으면 **그리드 오버레이가 전체 화면을 검게 덮습니다.**

---

### 원인 4 (가장 심각). `Reveal` 컴포넌트가 CSS 클래스 방식 vs Hook 방식 불일치 ❌

지금 `Reveal.tsx`가 **인라인 스타일로 opacity/transform을 제어**하는데, `globals.css`에는 `.reveal` / `.reveal.visible` CSS 클래스도 남아 있어서 서로 충돌합니다.

또한 `Hero.tsx`를 보면:

```tsx
// 직접 mounted 상태로 인라인 스타일을 제어 → 정상 작동
style={{ opacity: mounted ? 1 : 0, ... }}

// Reveal 컴포넌트 사용 → Hook 방식 → 별도 동작
<Reveal key={s.label} delay={i * 80}>
```

이 두 방식이 혼재합니다. 그리고 **`'use client'`가 없는 서버 컴포넌트에서 `useEffect`가 실행되지 않아** 항상 `opacity: 0` 상태로 고정될 수 있습니다.

---

## ✅ 수정된 파일들

**핵심 4개 파일**을 고칩니다.이번엔 `tailwind.config.ts`의 `content` 경로 문제도 체크합니다.마지막으로 Hero에서 `MockPortfolio`, `Reveal` import 경로가 `@/components/common/...`으로 되어 있는지 확인합니다.이제 수정된 파일들을 ZIP으로 묶어 전달합니다.---

## 원인 정리 & 수정 내용

### ❌ 원인 1 — `--ink-900` CSS 변수가 `@layer utilities`에서 작동 안 함

`globals.css`에서 `var(--ink-900)` 같은 CSS 변수를 버튼 배경에 썼는데, Tailwind의 `@layer utilities`에서 CSS 변수를 직접 쓰면 빌드 타임에 resolve가 안 될 수 있습니다.

**수정:** `var(--ink-900)` → `#191F28` 처럼 hex 값으로 직접 교체

---

### ❌ 원인 2 — `grid-bg`가 Safari에서 화면 전체를 가림

`mask-image`에 `-webkit-` prefix가 없으면 Safari에서 마스킹이 반전되어 그리드 배경이 전체를 뒤덮습니다.

**수정:** `-webkit-mask-image`와 `mask-image` 둘 다 명시

---

### ❌ 원인 3 — `globals.css`의 `.reveal` 클래스 vs `Reveal.tsx` 인라인 스타일 충돌

CSS `.reveal { opacity: 0 }`이 전역에 걸려 있으면, `Reveal` 컴포넌트가 인라인으로 `opacity: 1`을 설정해도 CSS 우선순위에서 밀릴 수 있습니다.

**수정:** `globals.css`에서 `.reveal` / `.reveal.visible` 제거 → 인라인 스타일만 사용

---

### ❌ 원인 4 — `tailwind.config.ts` content 경로 분산

`./src/pages/...`, `./src/components/...`, `./src/app/...` 세 줄로 나뉘어 있어 경로 하나라도 틀리면 해당 파일의 클래스가 전부 purge됩니다.

**수정:** `'./src/**/*.{js,ts,jsx,tsx,mdx}'` 단일 glob으로 통일

---

### ❌ 원인 5 — import 경로 불일치

`Hero.tsx`가 `../common/MockPortfolio`, `../common/Reveal`로 import하는데 실제 파일은 `ui/`에 있어서 모듈을 못 찾습니다.

**수정:** `src/components/common/` 폴더에 re-export 파일 추가
