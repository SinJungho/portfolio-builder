import { DesignTokens } from "@/schemas/portfolio";
import { FONT_STACK } from "./fonts";
import { sanitizeCss } from "./sanitize-css";
import {
  accentForSurface,
  readableTextOn,
  resolveTheme,
} from "./themes";

const RADIUS_VALUES: Record<string, string> = {
  none: "0px",
  sm: "8px",
  md: "16px",
  lg: "24px",
  full: "9999px",
};

const SPACING_VALUES: Record<string, string> = {
  compact: "2.5rem",
  normal: "4rem",
  relaxed: "5rem",
};

export function buildPortfolioCss(
  themeKey: string,
  designTokens: DesignTokens = {},
): string {
  const theme = resolveTheme(themeKey);
  const primaryColor = designTokens.primaryColor || theme.accent;
  const functionalAccent = designTokens.primaryColor
    ? accentForSurface(
        accentForSurface(primaryColor, theme.bg, theme.accent),
        theme.cardBg,
        theme.accent,
      )
    : theme.accent;
  const fontFamily = FONT_STACK[designTokens.fontFamily || "inter"] || FONT_STACK.inter;
  const radius = RADIUS_VALUES[designTokens.borderRadius || "md"] || theme.cardRadius;
  const spacing = SPACING_VALUES[designTokens.spacing || "normal"] || SPACING_VALUES.normal;

  const legacyCss = designTokens.customCss
    ? `\n/* 기존 사용자 CSS */\n${sanitizeCss(designTokens.customCss)}\n`
    : "";

  return `/* PortfolioForge 전문가용 테마 CSS */
:root, .pf-root {
  --pf-bg: ${theme.bg};
  --pf-text: ${theme.text};
  --pf-muted: ${theme.textMuted};
  --pf-accent: ${functionalAccent};
  --pf-cta-bg: ${primaryColor};
  --pf-cta-text: ${designTokens.primaryColor ? readableTextOn(primaryColor) : theme.ctaText};
  --pf-card-bg: ${theme.cardBg};
  --pf-card-radius: ${radius};
  --pf-section-spacing: ${spacing};
  --pf-font-family: ${fontFamily};
}
${legacyCss}`;
}
