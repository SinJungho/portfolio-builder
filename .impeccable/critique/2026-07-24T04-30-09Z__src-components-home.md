---
target: src/components/home
total_score: 26
max_score: 28
na_heuristics: 7,9,10
p0_count: 0
p1_count: 0
timestamp: 2026-07-24T04-30-09Z
slug: src-components-home
---
# Critique — src/components/home (4th pass)

Method: dual-agent (A: a55ffdc · B: a1efeb8). Persuade surface.

## Design Health Score
Total 26/28 (Excellent, 93%). n/a 7,9,10. Trend 22 -> 26 -> 24 -> 26. Regression recovered, no P0/P1.
1 Visibility 4; 2 Match 4; 3 Control 4; 4 Consistency 3 (내 주소로 공개 echoes HowItWorks step 4; Sparkles overused); 5 Error prevention 4; 6 Recognition 4; 8 Aesthetic 3 (residual overlap + floaty whitespace before SocialProof).

## Verdict
P1 Features<->SocialProof redundancy genuinely resolved (verified cell-by-cell). 예시 badge resolved 배포완료 ambiguity. Detector clean (exit 0 x2), console clean, both fixes browser-confirmed. Strongly bespoke.

## Priority Issues (no P0/P1)
[P2] Redundancy migrated: "내 주소로 공개 / 링크 공유" now in SocialProof + HowItWorks step 4 + StepVisualDeploy. Fix: shift SocialProof cell 2 to ownership/no-lock-in; keep link-share only in deploy step.
[P3] "무료로 시작" echoes FinalCTA verbatim. Fix: vary wording, lead SocialProof with no-signup/reversibility.
[P3] SocialProof cell-set coherence: claims grammatically heterogeneous; Sparkles icon has no cost meaning + most-reused glyph. Fix: parallel noun-phrases + cost icon (Gift/Wallet).

## Structural questions (not urgent)
1. Section named SocialProof but contains zero social proof (Testimonials removed) — reframe as 안심 guarantees until real proof exists.
2. Do HowItWorks and Features earn separate existence? Both narrate 고르고->다듬고->최신유지. Features may be a richer re-skin of HowItWorks. Deeper distill question.

## Strengths
Objection-handler reframe works (redundancy vs Features fully gone). 예시 badge effective. Bespoke consistent visual system, persona jaemin-dev consistent. A11y solid (tablist aria, motion-reduce wired).
