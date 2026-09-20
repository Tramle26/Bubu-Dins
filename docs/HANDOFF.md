# Bubu team handoff — 2026-09-17

## Start here

Follow the [README quickstart](../README.md), then open `/work.path`.
The [Dr.Bos integration guide](../paths/work/dr-boss-chat.guide.md) owns the
current chat/thread architecture, visual vocabulary, extension recipe, and browser
checks. The [visual demo](../paths/work/dr-bos-demo.page.md) works without an AI key.
Historical plans and brainstorms are context, not implementation requirements.

## What is ready

- Dr.Bos chat saves private per-learner PathMX thread Sources, streams validated
  complete Blocks, and restores conversation history. Server-owned IDs, versions,
  cancellation, and one malformed-output repair attempt protect saved work.
- The chat UI has a stable header and bottom composer, responsive overlays,
  message bubbles, history, and draft/focus continuity during live replies.
- Literate components provide steps, comparisons, connected flows, and labeled
  percentage bars. Native Mermaid, Datatype, and Math render in the same thread.
- Inspectable PDF citations accompany retrieved material. Chat and
  housing/investing assessments share `GEMINI_API_KEY`. Chat never changes
  Completion or awards learning credit.
- Setup, component ownership, validation rules, and an agent-ready extension recipe
  are documented in the integration guide. README and AGENTS link to that owner.

## Setup and verification

Install the pinned packages with `bun install --frozen-lockfile`. Build the local
PDF index using the Python virtualenv instructions in README. Configure credentials
in ignored `.env` using `.env.example`; obtain keys privately from the maintainer.
No credentials, generated index, learner progress, or chat history belong in Git.

Run `bun run check`, `bun run typecheck`, and `bun run test`. The handoff baseline
has 18 passing tests / 199 assertions. A clean install of published PathMX 0.6.7
was also checked without relying on a sibling framework checkout.

Browser verification covered real AI charts/graphs/math, phone and desktop layouts,
conversation switching, overlay Escape/focus return, saved threads, and stable
textarea/message DOM identities with a draft preserved during generation.

An iPad Safari report of content disappearing after automatic scrolling led to a
bounded thread-element scroller replacing nested iframe-window scrolling. Opening,
switching, sending, and Sources expansion passed the available browser checks.
**Confirm the latest fix on physical iPad Safari after a full reload.** Physical
mobile keyboard and screen-reader checks are also still useful acceptance work.

## Team-owned next work

- Try representative student questions; improve teaching examples and compare
  models for usefulness, accuracy, latency, and cost.
- Curate the PDF collection: retrieval can include historical or unrelated material.
  A valid citation ID is not proof that the excerpt supports the explanation.
- Extend visuals through the documented component → prompt → validation → test
  workflow. Percentage bars are 0–100; general numeric charts need an explicit scale.
- Decide production authentication, retention/deletion, pagination, and shared
  rate limits before a public rollout. The routed admin login is local development.
- Project workspace drafts remain browser-local. Lesson content, simulations,
  reward-language consistency, and project persistence remain student decisions.

## Ownership

- `paths/`: authored pages, lessons, characters, literate components, and styling.
- `plugins/game/chat*.ts`: provider transport, validation, private thread storage,
  orchestration, and browser interaction; see the guide's file ownership table.
- Completion and assessment modules retain ownership of mastery/learning credit.
- `tests/`: chat privacy/persistence/validation plus curriculum/assessment checks.

## PathMX follow-ups

These are observations for core maintainers, not claims that core fixes shipped:

1. **Missing component registration:** removing a literate componentName comment
   previously left the Bubu home blank. The consumer lint catches it. Core should
   provide an actionable unresolved-component diagnostic and preserve/report the
   last usable preview when authoring errors occur.
2. **Package activation during dev:** adding Player to package.json did not reload
   the running plugin registry. A Player link then failed with “Rich links must name
   one component tag”; restarting activated it. Dev should restart or explicitly
   report that configuration changed instead of serving an opaque 500.
3. **HTML image sizing:** the renderer emits inline object-fit:contain, which wins
   over an authored card's cover rule. Bubu now uses natural 3:2 image boxes. Review
   how HTML authoring exposes fit/ratio overrides and document the intended cascade.
4. **Theme integration guidance:** Work's broad anchor underline and pre background
   overrides caused the reported button/code defects. These were consumer bugs and
   are fixed locally. A documented recipe for prose links vs button links, inline
   code vs fenced code, and auth details vs lesson disclosures would prevent repeats.

Review these against current core before opening or fixing issues. The consumer
uses pinned 0.6.7 packages; no core package was modified for this polish pass.
