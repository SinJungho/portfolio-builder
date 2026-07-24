---
target: src/components/home
total_score: 26
max_score: 28
na_heuristics: 7,9,10
p0_count: 0
p1_count: 0
timestamp: 2026-07-24T03-14-06Z
slug: src-components-home
---
# Critique — src/components/home (re-run after fixes)

Method: dual-agent (A: ac28437 · B: ab27955). Persuade surface.

## Design Health Score
Total 26/28 (Excellent, 93%). Heuristics 7,9,10 n/a. Trend 22 -> 26 out of 28.
1 Visibility 4; 2 Match 4; 3 Control 3; 4 Consistency 3 (jaemin-dev vs yourname slug); 5 Error prevention 4; 6 Recognition 4; 8 Aesthetic 4.

## Design Specificity Verdict
Now clearly authored-for-PortfolioForge, no caveat. Detector clean (exit 0, []). Console clean. Browser-confirmed: Testimonials removed; SocialProof shows 4 real facts; FinalCTA "신용카드 불필요 · 무료로 시작"; deploy visual yourname.portfolioforge.app + HTTPS/커스텀 도메인/링크 공유. All fixes landed.

## What's Working
Honesty upgrade fully landed (reads more credible). SocialProof flipped from pressure to trust beat (privacy reassurance). Strong peak-end ("오늘 저녁 채용 담당자에게 보낼 링크"). A11y verified: contrast AA pass, reduced-motion guards present, ARIA tablist intact.

## Priority Issues (no P0/P1)
[P2] Sticky header overlaps content on scroll (transparent nav collides with section headings). Fix: solid/backdrop-blur bg + scroll-mt on headings.
[P2] SocialProof "stat" typography vs non-stat content — claim-phrases styled as metric numbers cause a re-read. Fix: differentiate treatment (caps label + support line, or icon so they read as guarantees).
[P3] Placeholder slug inconsistency: jaemin-dev vs yourname. Pick one convention.
[P3] Footer tagline reverts to AI-marketese; rewrite in plain section voice.

## Persona Red Flags (all low risk)
Jordan: ranked CTAs, microcopy answers needs. Casey: source responsive clean but NOT verified live at 390px (browser clamped ~960px). Sam: ARIA/focus/motion/contrast verified.

## Honest gap
Removing Testimonials killed fabrication (right call) but removed peer-proof lever. Mocks give competence proof not peer proof. Earliest honest replacement: live gallery of real generated portfolios ({slug}.portfolioforge.app links).

## Questions
1. Move "오늘 저녁 채용 담당자에게 보낼 링크" to Hero sub-headline?
2. Show a before->after of messy GitHub becoming clean portfolio?
3. SocialProof four facts as one reassurance sentence vs metrics band?
