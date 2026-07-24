---
target: src/components/home
total_score: 22
max_score: 28
na_heuristics: 7,9,10
p0_count: 1
p1_count: 1
timestamp: 2026-07-24T01-43-21Z
slug: src-components-home
---
# Critique — src/components/home (PortfolioForge marketing home)

Method: dual-agent (A: a969e1b93 design review · B: a0e2050bc detector + browser). Persuade surface.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | On mobile the selected Features content renders below the fold |
| 2 | Match System / Real World | 4 | Natural Korean voice, accurate GitHub metaphors |
| 3 | User Control and Freedom | 3 | No persistent CTA on mobile scroll |
| 4 | Consistency and Standards | 2 | Token drift + contradictory time/price/domain claims |
| 5 | Error Prevention | 3 | Hero GitHub CTA gives no preview of OAuth scope |
| 6 | Recognition Rather Than Recall | 4 | Everything visible |
| 7 | Flexibility and Efficiency | n/a | Single linear persuade path |
| 8 | Aesthetic and Minimalist | 3 | Generic filler in SocialProof/Testimonials/FinalCTA |
| 9 | Error Recovery | n/a | No error states |
| 10 | Help and Documentation | n/a | Persuade surface |
| Total | | 22/28 | Good (79%) |

## Design Specificity Verdict
Two pages stitched together. Mid-funnel (MockPortfolio, StepVisual*) is bespoke and excellent — shows GitHub->portfolio. Trust sections (SocialProof, Testimonials, FinalCTA) are generic AND fabricated; Testimonials drops out of spotify-* into shadcn tokens. Detector clean (exit 0, [] findings) on all runs; heading order/ARIA/img-alt all correct. Only nit: #1ed760 duplicates spotify-green token. Browser clean, no overflow/overlap; contrast disagreement between computed (A) and eyeballed (B).

## Priority Issues
[P0] Fabricated proof presented as genuine (credibility/ethics). Testimonials "진짜 후기예요" over invented 카카오/토스/네이버; SocialProof 94%/12,400+/4.9. PRODUCT.md records all as placeholders. Fix: remove company names or mark illustrative; replace stats with verifiable product facts; never label placeholder quotes real.
[P1] Contradictory claims (consistency). 평생 무료 vs paid pricing; 3분 vs 1분 vs 오늘 완성; domain shown 3 ways + third-party deploy targets contradict the subdomain differentiator. Fix: one time claim, one domain model, one pricing story.
[P2] Reduced-motion not honored globally (a11y). Reveal.tsx/Hero.tsx animate unconditionally; only Features.tsx guards. Fix: gate behind prefers-reduced-motion.
[P2] Low-contrast micro-typography (a11y/typography, needs verification). 11-13px labels at spotify-silver/60-70 ~4.0-4.5:1 on #121212. Fix: full #b3b3b3+, >=14px.
[P3] Features mobile interaction + no sticky mobile CTA (interaction/responsive). Tab selection renders below fold; redundant dot pager; nav has no start button. Fix: accordion on mobile, add compact mobile header CTA.

## Persona Red Flags
Jordan: no OAuth-scope preview before /login; baited by 평생 무료 -> paid pricing. Casey: long scroll before value, off-screen tab answer, 4px calendar, no sticky CTA. Sam: borderline-AA labels, reduced-motion ignored, preview anchor not focusable.

## Minor Observations
SocialProof green only on hover (decorative accent). MockPortfolio 1,428회 hardcoded but calendar pulls torvalds live data. Hero h1 whitespace-nowrap clipping risk at ~1024px. #1ed760 duplicates token. Mock models 128-star dev (intimidating to juniors?).

## Questions to Consider
1. Would deleting SocialProof/Testimonials convert better than fabricated proof?
2. AI curation is the moat but the page hides the word "AI" — deliberate or underselling?
3. Should bespoke sections open/close the page instead of being buried mid-funnel?
