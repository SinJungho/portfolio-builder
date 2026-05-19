## 6. 에디터 없는 즉시 자동 생성·배포 플로우

### 6.1 전체 플로우

```
[Phase 01 — GitHub 연동 확인]
  └─ GET /api/integrations/github/bio
       ├─ bio 있음 → Phase 02 진행
       └─ bio 없음 → /onboarding/bio 리다이렉트

[Phase 02 — AI 분석]
  └─ POST /api/integrations/github/sync → 폴링 (3초, 최대 120초)
  └─ GPT-4o-mini: ai_summary 생성 + ai_score 계산

[Phase 03 — 포트폴리오 자동 생성 + 즉시 배포]
  └─ POST /api/portfolios/generate → 폴링 (3초, 최대 60초)
  └─ auto_publish: true → is_published: true + revalidation
  └─ 완료 화면: {slug}.portfolioforge.app URL 발급

[Phase 04 — 미세 조정: 선택 사항]
  └─ 블록 ON/OFF·순서·테마 조정 → 즉시 배포 반영
  └─ "재배포" 버튼 없음
```

### 6.2 readme_quality 점수 산정

| 조건                                | 점수 |
| ----------------------------------- | ---- |
| README 파일 없음                    | 0.0  |
| README 존재, 본문 300자 미만        | 0.3  |
| README 존재, 본문 300자 이상        | 0.6  |
| 300자 이상 + 이미지(`![`) 1개 이상  | +0.2 |
| 300자 이상 + 코드블록(` ``` `) 포함 | +0.1 |
| 최댓값 cap                          | 1.0  |

### 6.3 미리보기 렌더링 방식

iFrame 방식은 Next.js RSC와 충돌하므로 사용하지 않습니다.

```typescript
// Output Layer(/[slug])와 동일한 컴포넌트 재사용
<PortfolioPreview
  blocks={blocks.filter(b => b.is_visible)}
  theme={theme}
  designTokens={designTokens}
/>
```

---