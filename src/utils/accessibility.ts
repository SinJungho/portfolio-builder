/**
 * 웹 접근성(WCAG 2.1) 대비도 계산 유틸리티
 */

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface RGBA extends RGB {
  a: number;
}

/**
 * HEX 색상을 RGB 객체로 변환
 */
export function hexToRgb(hex: string): RGB | null {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function cssColorToRgba(color: string): RGBA | null {
  const hex = hexToRgb(color);
  if (hex) return { ...hex, a: 1 };

  const match = color.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/i);
  if (!match) return null;

  const [r, g, b, alpha = "1"] = match.slice(1);
  const channels = [Number(r), Number(g), Number(b)];
  const a = Number(alpha);
  if (channels.some((channel) => channel < 0 || channel > 255) || a < 0 || a > 1) {
    return null;
  }

  return { r: channels[0], g: channels[1], b: channels[2], a };
}

function compositeColor(foreground: RGBA, background: RGB): RGB {
  return {
    r: foreground.r * foreground.a + background.r * (1 - foreground.a),
    g: foreground.g * foreground.a + background.g * (1 - foreground.a),
    b: foreground.b * foreground.a + background.b * (1 - foreground.a),
  };
}

/**
 * 색상의 상대 휘도(Relative Luminance) 계산
 * 공식: L = 0.2126 * R + 0.7152 * G + 0.0722 * B
 * (단, SRGB 채널 값을 선형화한 후 적용)
 */
export function getRelativeLuminance(rgb: RGB): number {
  const { r, g, b } = rgb;
  const [rl, gl, bl] = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

/**
 * 두 색상 간의 대비도(Contrast Ratio) 계산
 * 공식: (L1 + 0.05) / (L2 + 0.05)
 */
export function getContrastRatio(
  color1: string,
  color2: string,
  backdrop = "#FFFFFF",
): number {
  const rgba1 = cssColorToRgba(color1);
  const rgba2 = cssColorToRgba(color2);
  const background = cssColorToRgba(backdrop);

  if (!rgba1 || !rgba2 || !background) return 1;

  const rgb1 = compositeColor(rgba1, background);
  const rgb2 = compositeColor(rgba2, background);

  const l1 = getRelativeLuminance(rgb1);
  const l2 = getRelativeLuminance(rgb2);

  const brighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (brighter + 0.05) / (darker + 0.05);
}

/**
 * 대비도 수준 판정
 * - AA (Large Text): 3.0:1
 * - AA (Normal Text): 4.5:1
 * - AAA (Normal Text): 7.0:1
 */
export type AccessibilityVerdict = "FAIL" | "AA_LARGE" | "AA" | "AAA";

export function getContrastVerdict(ratio: number): AccessibilityVerdict {
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  if (ratio >= 3) return "AA_LARGE";
  return "FAIL";
}
