# PortfolioForge Design System

## 1. Visual Theme & Atmosphere

PortfolioForge uses near-black surfaces (`#121212`, `#181818`, `#1f1f1f`) so developer work, portfolio previews, and status actions carry the visual focus. Its "content-first darkness" is derived from Spotify, but the product-specific expression is the journey from raw GitHub activity to recruiter-readable evidence: source activity → AI draft → user confirmation → public portfolio.

The product typography uses Pretendard Variable with system fallbacks for natural Korean first, while published portfolios may choose their own supported font. Operate surfaces stay compact and functional; Persuade surfaces use larger display type to make the outcome legible immediately. Korean controls use sentence-style action labels without forced uppercase or wide tracking.

Primary actions use pill geometry, icon-only actions use circles, and content/dialog surfaces use restrained 8–16px radii. Heavy offset shadows (`rgba(0,0,0,0.5) 0px 8px 24px`) establish elevation on dark surfaces; 1px hairlines may organize dense content when a shadow would imply false elevation.

**Key Characteristics:**
- Near-black immersive dark theme (`#121212`–`#1f1f1f`) — UI disappears behind content
- Spotify Green (`#1ed760`) as singular brand accent — never decorative, always functional
- Pretendard Variable with system fallbacks for Korean-first readability
- Pill primary actions and circular icon controls — rounded and touch-optimized
- Korean sentence-style action labels with clear verbs
- Heavy shadows on elevated elements (`rgba(0,0,0,0.5) 0px 8px 24px`)
- Semantic colors: negative red (`#f3727f`), warning orange (`#ffa42b`), announcement blue (`#539df5`)
- Portfolio previews, project imagery, and user content as the primary color source

### Surface Modes

| Mode | Surfaces | Typography | Density | Product-specific pattern |
|---|---|---|---|---|
| **Persuade** | Home, templates, login | 36–76px display headings; 16–19px body | Spacious | Show the recruiter-ready artifact early, then explain AI draft → confirm → publish |
| **Operate** | Dashboard, generation, editor, settings, analytics | 12–32px hierarchy; compact controls | Dense but grouped | Present one next action, visible system status, safe defaults, and recovery beside the failure |
| **Experience** | Published portfolio | Theme-owned headings and content measure | Content-led | Forge UI recedes; projects, role, recent activity, and contact dominate the scan |

The modes share tokens, focus treatment, and functional green. They do not share a single type scale or content density.

## 2. Color Palette & Roles

### Primary Brand
- **Spotify Green** (`#1ed760`): Primary brand accent — play buttons, active states, CTAs
- **Near Black** (`#121212`): Deepest background surface
- **Dark Surface** (`#181818`): Cards, containers, elevated surfaces
- **Mid Dark** (`#1f1f1f`): Button backgrounds, interactive surfaces

### Text
- **White** (`#ffffff`): `--text-base`, primary text
- **Silver** (`#b3b3b3`): Secondary text, muted labels, inactive nav
- **Near White** (`#cbcbcb`): Slightly brighter secondary text
- **Light** (`#fdfdfd`): Near-pure white for maximum emphasis

### Semantic
- **Negative Red** (`#f3727f`): `--text-negative`, error states
- **Warning Orange** (`#ffa42b`): `--text-warning`, warning states
- **Announcement Blue** (`#539df5`): `--text-announcement`, info states

### Surface & Border
- **Dark Card** (`#252525`): Elevated card surface
- **Mid Card** (`#272727`): Alternate card surface
- **Border Gray** (`#4d4d4d`): Button borders on dark
- **Light Border** (`#7c7c7c`): Outlined button borders, muted links
- **Separator** (`#b3b3b3`): Divider lines
- **Light Surface** (`#eeeeee`): Light-mode buttons (rare)
- **Spotify Green Border** (`#1db954`): Green accent border variant

### Shadows
- **Heavy** (`rgba(0,0,0,0.5) 0px 8px 24px`): Dialogs, menus, elevated panels
- **Medium** (`rgba(0,0,0,0.3) 0px 8px 8px`): Cards, dropdowns
- **Inset Border** (`rgb(18,18,18) 0px 1px 0px, rgb(124,124,124) 0px 0px 0px 1px inset`): Input border-shadow combo

## 3. Typography Rules

### Font Families
- **Product UI / marketing**: `Pretendard Variable`, `system-ui`, `sans-serif`
- **Published portfolio**: the selected supported stack; Pretendard is the Korean-first default
- **Code / measurements only**: Geist Mono fallback stack

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Persuade Display | Pretendard | 36–76px | 900 | 1.02–1.10 | -0.04em to -0.02em | Outcome-led marketing headings |
| Operate Page Title | Pretendard | 28–36px | 700 | 1.15 | -0.02em | Dashboard and task titles |
| Section Title | Pretendard | 20–28px | 700 | 1.20 | -0.02em | Clear section hierarchy |
| Feature Heading | Pretendard | 18–21px | 700 | 1.30 | -0.01em | Feature and list headings |
| Body Bold | Pretendard | 16px | 700 | 1.50 | normal | Emphasized text |
| Body | Pretendard | 15–18px | 400–500 | 1.50–1.70 | normal | Standard Korean body |
| Button | Pretendard | 13–16px | 700 | 1.20 | -0.01em to normal | Sentence-style action label |
| Caption | Pretendard | 13–14px | 400–700 | 1.45 | normal | Metadata and supporting state |
| Small | Pretendard | 11–12px | 400–700 | 1.40 | normal | Tags and counts; never core instructions |

### Principles
- **Bold/regular binary**: Most text is either 700 (bold) or 400 (regular), with 600 used sparingly. This creates a clear visual hierarchy through weight contrast rather than size variation.
- **Korean action labels**: Use a concrete verb and sentence-style casing; never force uppercase or wide tracking on Korean.
- **Mode-specific sizing**: Operate surfaces stay compact, while Persuade display text may reach 76px and Experience follows the selected portfolio theme.
- **Readable Korean**: Keep body line-height at 1.5–1.7 and use `word-break: keep-all` where wrapping would split phrases awkwardly.

## 4. Component Stylings

### Buttons

**Dark Pill**
- Background: `#1f1f1f`
- Text: `#ffffff` or `#b3b3b3`
- Padding: 8px 16px
- Radius: 9999px (full pill)
- Use: Navigation pills, secondary actions

**Dark Large Pill**
- Background: `#181818`
- Text: `#ffffff`
- Padding: 0px 43px
- Radius: 500px
- Use: Primary app navigation buttons

**Light Pill**
- Background: `#eeeeee`
- Text: `#181818`
- Radius: 500px
- Use: Light-mode CTAs (cookie consent, marketing)

**Outlined Pill**
- Background: transparent
- Text: `#ffffff`
- Border: `1px solid #7c7c7c`
- Padding: 4px 16px 4px 36px (asymmetric for icon)
- Radius: 9999px
- Use: Follow buttons, secondary actions

**Circular Play**
- Background: `#1f1f1f`
- Text: `#ffffff`
- Padding: 12px
- Radius: 50% (circle)
- Use: Play/pause controls

### Cards & Containers
- Background: `#181818` or `#1f1f1f`
- Radius: 6px–8px
- No visible borders on most cards
- Hover: slight background lightening
- Shadow: `rgba(0,0,0,0.3) 0px 8px 8px` on elevated

### Inputs
- Search input: `#1f1f1f` background, `#ffffff` text
- Radius: 500px (pill)
- Padding: 12px 96px 12px 48px (icon-aware)
- Focus: border becomes `#000000`, outline `1px solid`

### Navigation
- Dark sidebar with Pretendard 14px weight 700 for active, 400–600 for inactive
- `#b3b3b3` muted color for inactive items, `#ffffff` for active
- Circular icon buttons (50% radius)
- PortfolioForge brand mark top-left; green denotes its functional active state

## 5. Layout Principles

### Spacing System
- Base unit: 8px
- Scale: 1px, 2px, 3px, 4px, 5px, 6px, 8px, 10px, 12px, 14px, 15px, 16px, 20px

### Grid & Container
- Operate: fixed/collapsible sidebar + task-focused main content
- Persuade: outcome preview near the first viewport, then evidence and process
- Experience: one recruiter scan path from identity to projects, skills, recent work, and contact
- Responsive content fills the remaining space without hiding core actions

### Whitespace Philosophy
- **Operate compression**: Dashboards and editors group related controls tightly and separate tasks generously.
- **Persuade rhythm**: Marketing uses larger intervals and varied compositions; repeated dark sections must have distinct narrative jobs.
- **Experience restraint**: The public portfolio spends space on user work, not Forge chrome.

### Border Radius Scale
- Minimal (2px): Badges, explicit tags
- Subtle (4px): Inputs, small elements
- Standard (6px): Album art containers, cards
- Comfortable (8px): Sections, dialogs
- Medium (10px–20px): Panels, overlay elements
- Large (100px): Large pill buttons
- Pill (500px): Primary buttons, search input
- Full Pill (9999px): Navigation pills, search
- Circle (50%): Play buttons, avatars, icons

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Base (Level 0) | `#121212` background | Deepest layer, page background |
| Surface (Level 1) | `#181818` or `#1f1f1f` | Cards, sidebar, containers |
| Elevated (Level 2) | `rgba(0,0,0,0.3) 0px 8px 8px` | Dropdown menus, hover cards |
| Dialog (Level 3) | `rgba(0,0,0,0.5) 0px 8px 24px` | Modals, overlays, menus |
| Inset (Border) | `rgb(18,18,18) 0px 1px 0px, rgb(124,124,124) 0px 0px 0px 1px inset` | Input borders |

**Shadow Philosophy**: Spotify uses notably heavy shadows for a dark-themed app. The 0.5 opacity shadow at 24px blur creates a dramatic "floating in darkness" effect for dialogs and menus, while the 0.3 opacity at 8px blur provides a more subtle card lift. The unique inset border-shadow combination on inputs creates a recessed, tactile quality.

## 7. Do's and Don'ts

### Do
- Use near-black backgrounds (`#121212`–`#1f1f1f`) — depth through shade variation
- Apply Spotify Green (`#1ed760`) only for play controls, active states, and primary CTAs
- Use pill shape for primary/secondary text actions and circles for icon-only controls
- Use Korean sentence-style labels with a clear action verb
- Match type scale and density to Persuade, Operate, or Experience mode
- Use heavy shadows (`0.3–0.5 opacity`) for elevated elements on dark backgrounds
- Let portfolio previews, project imagery, and user content provide most non-semantic color

### Don't
- Don't use Spotify Green decoratively or on backgrounds — it's functional only
- Don't use light backgrounds for primary surfaces — the dark immersion is core
- Don't use pill geometry for large content containers or every surface
- Don't use thin/subtle shadows — on dark backgrounds, shadows need to be heavy to be visible
- Don't add additional brand colors — green + achromatic grays is the complete palette
- Don't compress Korean body copy below a comfortable 1.5 line-height
- Don't combine a visible border and heavy shadow on the same surface; use hairlines only for grouping

## 8. Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile Small | <425px | Compact mobile layout |
| Mobile | 425–576px | Standard mobile |
| Tablet | 576–768px | 2-column grid |
| Tablet Large | 768–896px | Expanded layout |
| Desktop Small | 896–1024px | Sidebar visible |
| Desktop | 1024–1280px | Full desktop layout |
| Large Desktop | >1280px | Expanded grid |

### Collapsing Strategy
- Sidebar: full → collapsed → hidden
- Album grid: 5 columns → 3 → 2 → 1
- Now-playing bar: maintained at all sizes
- Search: pill input maintained, width adjusts
- Navigation: sidebar → bottom bar on mobile

## 9. Agent Prompt Guide

### Quick Color Reference
- Background: Near Black (`#121212`)
- Surface: Dark Card (`#181818`)
- Text: White (`#ffffff`)
- Secondary text: Silver (`#b3b3b3`)
- Accent: Spotify Green (`#1ed760`)
- Border: `#4d4d4d`
- Error: Negative Red (`#f3727f`)

### Example Component Prompts
- "Create a dark card: #181818 background, 8px radius. Title at 16px Pretendard weight 700, white text. Subtitle at 14px weight 400, #b3b3b3. Use either a hairline or an offset shadow, not both."
- "Design a pill button: #1f1f1f background, white text, 9999px radius, 8px 16px padding. 14px Pretendard weight 700, Korean sentence-style action label."
- "Build a circular icon button: #1f1f1f background, white icon, 50% radius, minimum 44px target, visible focus ring."
- "Create search input: #1f1f1f background, white text, 500px radius, 12px 48px padding. Inset border: rgb(124,124,124) 0px 0px 0px 1px inset."
- "Design navigation sidebar: #121212 background. Active items: 14px weight 700, white. Inactive: 14px weight 400, #b3b3b3."

### Iteration Guide
1. Choose Persuade, Operate, or Experience before choosing scale and density
2. Start product chrome with #121212 and let user work carry the visual focus
3. Use Spotify Green for functional highlights only (active, progress, primary CTA)
4. Use pills for text actions and circles for icon-only controls; keep content surfaces restrained
5. Use concrete Korean verbs and sentence-style labels
6. Use offset shadows for real elevation and hairlines for grouping
