import { describe, it, expect } from '@jest/globals'
import { accentForSurface, contrastRatio, readableTextOn, resolveTheme, THEMES, THEME_LIST } from '../themes'

describe('resolveTheme', () => {
  it('유효한 테마 키로 올바른 테마 토큰을 반환한다', () => {
    const theme = resolveTheme('minimal')
    expect(theme.id).toBe('minimal')
    expect(theme.bg).toBe('#F7F8FA') // 카드(#FFFFFF)와 분리된 플랫 배경
  })

  it('midnight 테마의 다크 모드 색상이 올바르다', () => {
    const theme = resolveTheme('midnight')
    expect(theme.id).toBe('midnight')
    expect(theme.bg).toBe('#09090B')
    expect(theme.text).toBe('#FAFAFA')
  })

  it('레거시 별칭(alias)을 새 테마 ID로 매핑한다', () => {
    expect(resolveTheme('minimalist').id).toBe('minimal')
    expect(resolveTheme('creative').id).toBe('ocean')
    expect(resolveTheme('corporate').id).toBe('minimal')
    expect(resolveTheme('dark').id).toBe('midnight')
    expect(resolveTheme('pastel').id).toBe('forest')
    expect(resolveTheme('tech').id).toBe('midnight')
  })

  it('spotify 다크 테마가 기본 아이덴티티로 등록되어 있다', () => {
    const theme = resolveTheme('spotify')
    expect(theme.id).toBe('spotify')
    expect(theme.bg).toBe('#121212')
    expect(theme.accent).toBe('#1ED760')
  })

  it('존재하지 않는 테마 키는 minimal(라이트)로 폴백한다 — 라이트→다크 급변 방지', () => {
    const theme = resolveTheme('nonexistent')
    expect(theme.id).toBe('minimal')
  })

  it('빈 문자열도 minimal로 폴백한다', () => {
    const theme = resolveTheme('')
    expect(theme.id).toBe('minimal')
  })
})

describe('THEMES', () => {
  it('모든 테마에 필수 토큰이 존재한다', () => {
    const requiredKeys = [
      'id', 'label', 'description', 'bg', 'text', 'textMuted',
      'accent', 'cardBg', 'cardBorder', 'ctaBg', 'ctaText',
    ] as const

    for (const themeKey of Object.keys(THEMES)) {
      const theme = THEMES[themeKey]
      for (const key of requiredKeys) {
        expect(theme).toHaveProperty(key)
        expect(theme[key]).toBeTruthy()
      }
    }
  })

  it('6개의 테마 프리셋이 등록되어 있다', () => {
    expect(Object.keys(THEMES)).toHaveLength(6)
  })
})

describe('readableTextOn', () => {
  it('어두운 배경엔 화이트, 밝은 배경엔 다크 텍스트를 반환한다', () => {
    expect(readableTextOn('#1A1A2E')).toBe('#FFFFFF') // 다크-온-다크 방지 (P1)
    expect(readableTextOn('#000000')).toBe('#FFFFFF')
    expect(readableTextOn('#FFFFFF')).toBe('#121212')
  })

  it('spotify 그린은 다크 텍스트를 유지한다(정체성)', () => {
    expect(readableTextOn('#1ED760')).toBe('#121212')
  })

  it('잘못된 hex는 안전하게 화이트로 폴백한다', () => {
    expect(readableTextOn('nope')).toBe('#FFFFFF')
  })

  it('3자리 축약 hex(#0f0)도 6자리처럼 파싱해 대비를 파생한다', () => {
    // #0f0 = 밝은 초록 → 다크 텍스트여야 함(파싱 실패로 흰색 폴백되면 대비 붕괴)
    expect(readableTextOn('#0f0')).toBe('#121212')
    expect(readableTextOn('#000')).toBe('#FFFFFF')
  })
})

describe('accentForSurface', () => {
  it('대비 3:1 이상이면 커스텀 액센트를 그대로 쓴다', () => {
    // spotify 그린은 근-블랙 배경 대비 충분 → 유지
    expect(accentForSurface('#1ED760', '#121212', '#000000')).toBe('#1ED760')
  })

  it('대비 3:1 미달이면 테마 기본 액센트로 대체한다', () => {
    // 옅은 노랑을 흰 배경에 쓰면 포커스 링 소실 → fallback
    expect(accentForSurface('#FEF08A', '#FFFFFF', '#3182F6')).toBe('#3182F6')
  })

  it('잘못된 hex는 보수적으로 fallback한다', () => {
    expect(accentForSurface('nope', '#FFFFFF', '#3182F6')).toBe('#3182F6')
  })

  it('contrastRatio는 흑백에서 21에 근접한다', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 0)
  })
})

describe('THEME_LIST', () => {
  it('THEMES 객체의 값과 동일한 배열이다', () => {
    expect(THEME_LIST).toHaveLength(Object.keys(THEMES).length)
    for (const theme of THEME_LIST) {
      expect(THEMES[theme.id]).toBeDefined()
    }
  })
})
