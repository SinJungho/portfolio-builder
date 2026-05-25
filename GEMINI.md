# PortfolioForge — 기술 스택 및 아키텍처 레퍼런스 (GEMINI.md)

> 🚨 **AI 코딩 어시스턴트 핵심 작동 수칙 (필독)**  
> * **모든 개발 프롬프트 및 코딩 작업을 시작하기 전에, 반드시 이 `GEMINI.md`와 하위의 `.gemini/rules/05-conventions.md` 파일의 상세 규칙을 완독하고 기억하십시오.**
> * 특히 `05-conventions.md` 내의 **매개변수 엄격한 타입 지정(Explicit Parameter Typing)**, **한국어 작성 표준(Korean Localization)**, **오류 알림 표준(Global Toast Error)**, **린트 경고/에러 강제 억제 금지(No Inline Lint Disabling) 및 Vercel 배포 규격 준수**, 그리고 **실무 표준 명명법 및 구조적 리팩토링(Professional Naming & Clean Architecture)** 규칙을 매 코드 수정마다 단 하나의 예외도 없이 철저하게 준수하십시오.

> AI 코딩 어시스턴트 및 개발자가 프로젝트 컨텍스트를 파악하기 위한 기술 문서입니다.  
> 기획 의도·페르소나·KPI는 [PLANNING.md](./PLANNING.md)를 참조하세요.
> **알림**: 본 문서는 효율적인 AI 컨텍스트 로딩을 위해 `.gemini/rules/` 디렉토리 하위로 분할되었습니다.

---

## 📂 세부 규칙 및 아키텍처 문서 목록

* **[01-architecture.md](./.gemini/rules/01-architecture.md)**
  * 1. 기술 스택 전체 요약
  * 2. 기술 의사결정 근거
  * 3. 인프라 아키텍처
  * 7. 디렉토리 구조 및 라우팅
* **[02-database.md](./.gemini/rules/02-database.md)**
  * 4. DB 스키마 (Prisma/PostgreSQL/Zod)
* **[03-api-specs.md](./.gemini/rules/03-api-specs.md)**
  * 5. API 명세
* **[04-product-flow.md](./.gemini/rules/04-product-flow.md)**
  * 6. 에디터 없는 즉시 자동 생성·배포 플로우
* **[05-conventions.md](./.gemini/rules/05-conventions.md)** (🌟 가장 중요)
  * 10. 개발 원칙 및 커밋 규칙 (Next.js 문법 규칙, 한국어 작성 규칙, 오류 알림 표준 규칙)
* **[06-operations.md](./.gemini/rules/06-operations.md)**
  * 8. 기술 리스크 및 대응 전략
  * 9. 월간 운영 비용 추정
