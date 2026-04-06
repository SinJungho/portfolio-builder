import { z } from "zod";

/**
 * 도메인 형식 검증 정규식
 * - 최소 한 개의 점(.) 포함
 * - 영문 소문자, 숫자, 하이픈만 허용
 */
const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;

export const addDomainSchema = z.object({
  portfolio_id: z.string().uuid("올바른 포트폴리오 ID가 필요합니다."),
  domain: z
    .string()
    .min(4, "도메인이 너무 짧습니다.")
    .max(253, "도메인이 너무 깁니다.")
    .regex(domainRegex, "유효한 도메인 형식이 아닙니다. (예: example.com)"),
});

export const verifyDomainSchema = z.object({
  portfolio_id: z.string().uuid("올바른 포트폴리오 ID가 필요합니다."),
  domain: z.string().min(1, "도메인을 입력해주세요."),
});

export type AddDomainInput = z.infer<typeof addDomainSchema>;
export type VerifyDomainInput = z.infer<typeof verifyDomainSchema>;
