## 5. API 명세

모든 인증 필요 엔드포인트는 `Authorization: Bearer <session_token>` 헤더를 요구합니다.

### 5.1 GitHub bio 검증

```
GET /api/integrations/github/bio
```

| Response 200 | `{ bio: string, exists: true }`                                                            |
| ------------ | ------------------------------------------------------------------------------------------ |
| Response 200 | `{ bio: null, exists: false, github_settings_url: "https://github.com/settings/profile" }` |

---

### 5.2 GitHub 연동 및 동기화

```
POST /api/integrations/github/sync
```

| 항목         | 내용                                              |
| ------------ | ------------------------------------------------- |
| Auth         | Required                                          |
| Request      | `{ force?: boolean }` — `true` 시 Redis 캐시 무시 |
| Response 202 | `{ job_id: string, estimated_seconds: number }`   |

```
GET /api/integrations/github/sync/:job_id
```

폴링 간격: **3초**, 타임아웃: **120초**

| Response 200 | `{ status: 'pending' \| 'processing' \| 'completed' \| 'failed', progress: number, synced_count: number, error?: string }` |
| ------------ | -------------------------------------------------------------------------------------------------------------------------- |

---

### 5.3 포트폴리오 자동 생성 + 즉시 배포

```
POST /api/portfolios
```

| 항목         | 내용                                     |
| ------------ | ---------------------------------------- |
| Auth         | Required                                 |
| Request      | `{ slug?: string, theme?: string }`      |
| Response 201 | `{ portfolio_id: string, slug: string }` |

```
POST /api/portfolios/generate
```

| 항목         | 내용                                                                |
| ------------ | ------------------------------------------------------------------- |
| Auth         | Required                                                            |
| Request      | `{ portfolio_id: string, auto_publish?: boolean }` — 기본값: `true` |
| Response 202 | `{ job_id: string, estimated_seconds: number }`                     |

```
GET /api/portfolios/generate/:job_id
```

폴링 간격: **3초**, 타임아웃: **60초**

| Response 200 | `{ status, progress, blocks?, published_url?, missing_optional_fields?, error? }` |
| ------------ | --------------------------------------------------------------------------------- |

---

### 5.4 프로젝트 관리

```
GET  /api/projects
POST /api/projects/:id/analyze
```

---

### 5.5 포트폴리오 CRUD

| Method   | Path                  | 설명                                         |
| -------- | --------------------- | -------------------------------------------- |
| `GET`    | `/api/portfolios`     | 포트폴리오 목록                              |
| `POST`   | `/api/portfolios`     | 포트폴리오 레코드 사전 생성                  |
| `PATCH`  | `/api/portfolios/:id` | 부분 업데이트 → **자동 revalidation 트리거** |
| `DELETE` | `/api/portfolios/:id` | 삭제                                         |

---

### 5.6 블록 관리

| Method  | Path                                  | 설명                               |
| ------- | ------------------------------------- | ---------------------------------- |
| `GET`   | `/api/portfolios/:id/blocks`          | 블록 목록                          |
| `PATCH` | `/api/portfolios/:id/blocks/:blockId` | 블록 설정 수정 → 즉시 revalidation |
| `PUT`   | `/api/portfolios/:id/blocks`          | 전체 순서 교체 → 즉시 revalidation |

---

### 5.7 분석 API

```
POST /api/analytics/event          ← Auth 불필요 (공개 엔드포인트)
GET  /api/analytics/:portfolioId/summary?period=7d|30d|90d
```

---