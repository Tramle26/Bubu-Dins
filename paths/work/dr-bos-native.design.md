---
title: Dr.Bos as a live PathMX document
---

[@layout]: ../layouts/work.layout.md

# Dr.Bos as a live PathMX document

Status: first prototype implemented, September 17, 2026. The current contract,
student instructions, limits and extension points live in the
[integration guide](./dr-boss-chat.guide).

[Try Dr.Bos](../dr-boss.page) · [Inspect the visual vocabulary](./dr-bos-demo.page)

## The pattern being tested

One private, append-only PathMX thread is both the durable conversation and the
rendered document. Dr.Bos speaks a constrained subset of PathMX, including literate
steps, connected flow graphs, and comparison components, plus native Mermaid, Datatype, and math. The team owns the visuals and teaching examples.
The server owns identity, metadata, validation, history and persistence.

Complete validated Blocks arrive incrementally through the existing PathMX live
runtime. No core API changes, custom Markdown renderer, React chat surface, or
separate diagram engine were needed. This is a consumer experiment for a possible
future official plugin, not a published reusable contract yet.

---

## Existing work reused

Primer 1 supplies the conceptual thread/message model. Ada demonstrates saved
server-owned history, Gateway streaming, idempotency and optimistic concurrency.
Both intentionally restrict executable model markup. Dr.Bos adds a small approved
literate-component grammar without adopting their quiz or outcome models.

PathMX's token-streaming transport is implemented and has a browser gauntlet for
coalescing, final convergence, scroll and Play continuity. Conservative repair of
incomplete Markdown is still shaping. This prototype uses complete Block boundaries
and leaves token-preview repair out of the durable Source.

Relevant framework records: `apps/pathmx-work/paths/designs/token-streaming.design.md`,
`test/e2e/token-streaming.e2e.ts`, and
`apps/pathmx-work/paths/research/2026-09-13-comark-streaming.research.md` in PathMX.

---

## Decisions to revisit from evidence

Start with Ada's `openai/gpt-5.6-sol` through AI Gateway. Compare Sonnet 4.6 and the
old GPT-4.1-mini baseline on the same teaching cases before choosing a long-term
model. Provider configuration for chat is separate from assessment configuration.

Keep this implementation local until another consumer demonstrates the reusable
boundary. Likely candidates are the allowed authoring vocabulary, thread storage,
and stream lifecycle. Bubu's character, lesson retrieval, assessment separation,
and visual styling remain product concerns.

The initial inspection also found browser-local project workspace drafts,
inconsistent descriptions of housing coins versus investing credit, and a reference
collection mixing financial education with historical self-help material. These
remain team decisions outside this chat prototype. The original student code edits
were preserved while replacing the old chat renderer.
