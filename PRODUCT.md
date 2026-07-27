# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary user: **a Korean developer preparing for employment or a job change** — junior to mid-level — who already has GitHub activity but no presentable portfolio, and who is not confident in design or writing. Their situation is active job-seeking for the domestic (Korean) market; the job to be done is "turn what I've already built into something a recruiter can understand at a glance, without spending days on it."

Secondary audiences (confirmed by product surface, not the primary target): **bootcamps and small teams** (a Team plan supports up to ~10 members with shared/private templates and team analytics). English (`en`) is supported alongside Korean, but Korean is the default and fallback language and the primary market is Korea.

## Product Purpose

PortfolioForge turns a developer's GitHub activity — projects, tech stack, contributions — and optional blog feed into a recruiter-ready portfolio site. It exists to remove the gap between "I have shipped real work" and "I have something worth showing," for people who have the substance but lack the time, design skill, or writing confidence to assemble it themselves. Success is the user publishing a portfolio they are proud of — one they'd point a recruiter to — in an evening rather than a week.

## Positioning

Four mechanisms define the product and must be preserved. A neighboring "portfolio template site" copies none of them fully:

1. **GitHub auto-sync** — connect once and it's done. New commits, stars, and repositories keep the published portfolio current automatically; the user does not re-edit to stay up to date.
2. **AI curation** — it does not dump every repository. It selects the projects worth featuring, orders them, and rewrites descriptions into something readable.
3. **No-code real-time editing** — drag blocks, change colors, adjust copy, and the result updates in place. You edit what you see; code knowledge is not required.
4. **Instant publish to your own address** — the finished portfolio goes live at a personal subdomain immediately and is shareable by link; custom domains are a paid upgrade.

## Operating Context

- **Connect:** the user authenticates with GitHub (OAuth) and optionally links a blog/RSS feed; the product ingests raw projects and activity.
- **Curate & edit:** the user picks which projects to show, chooses a template, and edits blocks (hero, project grid, skills, blog feed, contact) live in an editor with drag-and-drop reordering, theme/color/typography controls, and a custom-CSS escape hatch.
- **Publish & share:** the portfolio is published to a personal subdomain (paid: custom domain), shared by link, and can be exported to PDF.
- **Measure:** a visitor-analytics dashboard tracks how the published portfolio performs.
- **The evaluating scene:** the end audience is a **recruiter or hiring manager scanning quickly** — the portfolio must be legible and credible in seconds, not studied.

## Capabilities and Constraints

Confirmed functionality (from the implemented product):

- GitHub OAuth sign-in and integration (`next-auth`); webhook-driven updates on GitHub activity.
- Blog/feed integration (RSS/blog feed items surfaced as a block).
- AI pass over ingested data for project selection and description rewriting (OpenAI).
- Block-based editor: hero, project grid, skills, blog feed, contact blocks; drag-and-drop reordering (`dnd-kit`).
- Design controls: template/theme selection, color customizer, typography/detail controls, custom CSS editor, and an in-editor accessibility (contrast) check.
- Publishing to a per-user subdomain via a public `[slug]` route; PDF export (headless Chromium).
- Visitor analytics dashboard; account/settings and integrations management.
- Internationalization: Korean (default + fallback) and English.
- **Plan structure** (three tiers exist in the product): a free tier (single portfolio, basic templates, subdomain), a paid individual tier (unlimited portfolios, all premium templates, custom domain, visitor analytics, priority support), and a team tier (up to ~10 members, private templates, team analytics reports, dedicated onboarding). **The specific prices/numbers shown on the marketing page are placeholders — see Evidence on Hand — and are not confirmed pricing.**

## Brand Commitments

- **Name:** PortfolioForge (Korean shorthand "포지"; the personal publishing address is referred to as the "포지 도메인" / subdomain).
- **Voice:** Korean-first, warm and conversational — plain-spoken, reassuring, and slightly casual (copy uses friendly "~돼요/~네요" register), aimed at someone anxious about self-presentation. It reassures ("코드는 몰라도 괜찮아요", "디자인엔 자신 없어도"), rather than boasting about technology.
- The Spotify-inspired dark visual language is recorded separately in `DESIGN.md` and is not restated here.

## Evidence on Hand

**Currently there is NO real proof of any kind. All of the following on the marketing home are placeholders and must not be treated as, cited as, or presented as fact in future work:**

- **Testimonials** — the quotes attributed to 박지현/카카오, 이도윤/토스, 김민서/네이버 (`src/components/home/Testimonials.tsx`) are fabricated example content, not real customers.
- **Statistics** — figures such as "취업 성공률", "생성된 포트폴리오", "평균 생성 시간", "사용자 만족도" (`src/components/home/SocialProof.tsx`) are placeholders, not measured metrics.
- **Pricing numbers** — the amounts in `src/components/home/Pricing.tsx` are placeholders; only the three-tier *structure* is a real product fact.

Real content that does exist: the working product itself (its editor and published-portfolio output) is the strongest available demonstration. Future work must source any claim, quote, or number from real data before publishing it, or clearly frame it as illustrative.

## Product Principles

1. **The user already did the hard part.** The product's job is to reveal existing work, not to make the user produce more. Every flow should feel like "surfacing," not "authoring."
2. **Reassure the design-anxious.** The primary user doubts their taste and writing. Defaults must be good enough to ship as-is; editing is optional refinement, never a prerequisite.
3. **Recruiter-legible in seconds.** The end artifact is judged in a fast scan. Curation, ordering, and clarity of the *published portfolio* outrank breadth or completeness.
4. **Connect once, stays current.** Auto-sync is a promise: the live portfolio should reflect the user's latest work without them returning to maintain it.
5. **Honest proof only.** Because current social proof is placeholder, credibility must be earned with the real product and real data — never manufactured.

## Accessibility & Inclusion

- The editor includes an in-product **contrast/accessibility check** for the portfolios users build, signaling that legible, accessible *output* is a product value (`src/components/features/editor/design/AccessibilityAlert.tsx`).
- Korean is the primary language with English supported; interface copy must remain natural in Korean first.
