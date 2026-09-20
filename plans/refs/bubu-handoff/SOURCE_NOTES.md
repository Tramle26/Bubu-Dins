---
title: Requirements provenance and verified references
version: 1.0
verified: 2026-09-15
---

# Sources and limits

## User-provided evidence

The brief is based on Mark's pasted transcription dated Tuesday, September 15, 2026 and seven supplied images. The transcription supplies the product intent, college-only hackathon scope, landscape presentation, two character roles, lesson structure, currency loop, housing/investing examples, proposed PathMX scaffold, and Ada/Project 3 reference. Hackathon sponsorship, schedules, and future deadlines are not independently verified or enacted by this package.

Original images, preserved unchanged in `references/`:

| File | Used for |
| --- | --- |
| `drawings-screens-1.png` | Dashboard → topics → lesson journey; portfolio, workspace, chat, and world entrances |
| `drawings-screens-2.png` | Town destinations and a distinct professor-like character |
| `art-ref-bubu-mascot-1.png` | Primary Bubu character identity and palette |
| `art-ref-bubu-mascot-2.png` | Secondary Bubu expression/pose suggestions; not an equal competing identity master |
| `art-ref-professor.png` | Proposed Dr.Bos visual identity: rectangular glasses, goatee, cream coat, vest/tie |
| `art-ref-bus-map.png` | Soft textured environment, yellow bus, warm illustrated world |
| `art-reference-forest-path.png` | Winding-route composition only; stock watermark retained; not a generation edit input or runtime asset |

Character mapping is a proposal: use the professor reference for Dr.Bos and the younger round-glasses mascot for Bubu unless Tram's separate Dr.Bos reference supersedes it. The exact “AI Jackpot” name is not confirmed.

## PathMX references inspected

- [Agent workflow and Markdown documentation access](https://docs.pathmx.dev/docs/agents)
- [Quickstart and project-owned dependencies](https://docs.pathmx.dev/docs/start/first-site.guide)
- [Layouts](https://docs.pathmx.dev/docs/site/layouts.reference)
- [Literate components and lifecycle](https://docs.pathmx.dev/docs/authoring/components.reference)
- [Custom plugin guide](https://docs.pathmx.dev/docs/extend/plugins.guide)
- [Plugin API reference](https://docs.pathmx.dev/docs/extend/plugins.reference)
- [Actions](https://docs.pathmx.dev/docs/extend/actions.reference)
- [Paths](https://docs.pathmx.dev/docs/learning/path.reference)
- [Assessment](https://docs.pathmx.dev/docs/learning/assessment.reference)
- [Completion](https://docs.pathmx.dev/docs/learning/completion.reference)
- [Player](https://docs.pathmx.dev/docs/learning/player.reference)

These establish platform capabilities, not installed-version compatibility. The destination repo and its pinned types are the implementation evidence. No source code for Mark's Ada/Project 3 tutor is included or claimed to have been inspected.

## OpenAI image references inspected

- [GPT Image prompting guide](https://developers.openai.com/api/docs/guides/image-prompting)
- [Image generation guide](https://developers.openai.com/api/docs/guides/image-generation)
- [Image edit API](https://developers.openai.com/api/reference/resources/images/methods/edit/)
- [GPT Image 2.5 Sunburst model](https://developers.openai.com/api/docs/models/gpt-image-2.5-sunburst)
- [Transparent-assets workflow](https://developers.openai.com/cookbook/examples/multimodal/transparent-image-assets-for-campaigns-and-presentations)

As checked for this handoff, documented model IDs include `gpt-image-2.5-sunburst` and `gpt-image-2.5-flare`. The asset guide's model/prompt workflow is designed for these models but has **not** been empirically benchmarked on the supplied references. No new assets were generated while preparing the package. Availability in a particular account/UI must be checked at use time.

## Financial concept references inspected

- [CFPB: consider the timing and trade-offs of buying](https://www.consumerfinance.gov/owning-a-home/prepare/consider-whether-its-the-right-time-for-you-to-buy/)
- [CFPB: figure out how much to spend](https://www.consumerfinance.gov/owning-a-home/prepare/figure-out-how-much-you-want-to-spend/)
- [CFPB: homebuying financial considerations](https://www.consumerfinance.gov/ask-cfpb/what-are-some-of-the-financial-considerations-of-buying-a-home-en-119/)
- [Investor.gov: asset allocation and diversification](https://www.investor.gov/introduction-investing/getting-started/asset-allocation)

These ground the broad concepts. They do **not** supply the fictional prices, rates, market sequences, expected returns, or default learner finances used in the fixture. Those are explicitly authored teaching assumptions. The numerical results are calculations from those assumptions.

## Inputs still to be resolved in the implementation repo

Actual PathMX version/host; Ada/Project 3 source; actual tutor provider/model/credentials; the team's selected finance text or repository; Tram's separate Dr.Bos reference if different; final product name; approval of rubrics and character masters. The handoff gives reversible defaults so independent implementation can proceed without pretending these inputs have been supplied.
