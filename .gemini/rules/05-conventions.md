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
| 매개변수 타입  | 화살표 함수, 이벤트 핸들러 매개변수 타입 지정 | `any` 또는 생략(Implicit Any) |

#### 💡 매개변수 엄격한 타입 지정 규칙 (Explicit Parameter Typing)
* Vercel 배포 시 `noImplicitAny` 엄격한 타입 컴파일 환경에서 빌드가 실패하는 것을 원천 방지하기 위해, 화살표 함수 및 이벤트 핸들러(예: `React.FormEvent`, `React.ChangeEvent<HTMLInputElement>`)의 모든 매개변수에는 **생략이나 `any` 없이 명시적 타입을 항시 지정**합니다.
* 예외적으로 인라인 익명 콜백 함수 등 타입 추론이 확실하게 성립하는 경우는 생략을 허용하되, 그 외에는 명시적 타입 지정을 기본 원칙으로 합니다.

#### 🇰🇷 한국어 작성 표준 규칙 (Korean Localization Standard)
* **프로젝트 일관성 및 글로벌 다국어 표준 준수**를 위해, 모든 사용자 대면 문구(UI/UX), 개발용 소스코드 주석(Comments), API 오류 응답(JSON error message), 그리고 서버/클라이언트 콘솔 로그(`console.log`, `console.warn`, `console.error`) 등 프로젝트 내부에서 작성되는 모든 텍스트/문구/로그/주석은 **원칙적으로 한국어로 명확하고 친절하게 작성**하는 것을 기본 개발 원칙으로 삼습니다.
* 단, 외부 시스템(Vercel, GitHub, OpenAI 등)에서 발생한 원본 스택트레이스나 라이브러리 고유 에러 키를 파싱 및 기록하는 등 기술적 목적의 보존이 필요한 데이터는 예외를 허용합니다.

#### 🍞 전역적 오류 알림 표준 규칙 (Global Toast Error Notification Rule)
* 화면 프리징이나 무반응 현상으로 사용자가 겪을 수 있는 혼란과 불편을 방지하기 위해, 단순히 예외 상황에서 `throw new Error()`를 던지고 조용히 멈추는(Silent failure) 설계는 엄격하게 금지합니다.
* 비동기 데이터 통신(`fetch`, `axios` 등)이나 상태 제어 로직이 수행되는 모든 `catch` 블록 및 비정상 흐름에서는 반드시 **사용자 친화적이고 명확한 한글 Toast 에러 알림(`toast.error(...)`)을 호출하여 즉시 직관적인 시각적 오류 피드백을 사용자에게 제공**해야 합니다.

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