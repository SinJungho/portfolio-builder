export const ERROR_MESSAGES = {
  INVALID_REQUEST: "요청 형식이 올바르지 않아요.",
  INVALID_JSON: "요청 형식이 올바르지 않아요.",
  UNAUTHORIZED: "인증이 필요해요.",
  FORBIDDEN: "권한이 없어요.",
  NOT_FOUND: "요청한 리소스를 찾을 수 없어요.",
  CONFLICT: "이미 사용 중인 값이에요.",
  RATE_LIMITED: "요청이 너무 많아요. 잠시 후 다시 시도해 주세요.",
  REDIS_UNAVAILABLE: "서비스 연결이 불안정해요. 잠시 후 다시 시도해 주세요.",
  USER_NOT_FOUND: "사용자 정보를 찾을 수 없어요.",
  SLUG_UNAVAILABLE: "사용 가능한 주소를 만들지 못했어요.",
  SLUG_CONFLICT: "이미 사용 중인 주소예요.",
  INVALID_BLOCK_TYPE: "지원하지 않는 섹션 유형이에요.",
  BLOCK_NOT_FOUND: "요청한 섹션을 찾을 수 없어요.",
  PORTFOLIO_NOT_READY: "공개 전 필수 항목을 완료해 주세요.",
  TRACK_FAILED: "분석 이벤트를 기록하지 못했어요.",
  NO_FILE: "업로드할 파일을 선택해 주세요.",
  FILE_TOO_LARGE: "파일 크기는 최대 5MB까지 가능해요.",
  STORAGE_NOT_CONFIGURED: "스토리지 설정이 없어 업로드할 수 없어요.",
  UPLOAD_FAILED: "파일 업로드 중 오류가 발생했어요.",
  WEBHOOK_INVALID_SIGNATURE: "웹훅 인증에 실패했어요.",
  WEBHOOK_BAD_REQUEST: "웹훅 요청 형식이 올바르지 않아요.",
  RSS_INVALID_URL: "올바른 RSS 주소를 입력해 주세요.",
  RSS_PARSE_FAILED: "RSS 피드를 읽지 못했어요.",
  INTEGRATION_NOT_FOUND: "연동 정보를 찾을 수 없어요.",
  JOB_NOT_FOUND: "작업 정보를 찾을 수 없어요.",
  PORTFOLIO_ID_REQUIRED: "포트폴리오 ID가 필요해요.",
  PROJECT_LIMIT: "대표 프로젝트는 최대 3개까지 선택할 수 있어요.",
  PDF_INVALID_SLUG: "유효하지 않은 포트폴리오 주소예요.",
  PDF_SECURITY: "보안 검증에 실패해 PDF를 만들 수 없어요.",
  PDF_FAILED: "PDF 생성을 실패했어요.",
  DOMAIN_REQUIRED: "도메인 정보를 입력해 주세요.",
  DOMAIN_SAVE_FAILED: "도메인 설정을 저장하지 못했어요.",
  DOMAIN_STATUS_FAILED: "도메인 상태를 확인하지 못했어요.",
  GITHUB_CONNECT_FAILED: "GitHub 연동을 시작하지 못했어요.",
  GITHUB_AUTH_EXPIRED: "GitHub 연동 정보가 만료되었어요.",
  ANALYTICS_FETCH_FAILED: "분석 데이터를 불러오지 못했어요.",
  ANALYSIS_FAILED: "분석에 실패했어요.",
  ANALYSIS_TIMEOUT: "분석 시간이 오래 걸리고 있어요. 잠시 후 다시 시도해 주세요.",
  GENERATION_FAILED: "포트폴리오 생성에 실패했어요.",
  GENERATION_TIMEOUT: "생성 작업이 지연되고 있어요. 잠시 후 다시 시도해 주세요.",
  BLOG_VALIDATION_FAILED: "RSS 피드 주소를 확인해 주세요.",
  INTERNAL_ERROR: "요청 처리 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.",
  FETCH_FAILED: "데이터를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.",
  PORTFOLIO_CREATE_FAILED: "포트폴리오를 만들지 못했어요. 잠시 후 다시 시도해 주세요.",
  PORTFOLIO_DELETE_FAILED: "포트폴리오를 삭제하지 못했어요. 다시 시도해 주세요.",
  SYNC_START_FAILED: "동기화를 시작하지 못했어요.",
  SYNC_STATUS_FAILED: "동기화 상태를 확인하지 못했어요.",
  SYNC_FAILED: "GitHub 동기화에 실패했어요.",
  COPY_FAILED: "복사하지 못했어요. 다시 시도해 주세요.",
  PREVIEW_REQUIRED: "미리보기를 확인한 뒤 공개해 주세요.",
  PUBLISH_FAILED: "공개하지 못했어요.",
  UNPUBLISH_FAILED: "공개를 중지하지 못했어요.",
  SECTION_ORDER_SAVE_FAILED: "섹션 순서를 저장하지 못했어요. 이전 순서로 돌아갔어요.",
  SECTION_ORDER_RESTORE_FAILED: "섹션 순서를 되돌리지 못했어요. 잠시 후 다시 시도해 주세요.",
  SECTION_SAVE_FAILED: "섹션 설정을 저장하지 못했어요. 입력 내용은 유지돼요.",
  SECTION_VISIBILITY_SAVE_FAILED: "공개 상태를 저장하지 못했어요. 이전 상태로 돌아갔어요.",
  SECTION_DELETE_FAILED: "섹션을 삭제하지 못했어요. 섹션은 그대로 보관돼요.",
  SECTION_ADD_FAILED: "새 섹션을 추가하지 못했어요. 잠시 후 다시 시도해 주세요.",
  CONTACT_SAVE_FAILED: "연락처 정보를 저장하지 못했어요. 잠시 후 다시 시도해 주세요.",
  PROJECT_SAVE_FAILED: "프로젝트 설정을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.",
  PROJECT_CONFIG_SAVE_FAILED: "대표 프로젝트 설정을 저장하지 못했어요. 입력 내용은 유지돼요.",
  PROJECT_LIST_FAILED: "프로젝트 목록을 불러오지 못했어요.",
  GITHUB_BIO_FAILED: "GitHub 소개를 확인하지 못했어요.",
  RSS_IMPORT_FAILED: "RSS 피드를 연동하지 못했어요.",
  RSS_DISCONNECT_FAILED: "RSS 피드 연동을 해제하지 못했어요.",
  IMAGE_ONLY: "마크다운(.md) 파일만 가져올 수 있어요.",
  IMAGE_TOO_LARGE: "이미지 크기는 최대 5MB까지만 가능해요.",
  IMAGE_UPLOAD_FAILED: "이미지 업로드 중 오류가 발생했어요.",
  DOMAIN_INVALID: "올바른 도메인 형식이 아니에요. 예: www.yourdomain.com",
  DOMAIN_COPY_FAILED: "복사하지 못했어요. 값을 직접 선택해 복사해 주세요.",
  LINK_COPY_FAILED: "링크를 복사하지 못했어요. 다시 시도해 주세요.",
  COLOR_INVALID: "#RGB 또는 #RRGGBB 형식의 색상을 입력하세요.",
  SESSION_EXPIRED: "보안을 위해 로그인 세션이 만료되었습니다. 다시 로그인해 주세요.",
} as const;

export const API_ERROR_MESSAGES = ERROR_MESSAGES;

export type ApiErrorCode = keyof typeof ERROR_MESSAGES;

export function apiError(
  code: ApiErrorCode,
  status: number,
  details?: Record<string, unknown>,
) {
  return new Response(JSON.stringify({ ...details, code, error: ERROR_MESSAGES[code] }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function errorMessage(code: ApiErrorCode) {
  return ERROR_MESSAGES[code];
}

export function responseErrorMessage(payload: unknown, fallbackCode: ApiErrorCode) {
  const data = payload as { code?: unknown; error?: unknown } | null;

  if (typeof data?.error === "string" && data.error) return data.error;
  if (typeof data?.code === "string" && data.code in ERROR_MESSAGES) {
    return ERROR_MESSAGES[data.code as ApiErrorCode];
  }
  return ERROR_MESSAGES[fallbackCode];
}

export function getErrorDetails(error: unknown, fallbackMessage: string) {
  const details = error as { name?: unknown; message?: unknown; stack?: unknown } | null;

  return {
    name: typeof details?.name === "string" ? details.name : "UnknownError",
    message: typeof details?.message === "string" && details.message
      ? details.message
      : fallbackMessage,
    stack: typeof details?.stack === "string" ? details.stack : undefined,
  };
}

export function logRouteError(route: string, method: string, error: unknown) {
  const details = getErrorDetails(error, "Internal server error");

  console.error(`[API ${route}] ${method} failed`, details);

  return details;
}

export function logRouteWarning(
  route: string,
  method: string,
  error: unknown,
  fallbackMessage: string,
) {
  const details = getErrorDetails(error, fallbackMessage);

  const label = fallbackMessage === "Invalid JSON" ? "received invalid JSON" : "warning";
  console.warn(`[API ${route}] ${method} ${label}`, details);

  return details;
}

export function routeError(route: string, method: string, error: unknown) {
  logRouteError(route, method, error);

  return apiError("INTERNAL_ERROR", 500);
}
