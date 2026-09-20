---
title: Part 2 investing lesson
---

[@layout]: ../layouts/work.layout.md

# Maintain the investing foundation

Learn links to `/investing.page`, then Learn → Try it → Review.
The page supplies its own Source ID to the shared `x-bubu-journey` component.
Its ordered lesson links drive the same map, locks, list view, and live completion
as Housing choices. The default journey remains housing. The existing housing
coin badge is unchanged; investing derives $20/$30/$40 in learning credit from Learn/Try it/Review Completion.
Content lives in `paths/lessons/foundation/`. Preserve the existing lesson filenames
so learners retain their PathMX Completion acknowledgment.

Scope: *First-Time Investor: Grow and Protect Your Money*, Paul A. Merriman with
Richard Buck (2012), Part 2, printed pages 9–15 (PDF pages 26–32), items 11–18.
The source PDF is in `materials/`, beginning `01.First-Time-Investor-`.
The seven contents-page topics group the diversification items together.
“Home sweet home” concerns geographic diversification, not housing.

Learn is a four-minute read with one short section per topic. Graphs and source
details are optional disclosures. Examples and graphs are original teaching aids.
IRS and SEC links qualify the book's tax and risk claims. The 10% savings benchmark
is attributed to the author, not presented as a universal prescription. The large
lifetime illustration combines withdrawals and a bequest, not a retirement-date
balance or a guaranteed return.

Graph sources: `paths/assets/foundation-fees.svg` and `foundation-growth.svg`.
Regenerate with `python3 scripts/build-foundation-charts.py`. Fee graph:
`1000 * (1 + 0.07 - fee)^40`. Growth graph: year-end deposits,
`5000 * ((1 + r)^n - 1) / r`. Values are nominal, exclude taxes, and use
constant hypothetical returns. Captions and alt text include assumptions.

Try it has three short scenarios with optional explanations. Review has a typed
answer and server-side AI feedback, saved privately per learner. Its expectations
live in [Investing review expectations](./investing-review.guide.md). The server validates feedback against the existing four criteria and saves a pass
when all are met; PathMX derives Review Completion from that saved pass. Learn
and Try it remain acknowledgments. Credit totals $90, does not duplicate on
revisits, and reflects current Completion. It is a learning reward, not a spendable wallet.

[Open the learning sequence](/investing.page)
