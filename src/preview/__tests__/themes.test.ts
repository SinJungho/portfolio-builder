import { describe, it, expect } from '@jest/globals'
import { resolveTheme, THEMES, THEME_LIST } from '../themes'

describe('resolveTheme', () => {
  it('유효한 테마 키로 올바른 테마 토큰을 반환한다', () => {
    const theme = resolveTheme('minimal')
    expect(theme.id).toBe('minimal')
    expect(theme.bg).toBe('#FFFFFF')
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

  it('존재하지 않는 테마 키는 minimal로 폴백한다', () => {
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

  it('5개의 테마 프리셋이 등록되어 있다', () => {
    expect(Object.keys(THEMES)).toHaveLength(5)
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
