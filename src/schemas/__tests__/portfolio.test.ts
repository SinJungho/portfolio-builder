import { describe, it, expect } from '@jest/globals'
import { DesignTokenSchema, BlockConfigSchema } from '../portfolio'

describe('DesignTokenSchema', () => {
  it('유효한 전체 디자인 토큰을 파싱한다', () => {
    const input = {
      primaryColor: '#3182F6',
      fontFamily: 'inter',
      borderRadius: 'md',
      spacing: 'normal',
      customCss: 'body { color: red; }',
    }
    const result = DesignTokenSchema.safeParse(input)
    expect(result.success).toBe(true)
  })

  it('모든 필드가 optional이므로 빈 객체도 유효하다', () => {
    const result = DesignTokenSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('유효하지 않은 HEX 색상 코드를 거부한다', () => {
    const result = DesignTokenSchema.safeParse({ primaryColor: 'not-a-color' })
    expect(result.success).toBe(false)
  })

  it('허용되지 않은 fontFamily를 거부한다', () => {
    const result = DesignTokenSchema.safeParse({ fontFamily: 'comic-sans' })
    expect(result.success).toBe(false)
  })

  it('허용되지 않은 borderRadius를 거부한다', () => {
    const result = DesignTokenSchema.safeParse({ borderRadius: 'xl' })
    expect(result.success).toBe(false)
  })

  it('허용되지 않은 spacing을 거부한다', () => {
    const result = DesignTokenSchema.safeParse({ spacing: 'ultra-wide' })
    expect(result.success).toBe(false)
  })
})

describe('BlockConfigSchema', () => {
  it('유효한 hero 블록을 파싱한다', () => {
    const input = {
      block_type: 'hero',
      config: {
        headline: '안녕하세요',
        subheadline: '개발자입니다',
        bio: 'Backend Engineer',
        show_github_stats: true,
      },
    }
    const result = BlockConfigSchema.safeParse(input)
    expect(result.success).toBe(true)
  })

  it('hero 블록 headline 100자 초과 시 거부한다', () => {
    const input = {
      block_type: 'hero',
      config: {
        headline: 'a'.repeat(101),
        subheadline: '개발자입니다',
        bio: 'Backend Engineer',
      },
    }
    const result = BlockConfigSchema.safeParse(input)
    expect(result.success).toBe(false)
  })

  it('유효한 project_grid 블록을 파싱한다', () => {
    const input = {
      block_type: 'project_grid',
      config: {
        layout: 'grid',
        columns: 2,
        project_ids: ['550e8400-e29b-41d4-a716-446655440000'],
        show_tech_stack: true,
      },
    }
    const result = BlockConfigSchema.safeParse(input)
    expect(result.success).toBe(true)
  })

  it('project_grid의 columns가 범위를 벗어나면 거부한다', () => {
    const input = {
      block_type: 'project_grid',
      config: {
        layout: 'grid',
        columns: 5,
        project_ids: [],
        show_tech_stack: true,
      },
    }
    const result = BlockConfigSchema.safeParse(input)
    expect(result.success).toBe(false)
  })

  it('유효한 skills 블록을 파싱한다', () => {
    const input = {
      block_type: 'skills',
      config: {
        chart_type: 'bar',
        skills: [
          { name: 'TypeScript', level: 90 },
          { name: 'React', level: 85 },
        ],
      },
    }
    const result = BlockConfigSchema.safeParse(input)
    expect(result.success).toBe(true)
  })

  it('skills 레벨이 0~100 범위를 벗어나면 거부한다', () => {
    const input = {
      block_type: 'skills',
      config: {
        chart_type: 'bar',
        skills: [{ name: 'TypeScript', level: 150 }],
      },
    }
    const result = BlockConfigSchema.safeParse(input)
    expect(result.success).toBe(false)
  })

  it('유효한 contact 블록을 파싱한다', () => {
    const input = {
      block_type: 'contact',
      config: {
        github_url: 'https://github.com/user',
        email: 'user@example.com',
        linkedin_url: '',
        website_url: '',
      },
    }
    const result = BlockConfigSchema.safeParse(input)
    expect(result.success).toBe(true)
  })

  it('유효한 blog_feed 블록을 파싱한다', () => {
    const input = {
      block_type: 'blog_feed',
      config: {
        integration_provider: 'velog',
        max_items: 3,
        show_thumbnail: true,
      },
    }
    const result = BlockConfigSchema.safeParse(input)
    expect(result.success).toBe(true)
  })

  it('blog_feed의 max_items가 범위를 벗어나면 거부한다', () => {
    const input = {
      block_type: 'blog_feed',
      config: {
        integration_provider: 'velog',
        max_items: 10,
        show_thumbnail: true,
      },
    }
    const result = BlockConfigSchema.safeParse(input)
    expect(result.success).toBe(false)
  })

  it('존재하지 않는 block_type을 거부한다', () => {
    const input = {
      block_type: 'unknown_block',
      config: {},
    }
    const result = BlockConfigSchema.safeParse(input)
    expect(result.success).toBe(false)
  })
})
