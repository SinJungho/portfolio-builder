import { z } from "zod";

export const PortfolioThemeSchema = z.enum([
  "spotify",
  "minimal",
  "midnight",
  "ocean",
  "forest",
  "sunset",
  "minimalist",
  "creative",
  "corporate",
  "dark",
  "pastel",
  "tech",
]);

/**
 * 포트폴리오 디자인 토큰 스키마
 * 테마 프리셋을 오버라이드하는 세부 디자인 시스템 값
 */
export const DesignTokenSchema = z.object({
  primaryColor: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, "유효한 HEX 색상 코드여야 합니다 (예: #1ED760)")
    .optional(),
  fontFamily: z
    .enum(["inter", "pretendard", "fira-code", "playfair"])
    .optional(),
  borderRadius: z
    .enum(["none", "sm", "md", "lg", "full"])
    .optional(),
  spacing: z
    .enum(["compact", "normal", "relaxed"])
    .optional(),
  customCss: z.string().max(20_000).optional(),
});

/**
 * 포트폴리오 블록 설정 스키마 (discriminatedUnion)
 * 각 블록 타입별로 다른 config 구조를 가짐
 */
export const BlockConfigSchema = z.discriminatedUnion("block_type", [
  z.object({
    block_type: z.literal("hero"),
    config: z.object({
      headline: z.string().max(100),
      subheadline: z.string().max(200),
      bio: z.string().max(500),
      show_github_stats: z.boolean().default(true),
    }),
  }),
  z.object({
    block_type: z.literal("project_grid"),
    config: z.object({
      layout: z.enum(["grid", "list", "masonry"]).default("grid"),
      columns: z.number().min(1).max(3).default(2),
      project_ids: z.array(z.string().uuid()).max(3),
      show_tech_stack: z.boolean().default(true),
      /** Step 3.1: 프로젝트별 수동 입력 설명 저장 */
      custom_descriptions: z
        .record(z.string().uuid(), z.string().max(5_000))
        .refine((descriptions) => Object.keys(descriptions).length <= 3)
        .optional(),
    }),
  }),
  z.object({
    block_type: z.literal("skills"),
    config: z.object({
      chart_type: z.enum(["radar", "bar", "tag_cloud"]).default("bar"),
      skills: z
        .array(
          z.object({
            name: z.string().trim().min(1).max(50),
            level: z.number().min(0).max(100),
          })
        )
        .max(20),
    }),
  }),
  z.object({
    block_type: z.literal("blog_feed"),
    config: z.object({
      integration_provider: z.enum([
        "tistory",
        "velog",
        "medium",
        "custom_rss",
      ]),
      max_items: z.number().int().min(1).max(6).default(3),
      show_thumbnail: z.boolean().default(true),
    }),
  }),
  z.object({
    block_type: z.literal("contact"),
    config: z.object({
      github_url: z.string().url().optional().or(z.literal("")),
      email: z.string().email().optional().or(z.literal("")),
      linkedin_url: z.string().url().optional().or(z.literal("")),
      website_url: z.string().url().optional().or(z.literal("")),
    }),
  }),
]);

export type DesignTokens = z.infer<typeof DesignTokenSchema>;
export type BlockConfig = z.infer<typeof BlockConfigSchema>;
