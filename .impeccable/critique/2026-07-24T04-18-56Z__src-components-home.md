---
target: src/components/home
total_score: 24
max_score: 28
na_heuristics: 7,9,10
p0_count: 0
p1_count: 1
timestamp: 2026-07-24T04-18-56Z
slug: src-components-home
---
# Critique — src/components/home (3rd pass, after P2+P3 fixes)

Method: dual-agent (A: a41a40d · B: a53a471). Persuade surface.

## Design Health Score
Total 24/28 (Good, 86%). n/a 7,9,10. Trend 22 -> 26 -> 24. Deliberate -2 from SocialProof redesign trade.
1 Visibility 3 (배포 완료 pill ambiguous as visitor status); 2 Match 4; 3 Control 3; 4 Consistency 3 (SocialProof icon+claim motif now near-identical to Features); 5 Error prevention 4; 6 Recognition 4; 8 Aesthetic 3 (same 3 value props stated 3x).

## Design Specificity Verdict
Strongly specific, no caveat. Detector clean (exit 0, []). Console clean. Browser-confirmed: SocialProof icon+claim+support rows (not stats); footer plain voice; jaemin-dev.portfolioforge.app in mock+deploy; frosted header separates on scroll. 0 yourname variants remain.

## Key finding: SocialProof redesign trade
Fixed fake-metric grammar (succeeded) but sharpened cross-section redundancy. SocialProof claims now duplicate Features/HowItWorks copy (auto-update, no-code). Old terse metric strip didn't compete; new claim rows do. This is the -2.

## Priority Issues (no P0)
[P1] Value-prop redundancy SocialProof <-> HowItWorks <-> Features (same 3 props near-verbatim). Fix: differentiate SocialProof to objection-handling Features doesn't cover (keep 공개 데이터만 + 내 주소로 공개; swap auto-update/no-code for trust/ownership/speed). 
[P2] Hero mock "배포 완료" badge ambiguous — first-timer may read as own status. Fix: label as 예시 or soften caption.
[P3] Features tab title truncate near clip on ~360px. Fix: two-line wrap below sm or text-[17px].
[P3 false alarm] "low-contrast small text": silver/70 = 4.94 PASS; SocialProof support = full silver 8.93. Not an actual failure.

## Strengths
Product mocks do the persuading (biggest asset). Features interaction excellent (roving tabIndex, arrow keys, motion-reduce). 3/4 fixes landed clean (footer human, slug identity coheres, header frost). Casey/Jordan personas well-served, no red flags.

## Questions
1. Hero mock already IS proof — does guarantee band add trust or delay reaching how-it-works?
2. What is lost by deleting the two SocialProof cells that duplicate Features?
3. AI curation moat under-sold while other 3 differentiators over-repeated — which section owns AI curation?
