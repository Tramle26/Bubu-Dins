---
title: Bubu repository instructions fragment
version: 1.0
---

# Merge into existing project instructions

Do not overwrite the destination `AGENTS.md`. Merge the relevant rules below and replace command placeholders with verified repository commands.

## Product boundaries

Bubu is a college-only, landscape-first demo: two topics (housing/investing), three activities each (Learn/Try/Review), Dr.Bos as tutor/evaluator, Bubu as authored encouragement, earned coins, and a clickable Storyworld. Only House and Bank are simulations. Preserve PathMX as the content/application foundation.

## Implementation rules

- Read `bubu-handoff/HANDOFF.md` and the integration audit before changing architecture.
- Verify installed APIs; project-owned `bubu.*` names are not built-ins. Never guess an agent package.
- Use Markdown Sources, stable IDs, custom `.layout.md` files, and literate `.components.md` for reusable presentation. Use plugins for computed projections, operations, and integrations.
- Keep shared compilation free of viewer data. Derive learner identity from admitted server context.
- Financial results come from tested deterministic code. Tutor outputs cannot directly mutate grades or wallets.
- Preserve idempotency, actor isolation, private service-controlled records, and stale-response checks.
- Do not silently turn a live-provider error into a scripted passing answer.
- Generated art is decoration; HTML/SVG owns labels, controls, roads, and charts. No watermarked reference derivatives in runtime assets.
- Keep placeholders, fixture tutor mode, fictional assumptions, and unimplemented previews visibly honest.
- Do not overwrite existing user edits, reset unrelated data, leak credentials, or auto-admit public users to one shared account.

## Verification

Record actual install/dev/lint/typecheck/test commands in the integration audit. After each coherent change, run relevant checks and inspect browser output. Before handoff, execute `bubu-handoff/ACCEPTANCE.md` and include target-size screenshots. Mark unrun tests as unrun.
