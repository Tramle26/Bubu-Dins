---
title: Start the implementation agent
version: 1.0
---

# Paste this into the implementing agent

You are implementing the Bubu financial-learning hackathon demo in the repository available to you. The supplied `bubu-handoff/` folder is the implementation brief, not an already-working application.

Read the repository's existing agent instructions first. Then read `bubu-handoff/README.md`, `HANDOFF.md`, `PATHMX_INTEGRATION.md`, `SIMULATIONS.md`, `DR_BOSS.md`, and `ACCEPTANCE.md`. Consult `ASSET_GUIDE.md` before generating or integrating art. Read the supplied sketches and the relevant art references directly; they describe the intended game-like UX and soft textured 2D illustration style.

Preserve the user's requested stack: PathMX Sources/Blocks/Paths, custom layouts, literate components, CSS, SVG, and generated isolated art, with small TypeScript plugins for behavior. Do not build an unrelated React SPA or game engine. Do not replace repository conventions or reinitialize a nonempty directory. Use the installed PathMX documentation/types and current docs to verify every integration API. Project-owned interfaces in this brief are not native PathMX APIs.

First produce `docs/integration-audit.md` identifying the exact versions, commands, working layout/component/Action/Actor patterns, storage/credential setup, and any actual Ada/Project 3 agent reference. Do not invent a missing reference. Establish a narrow adapter and record missing integration inputs while continuing independent work.

Implement in small, tested milestones. Begin with a durable end-to-end housing slice, not a gallery of mock screens: topic → Learn → Practice → Review → accepted pass → one-time +100 coins → House provision for 40 coins → deterministic comparison → saved reflection → refresh/resume. Add Investing using the same infrastructure. Conduct an early live-provider smoke test; do not defer discovering missing AI credentials/capabilities until the end. Fixture tutor mode must be labelled and must use separate state.

Treat the specified defaults as actionable unless contradicted by repository facts or new user directions. Record deviations with reasons. Ask only for genuinely blocking missing inputs; do not stall on reversible copy, color, or placeholder choices. Do not make unapproved broad dependency upgrades or spend on image-generation batches automatically. Reuse approved supplied assets where suitable; otherwise use explicit temporary placeholders and the provided asset prompts. Never claim a placeholder or an ungenerated manifest entry is an approved game asset.

Keep financial mathematics in deterministic code and compare it with `fixtures/expected-results.json`. Keep grades, ledger records, and entitlements service-controlled. Never let browser-supplied balances, grades, target paths, or actor IDs authorize changes. Model requests must run outside storage transactions; stale responses must not apply to newer answers. Protect against duplicate/replayed awards and spending, including concurrent tabs and ambiguous write outcomes.

At each milestone run the actual repo's lint/typecheck/tests, open representative browser screens, inspect screenshots at 1366×768 and 1024×768, and fix clipping, tiny labels, inaccessible controls, and mismatched state. Automated checks do not replace visual review. Source links and map/list navigation must remain real and usable.

Before declaring completion, execute `ACCEPTANCE.md`, report pass/fail/not-run outcomes, test a provider failure and a server restart, and supply startup instructions, a content-authoring guide, asset provenance, screenshots, and a five-minute demo script. State the exact remaining gaps. Do not equate a clean build, fixture-only AI, or an attractive static screenshot with a complete implementation.
