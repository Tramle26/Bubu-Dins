---
title: Bubu — implementation handoff
version: 1.0
prepared: 2026-09-15
status: implementation specification, not a runnable application
---

# Bubu: implementation handoff

A build brief for Mark, Tram, and an implementation agent. The working product is a college-focused financial-literacy demo built on **PathMX**, with an illustrated lesson journey, a clickable Storyworld, an AI tutor named **Dr.Bos**, and a motivational companion named **Bubu**.

**The product loop:** learn → practice → demonstrate understanding → earn coins → use them in fictional simulations → explain and revise.

## Start here

Give the agent this folder alongside the destination repository. Start it with [`IMPLEMENTER_PROMPT.md`](IMPLEMENTER_PROMPT.md). It should read [`HANDOFF.md`](HANDOFF.md), then [`PATHMX_INTEGRATION.md`](PATHMX_INTEGRATION.md), and begin the discovery gate before changing application code.

| File | Purpose |
| --- | --- |
| [HANDOFF.md](HANDOFF.md) | Authoritative product scope, screens, architecture, state, milestones, and completion criteria |
| [PATHMX_INTEGRATION.md](PATHMX_INTEGRATION.md) | Verified platform capabilities; version checks; integration boundaries; no invented APIs |
| [SIMULATIONS.md](SIMULATIONS.md) | Exact fictional housing and investing models, constraints, accounting, and test requirements |
| [DR_BOSS.md](DR_BOSS.md) | Tutor behavior, review rubric, server evaluation flow, grounding, and safety |
| [ACCEPTANCE.md](ACCEPTANCE.md) | Functional, financial, AI, security, art, accessibility, and presentation tests |
| [ASSET_PROMPTS.md](ASSET_PROMPTS.md) | All 20 image prompts in one copyable document |
| [ASSET_GUIDE.md](ASSET_GUIDE.md) | Art direction, reference selection, GPT Image 2.5 settings, generation order, and quality checks |
| [IMPLEMENTER_PROMPT.md](IMPLEMENTER_PROMPT.md) | Paste-ready instructions to start another coding agent |
| [AGENTS.fragment.md](AGENTS.fragment.md) | Instructions to merge into—not overwrite—the repository's existing AGENTS.md |
| [SOURCE_NOTES.md](SOURCE_NOTES.md) | Requirements provenance, verified documentation, and unresolved source inputs |
| `prompts/images/` | Standalone asset prompts, one file per intended output |
| `prompts/tutor/` | Proposed runtime tutor and evaluator system prompts |
| `contracts/domain.ts` | Framework-independent domain contract sketch; not a PathMX API implementation |
| `fixtures/` | Fictional inputs, expected numerical outputs, and review-evaluation cases |
| `assets/manifest.json` | Planned runtime asset contracts and status; no generated artwork is claimed |
| `assets/generation-plan.json` | Prompt/reference dependencies and request settings |
| `references/` | The seven original user-supplied sketches/art references, unchanged |
| `tools/reference_math.py` | Executable reference calculations and fixture verification; not production financial software |

## Deliverable boundary

This package specifies the application. It does **not** contain a configured PathMX repository, credentials, an implementation of the Ada agent, approved financial courseware, or newly generated game assets. The reference calculation tool is included to make the numerical requirements testable.

The original files are reference material, not automatically cleared production assets. Do not publish the `references/` folder as part of the app. In particular, the watermarked forest image is a composition reference only; do not remove its watermark, cut it into runtime assets, or use it as an edit input.

## Defaults, not hidden decisions

The user's meeting notes determine the college-only demo, landscape presentation, two characters, three activity types, earned currency, and housing/investing focus. Exact copy, fictional numbers, currency rules, coordinates, and acceptance thresholds in this package are **proposed implementation defaults**. Use them unless Mark or Tram changes them. Record changes in a decision log and update fixtures together.

“AI Jackpot” may be a transcription error. Use **Bubu** as the configurable project name and retain **Dr.Bos** / **Bubu** as separate character display names. Do not implement casino mechanics.

## Quick validation of this handoff's math

From this folder:

```bash
python3 tools/reference_math.py --check
```

This checks included numerical fixtures. It is not evidence that the eventual PathMX app, AI behavior, or art pipeline has been implemented or tested.
