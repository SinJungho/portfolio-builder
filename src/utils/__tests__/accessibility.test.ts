import {
  hexToRgb,
  getRelativeLuminance,
  getContrastRatio,
  getContrastVerdict,
} from '../accessibility'

describe('hexToRgb', () => {
  it('6자리 HEX 색상을 올바르게 파싱한다', () => {
    expect(hexToRgb('#FFFFFF')).toEqual({ r: 255, g: 255, b: 255 })
    expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 })
    expect(hexToRgb('#3182F6')).toEqual({ r: 49, g: 130, b: 246 })
  })

  it('# 접두사 없이도 파싱한다', () => {
    expect(hexToRgb('FF0000')).toEqual({ r: 255, g: 0, b: 0 })
  })

  it('3자리 단축 HEX를 확장하여 파싱한다', () => {
    expect(hexToRgb('#FFF')).toEqual({ r: 255, g: 255, b: 255 })
    expect(hexToRgb('#000')).toEqual({ r: 0, g: 0, b: 0 })
    expect(hexToRgb('#F00')).toEqual({ r: 255, g: 0, b: 0 })
  })

  it('유효하지 않은 HEX는 null을 반환한다', () => {
    expect(hexToRgb('invalid')).toBeNull()
    expect(hexToRgb('#GGG')).toBeNull()
    expect(hexToRgb('')).toBeNull()
  })
})

describe('getRelativeLuminance', () => {
  it('흰색(#FFFFFF)의 상대 휘도는 1.0이다', () => {
    const luminance = getRelativeLuminance({ r: 255, g: 255, b: 255 })
    expect(luminance).toBeCloseTo(1.0, 4)
  })

  it('검정(#000000)의 상대 휘도는 0.0이다', () => {
    const luminance = getRelativeLuminance({ r: 0, g: 0, b: 0 })
    expect(luminance).toBeCloseTo(0.0, 4)
  })

  it('중간 회색의 상대 휘도가 0과 1 사이에 존재한다', () => {
    const luminance = getRelativeLuminance({ r: 128, g: 128, b: 128 })
    expect(luminance).toBeGreaterThan(0)
    expect(luminance).toBeLessThan(1)
  })
})

describe('getContrastRatio', () => {
  it('흰색과 검정의 대비도는 21:1이다', () => {
    const ratio = getContrastRatio('#FFFFFF', '#000000')
    expect(ratio).toBeCloseTo(21, 0)
  })

  it('동일 색상의 대비도는 1:1이다', () => {
    const ratio = getContrastRatio('#3182F6', '#3182F6')
    expect(ratio).toBeCloseTo(1, 4)
  })

  it('유효하지 않은 색상 입력 시 대비도 1을 반환한다', () => {
    const ratio = getContrastRatio('invalid', '#FFFFFF')
    expect(ratio).toBe(1)
  })
})

describe('getContrastVerdict', () => {
  it('7.0 이상은 AAA를 반환한다', () => {
    expect(getContrastVerdict(7.0)).toBe('AAA')
    expect(getContrastVerdict(21)).toBe('AAA')
  })

  it('4.5 이상 7.0 미만은 AA를 반환한다', () => {
    expect(getContrastVerdict(4.5)).toBe('AA')
    expect(getContrastVerdict(6.9)).toBe('AA')
  })

  it('3.0 이상 4.5 미만은 AA_LARGE를 반환한다', () => {
    expect(getContrastVerdict(3.0)).toBe('AA_LARGE')
    expect(getContrastVerdict(4.4)).toBe('AA_LARGE')
  })

  it('3.0 미만은 FAIL을 반환한다', () => {
    expect(getContrastVerdict(2.9)).toBe('FAIL')
    expect(getContrastVerdict(1.0)).toBe('FAIL')
  })
})
